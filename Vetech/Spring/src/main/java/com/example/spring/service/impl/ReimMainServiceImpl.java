package com.example.spring.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.spring.dto.*;
import com.example.spring.entity.*;
import com.example.spring.exception.BizException;
import com.example.spring.mapper.*;
import com.example.spring.service.ReimMainService;
import com.example.spring.vo.ReimDetailVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 报销单核心业务服务实现
 *
 * 关键技术点：
 * 1. @Transactional 事务控制 — 确保级联操作（主表+行程+补助+日历+分摊）的数据一致性
 * 2. @Version 乐观锁 — 防止并发修改冲突
 * 3. 行程唯一性校验 — 同一报销单内出行人员+日期范围不可重叠
 * 4. 分摊比例100%校验 — 提交时必须精确核对
 */
@Slf4j
@Service
public class ReimMainServiceImpl implements ReimMainService {

    @Autowired private ReimMainMapper mainMapper;
    @Autowired private ReimTripMapper tripMapper;
    @Autowired private ReimSubsidyMapper subsidyMapper;
    @Autowired private ReimSubsidyCalendarMapper calendarMapper;
    @Autowired private ReimCostAllocationMapper allocationMapper;
    @Autowired private ReimCityMapper cityMapper;

    // ──────────── 报销单 CRUD ────────────

    @Override
    public IPage<ReimMain> pageQuery(ReimPageDTO dto) {
        LambdaQueryWrapper<ReimMain> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(dto.getReimbursementNo()), ReimMain::getReimbursementNo, dto.getReimbursementNo());
        wrapper.like(StringUtils.hasText(dto.getTitle()), ReimMain::getReimbursementTitle, dto.getTitle());
        wrapper.like(StringUtils.hasText(dto.getReason()), ReimMain::getBusinessTripReason, dto.getReason());
        wrapper.eq(StringUtils.hasText(dto.getCompanyId()), ReimMain::getReimCompanyId, dto.getCompanyId());
        wrapper.eq(StringUtils.hasText(dto.getDepartmentId()), ReimMain::getReimDepartmentId, dto.getDepartmentId());
        wrapper.eq(StringUtils.hasText(dto.getReimburserId()), ReimMain::getReimburserId, dto.getReimburserId());
        wrapper.eq(StringUtils.hasText(dto.getBusinessTypeId()), ReimMain::getBusinessTypeId, dto.getBusinessTypeId());
        wrapper.eq(dto.getStatus() != null, ReimMain::getStatus, dto.getStatus());
        wrapper.orderByDesc(ReimMain::getCreationTime);

        Page<ReimMain> page = new Page<>(
                dto.getCurrent() != null ? dto.getCurrent() : 1,
                dto.getSize() != null ? dto.getSize() : 10);
        return mainMapper.selectPage(page, wrapper);
    }

    @Override
    public ReimDetailVO getDetail(Long id) {
        ReimMain main = mainMapper.selectById(id);
        if (main == null) {
            throw new BizException(40001, "报销单不存在");
        }
        ReimDetailVO vo = new ReimDetailVO();
        vo.setMain(main);
        vo.setTrips(tripMapper.selectList(new LambdaQueryWrapper<ReimTrip>().eq(ReimTrip::getMainId, id)));
        vo.setSubsidies(subsidyMapper.selectList(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getMainId, id)));
        vo.setAllocations(allocationMapper.selectList(new LambdaQueryWrapper<ReimCostAllocation>().eq(ReimCostAllocation::getMainId, id)));
        return vo;
    }

    @Override
    public Long create(ReimMain main) {
        main.setReimbursementNo(generateReimNo());
        main.setStatus(0);
        main.setVersion(0);
        main.setSubsidyTotal(BigDecimal.ZERO);
        main.setMealAllowance(BigDecimal.ZERO);
        main.setTransportationAllowance(BigDecimal.ZERO);
        main.setPhoneAllowance(BigDecimal.ZERO);
        main.setCreationTime(LocalDateTime.now());
        main.setUpdateTime(LocalDateTime.now());
        mainMapper.insert(main);
        log.info("创建报销单草稿：id={}, no={}", main.getId(), main.getReimbursementNo());
        return main.getId();
    }

    @Override
    public void update(Long id, ReimMain updateData) {
        ReimMain existing = mainMapper.selectById(id);
        if (existing == null) throw new BizException(40001, "报销单不存在");
        if (existing.getStatus() != 0) throw new BizException(40002, "仅草稿状态可编辑");

        // @Version 乐观锁校验
        if (!existing.getVersion().equals(updateData.getVersion())) {
            throw new BizException(40006, "数据已被他人修改，请刷新后重试");
        }
        updateData.setId(id);
        updateData.setUpdateTime(LocalDateTime.now());
        mainMapper.updateById(updateData);
    }

    // ──────────── 提交（核心事务方法） ────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submit(Long id, Integer version) {
        ReimMain main = mainMapper.selectById(id);
        if (main == null) throw new BizException(40001, "报销单不存在");

        // 1. 乐观锁校验
        if (!main.getVersion().equals(version)) {
            throw new BizException(40006, "数据已被他人修改，请刷新后重试");
        }

        // 2. 状态校验
        if (main.getStatus() != 0) {
            throw new BizException(40002, "仅草稿状态可提交");
        }

        // 3. 必填字段校验
        validateRequiredFields(main);

        // 4. 行程校验
        List<ReimTrip> trips = tripMapper.selectList(new LambdaQueryWrapper<ReimTrip>().eq(ReimTrip::getMainId, id));
        if (trips.isEmpty()) throw new BizException(40007, "请至少补录一条行程信息");
        for (ReimTrip trip : trips) {
            validateTripUniqueness(id, trip.getTravelerId(), trip.getStartDate(), trip.getEndDate(), trip.getId());
        }

        // 5. 分摊校验
        List<ReimCostAllocation> allocations = allocationMapper.selectList(
                new LambdaQueryWrapper<ReimCostAllocation>().eq(ReimCostAllocation::getMainId, id));
        if (allocations.isEmpty()) throw new BizException(40007, "请配置费用分摊信息");
        validateAllocationRatio(allocations);
        validateAllocationAmount(main.getSubsidyTotal(), allocations);

        // 6. 更新状态
        main.setStatus(1);
        main.setVersion(version + 1);
        main.setUpdateTime(LocalDateTime.now());
        int rows = mainMapper.updateById(main);
        if (rows == 0) throw new BizException(40006, "数据已被他人修改，请刷新后重试");

        log.info("报销单提交成功：id={}, no={}", id, main.getReimbursementNo());
    }

    // ──────────── 作废 ────────────

    @Override
    public void voidReim(Long id, Integer version) {
        ReimMain main = mainMapper.selectById(id);
        if (main == null) throw new BizException(40001, "报销单不存在");
        if (!main.getVersion().equals(version)) throw new BizException(40006, "数据已被他人修改，请刷新后重试");
        if (main.getStatus() != 1) throw new BizException(40002, "仅已完成状态可作废");
        main.setStatus(2);
        main.setVersion(version + 1);
        main.setUpdateTime(LocalDateTime.now());
        mainMapper.updateById(main);
        log.info("报销单作废：id={}, no={}", id, main.getReimbursementNo());
    }

    // ──────────── 删除 ────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        ReimMain main = mainMapper.selectById(id);
        if (main == null) throw new BizException(40001, "报销单不存在");
        if (main.getStatus() != 0) throw new BizException(40002, "仅草稿状态可删除");

        // 级联删除：行程 → 补助 → 日历 → 分摊
        List<ReimTrip> trips = tripMapper.selectList(new LambdaQueryWrapper<ReimTrip>().eq(ReimTrip::getMainId, id));
        for (ReimTrip trip : trips) {
            List<ReimSubsidy> subsidies = subsidyMapper.selectList(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, trip.getId()));
            for (ReimSubsidy sub : subsidies) {
                calendarMapper.delete(new LambdaQueryWrapper<ReimSubsidyCalendar>().eq(ReimSubsidyCalendar::getSubsidyId, sub.getId()));
            }
            subsidyMapper.delete(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, trip.getId()));
        }
        tripMapper.delete(new LambdaQueryWrapper<ReimTrip>().eq(ReimTrip::getMainId, id));
        allocationMapper.delete(new LambdaQueryWrapper<ReimCostAllocation>().eq(ReimCostAllocation::getMainId, id));
        mainMapper.deleteById(id);
        log.info("删除报销单草稿：id={}", id);
    }

    // ──────────── 行程管理 ────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addTrip(Long mainId, TripDTO dto) {
        ReimMain main = checkMainEditable(mainId);

        // 1. 日期校验
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BizException(40008, "到达日期不可早于出发日期");
        }
        if (dto.getEndDate().isAfter(LocalDate.now())) {
            throw new BizException(40008, "日期不可晚于当前日期");
        }

        // 2. 唯一性校验
        validateTripUniqueness(mainId, dto.getTravelerId(), dto.getStartDate(), dto.getEndDate(), null);

        // 3. 保存行程
        ReimTrip trip = new ReimTrip();
        trip.setMainId(mainId);
        trip.setTravelerId(dto.getTravelerId());
        trip.setTravelerNo(dto.getTravelerNo());
        trip.setTravelerName(dto.getTravelerName());
        trip.setOriginCityId(dto.getOriginCityId());
        trip.setOriginCityName(dto.getOriginCityName());
        trip.setDestinationCityId(dto.getDestinationCityId());
        trip.setDestinationCityName(dto.getDestinationCityName());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        trip.setTripDesc(dto.getTripDesc());
        trip.setCreationTime(LocalDateTime.now());
        tripMapper.insert(trip);

        // 4. 生成补助信息
        ReimSubsidy subsidy = createSubsidy(mainId, trip);

        // 5. 生成补助日历
        createCalendar(subsidy, trip);

        // 6. 更新主表合计
        recalcMainTotal(mainId);

        log.info("新增行程：mainId={}, tripId={}, subsidyId={}", mainId, trip.getId(), subsidy.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTrip(Long mainId, Long tripId, TripDTO dto) {
        checkMainEditable(mainId);
        ReimTrip trip = tripMapper.selectById(tripId);
        if (trip == null || !trip.getMainId().equals(mainId)) throw new BizException(40001, "行程记录不存在");

        // 唯一性校验（排除自身）
        validateTripUniqueness(mainId, dto.getTravelerId(), dto.getStartDate(), dto.getEndDate(), tripId);

        trip.setTravelerId(dto.getTravelerId());
        trip.setTravelerNo(dto.getTravelerNo());
        trip.setTravelerName(dto.getTravelerName());
        trip.setOriginCityId(dto.getOriginCityId());
        trip.setOriginCityName(dto.getOriginCityName());
        trip.setDestinationCityId(dto.getDestinationCityId());
        trip.setDestinationCityName(dto.getDestinationCityName());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        trip.setTripDesc(dto.getTripDesc());
        tripMapper.updateById(trip);

        // 删除旧补助和日历，重新生成
        List<ReimSubsidy> oldSubsidies = subsidyMapper.selectList(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, tripId));
        for (ReimSubsidy sub : oldSubsidies) {
            calendarMapper.delete(new LambdaQueryWrapper<ReimSubsidyCalendar>().eq(ReimSubsidyCalendar::getSubsidyId, sub.getId()));
        }
        subsidyMapper.delete(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, tripId));

        ReimSubsidy newSubsidy = createSubsidy(mainId, trip);
        createCalendar(newSubsidy, trip);
        recalcMainTotal(mainId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTrip(Long mainId, Long tripId) {
        checkMainEditable(mainId);
        ReimTrip trip = tripMapper.selectById(tripId);
        if (trip == null || !trip.getMainId().equals(mainId)) throw new BizException(40001, "行程记录不存在");

        List<ReimSubsidy> subsidies = subsidyMapper.selectList(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, tripId));
        for (ReimSubsidy sub : subsidies) {
            calendarMapper.delete(new LambdaQueryWrapper<ReimSubsidyCalendar>().eq(ReimSubsidyCalendar::getSubsidyId, sub.getId()));
        }
        subsidyMapper.delete(new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getTripId, tripId));
        tripMapper.deleteById(tripId);
        recalcMainTotal(mainId);
        log.info("删除行程：mainId={}, tripId={}", mainId, tripId);
    }

    // ──────────── 补助日历 ────────────

    @Override
    public List<ReimSubsidyCalendar> getCalendar(Long mainId, Long subsidyId) {
        return calendarMapper.selectList(
                new LambdaQueryWrapper<ReimSubsidyCalendar>()
                        .eq(ReimSubsidyCalendar::getSubsidyId, subsidyId)
                        .orderByAsc(ReimSubsidyCalendar::getSubsidyDate));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCalendar(Long mainId, Long subsidyId, List<CalendarUpdateDTO> list) {
        checkMainEditable(mainId);
        BigDecimal totalSubsidyAmount = BigDecimal.ZERO;
        for (CalendarUpdateDTO dto : list) {
            ReimSubsidyCalendar cal = calendarMapper.selectById(dto.getId());
            if (cal == null || !cal.getSubsidyId().equals(subsidyId)) continue;

            // 校验申请金额不可大于标准
            if (dto.getMealApplyAmount() != null && dto.getMealApplyAmount().compareTo(cal.getMealStandard()) > 0) {
                throw new BizException(40009, "餐补申请金额不可大于标准金额");
            }
            if (dto.getTransportApplyAmount() != null && dto.getTransportApplyAmount().compareTo(cal.getTransportStandard()) > 0) {
                throw new BizException(40009, "交补申请金额不可大于标准金额");
            }
            if (dto.getPhoneApplyAmount() != null && dto.getPhoneApplyAmount().compareTo(cal.getPhoneStandard()) > 0) {
                throw new BizException(40009, "通补申请金额不可大于标准金额");
            }

            cal.setIsMealSelected(dto.getIsMealSelected());
            cal.setIsTransportSelected(dto.getIsTransportSelected());
            cal.setIsPhoneSelected(dto.getIsPhoneSelected());
            cal.setMealApplyAmount(dto.getMealApplyAmount() != null ? dto.getMealApplyAmount() : BigDecimal.ZERO);
            cal.setTransportApplyAmount(dto.getTransportApplyAmount() != null ? dto.getTransportApplyAmount() : BigDecimal.ZERO);
            cal.setPhoneApplyAmount(dto.getPhoneApplyAmount() != null ? dto.getPhoneApplyAmount() : BigDecimal.ZERO);
            calendarMapper.updateById(cal);

            // 累加选中项的申请金额
            BigDecimal dayTotal = BigDecimal.ZERO;
            if (cal.getIsMealSelected() == 1) dayTotal = dayTotal.add(cal.getMealApplyAmount());
            if (cal.getIsTransportSelected() == 1) dayTotal = dayTotal.add(cal.getTransportApplyAmount());
            if (cal.getIsPhoneSelected() == 1) dayTotal = dayTotal.add(cal.getPhoneApplyAmount());
            totalSubsidyAmount = totalSubsidyAmount.add(dayTotal);
        }

        // 更新补助信息表的补助金额
        ReimSubsidy subsidy = subsidyMapper.selectById(subsidyId);
        if (subsidy != null) {
            subsidy.setSubsidyAmount(totalSubsidyAmount);
            subsidy.setApplyAmount(totalSubsidyAmount);
            subsidyMapper.updateById(subsidy);
        }

        // 更新主表合计
        recalcMainTotal(mainId);
    }

    // ──────────── 费用分摊 ────────────

    @Override
    public List<ReimCostAllocation> getAllocation(Long mainId) {
        return allocationMapper.selectList(
                new LambdaQueryWrapper<ReimCostAllocation>()
                        .eq(ReimCostAllocation::getMainId, mainId)
                        .orderByAsc(ReimCostAllocation::getSortOrder));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAllocation(Long mainId, List<AllocationDTO> list) {
        checkMainEditable(mainId);
        allocationMapper.delete(new LambdaQueryWrapper<ReimCostAllocation>().eq(ReimCostAllocation::getMainId, mainId));

        ReimMain main = mainMapper.selectById(mainId);
        BigDecimal totalAmount = main.getSubsidyTotal() != null ? main.getSubsidyTotal() : BigDecimal.ZERO;

        for (int i = 0; i < list.size(); i++) {
            AllocationDTO dto = list.get(i);
            ReimCostAllocation alloc = new ReimCostAllocation();
            alloc.setMainId(mainId);
            alloc.setCompanyId(dto.getCompanyId());
            alloc.setCompanyNo(dto.getCompanyNo());
            alloc.setCompanyName(dto.getCompanyName());
            alloc.setProjectId(dto.getProjectId());
            alloc.setProjectNo(dto.getProjectNo());
            alloc.setProjectName(dto.getProjectName());
            alloc.setAllocationRatio(dto.getAllocationRatio());
            alloc.setAllocationAmount(totalAmount.multiply(dto.getAllocationRatio()).setScale(2, RoundingMode.HALF_UP));
            alloc.setSortOrder(i + 1);
            alloc.setCreationTime(LocalDateTime.now());
            allocationMapper.insert(alloc);
        }
    }

    @Override
    public List<ReimCostAllocation> equalSplit(Long mainId, List<AllocationDTO> list) {
        if (list.isEmpty()) throw new BizException(40010, "至少保留一条分摊信息");

        ReimMain main = mainMapper.selectById(mainId);
        if (main == null) throw new BizException(40001, "报销单不存在");

        BigDecimal total = main.getSubsidyTotal() != null ? main.getSubsidyTotal() : BigDecimal.ZERO;
        int n = list.size();
        BigDecimal equalRatio = BigDecimal.ONE.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_DOWN);
        BigDecimal remainder = BigDecimal.ONE.subtract(equalRatio.multiply(BigDecimal.valueOf(n - 1)));

        List<ReimCostAllocation> result = new ArrayList<>();
        BigDecimal amountSum = BigDecimal.ZERO;
        for (int i = 0; i < n; i++) {
            BigDecimal ratio = (i == 0) ? remainder : equalRatio;
            BigDecimal amount;
            if (i == n - 1) {
                amount = total.subtract(amountSum);
            } else {
                amount = total.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
                amountSum = amountSum.add(amount);
            }
            ReimCostAllocation alloc = new ReimCostAllocation();
            alloc.setCompanyId(list.get(i).getCompanyId());
            alloc.setCompanyNo(list.get(i).getCompanyNo());
            alloc.setCompanyName(list.get(i).getCompanyName());
            alloc.setProjectId(list.get(i).getProjectId());
            alloc.setProjectNo(list.get(i).getProjectNo());
            alloc.setProjectName(list.get(i).getProjectName());
            alloc.setAllocationRatio(ratio);
            alloc.setAllocationAmount(amount);
            alloc.setSortOrder(i + 1);
            result.add(alloc);
        }
        return result;
    }

    // ======================== 私有辅助方法 ========================

    /** 生成报销单号：BX-YYYYMMDD-序号（4位） */
    private String generateReimNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "BX-" + dateStr + "-";
        LambdaQueryWrapper<ReimMain> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(ReimMain::getReimbursementNo, prefix);
        wrapper.orderByDesc(ReimMain::getReimbursementNo);
        wrapper.last("LIMIT 1");
        ReimMain last = mainMapper.selectOne(wrapper);
        int seq = 1;
        if (last != null && last.getReimbursementNo().length() >= prefix.length() + 4) {
            try {
                seq = Integer.parseInt(last.getReimbursementNo().substring(prefix.length())) + 1;
            } catch (NumberFormatException ignored) {}
        }
        return prefix + String.format("%04d", seq);
    }

    /** 校验草稿状态可编辑 */
    private ReimMain checkMainEditable(Long mainId) {
        ReimMain main = mainMapper.selectById(mainId);
        if (main == null) throw new BizException(40001, "报销单不存在");
        if (main.getStatus() != 0) throw new BizException(40002, "仅草稿状态可编辑");
        return main;
    }

    /** 必填字段校验 */
    private void validateRequiredFields(ReimMain main) {
        if (!StringUtils.hasText(main.getReimbursementTitle())) throw new BizException(40007, "报销标题不能为空");
        if (!StringUtils.hasText(main.getBusinessTripReason())) throw new BizException(40007, "出差事由不能为空");
        if (!StringUtils.hasText(main.getReimburserId())) throw new BizException(40007, "报销人不能为空");
        if (!StringUtils.hasText(main.getReimDepartmentId())) throw new BizException(40007, "报销部门不能为空");
        if (!StringUtils.hasText(main.getReimCompanyId())) throw new BizException(40007, "费用归属公司不能为空");
        if (!StringUtils.hasText(main.getBusinessTypeId())) throw new BizException(40007, "业务类型不能为空");
    }

    /** 行程唯一性校验：同一报销单内出行人员+日期范围不可重叠 */
    private void validateTripUniqueness(Long mainId, String travelerId, LocalDate start, LocalDate end, Long excludeTripId) {
        if (start == null || end == null) return;
        LambdaQueryWrapper<ReimTrip> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReimTrip::getMainId, mainId);
        wrapper.eq(ReimTrip::getTravelerId, travelerId);
        wrapper.ne(excludeTripId != null, ReimTrip::getId, excludeTripId);
        // 日期范围重叠判断：A.start <= B.end AND A.end >= B.start
        wrapper.le(ReimTrip::getStartDate, end);
        wrapper.ge(ReimTrip::getEndDate, start);
        Long count = tripMapper.selectCount(wrapper);
        if (count > 0) {
            throw new BizException(40003, "该出行人员在相同日期范围内已存在行程，请勿重复添加");
        }
    }

    /** 分摊比例校验：总和必须为100% */
    private void validateAllocationRatio(List<ReimCostAllocation> allocations) {
        BigDecimal sum = allocations.stream()
                .map(ReimCostAllocation::getAllocationRatio)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal diff = BigDecimal.ONE.subtract(sum).abs();
        if (diff.compareTo(new BigDecimal("0.01")) > 0) {
            throw new BizException(40004, "分摊比例之和必须为100%，当前为" + sum.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP) + "%");
        }
    }

    /** 分摊金额校验：合计必须等于补助总金额 */
    private void validateAllocationAmount(BigDecimal subsidyTotal, List<ReimCostAllocation> allocations) {
        BigDecimal sum = allocations.stream()
                .map(ReimCostAllocation::getAllocationAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (subsidyTotal == null) subsidyTotal = BigDecimal.ZERO;
        if (sum.compareTo(subsidyTotal) != 0) {
            throw new BizException(40005, "分摊金额合计(" + sum + ")不等于补助总金额(" + subsidyTotal + ")");
        }
    }

    /** 根据城市等级获取餐补标准 */
    private BigDecimal getMealStandard(String cityId) {
        if (!StringUtils.hasText(cityId)) return new BigDecimal("80");
        List<ReimCity> cities = cityMapper.selectList(new LambdaQueryWrapper<ReimCity>().eq(ReimCity::getCityNo, cityId));
        if (cities.isEmpty()) return new BigDecimal("80");
        Integer cityType = cities.get(0).getCityType();
        if (cityType == 1) return new BigDecimal("100");  // 一线
        if (cityType == 2) return new BigDecimal("80");   // 二线
        return new BigDecimal("50");                        // 三线
    }

    /** 创建补助信息 */
    private ReimSubsidy createSubsidy(Long mainId, ReimTrip trip) {
        ReimSubsidy subsidy = new ReimSubsidy();
        subsidy.setMainId(mainId);
        subsidy.setTripId(trip.getId());
        subsidy.setTravelerId(trip.getTravelerId());
        subsidy.setTravelerNo(trip.getTravelerNo());
        subsidy.setTravelerName(trip.getTravelerName());
        subsidy.setStartDate(trip.getStartDate());
        subsidy.setEndDate(trip.getEndDate());
        long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        subsidy.setSubsidyDays((int) days);
        subsidy.setTripRoute(trip.getOriginCityName() + " - " + trip.getDestinationCityName());
        subsidy.setSubsidyCityId(trip.getDestinationCityId());
        subsidy.setSubsidyCityName(trip.getDestinationCityName());
        subsidy.setApplyAmount(BigDecimal.ZERO);
        subsidy.setSubsidyAmount(BigDecimal.ZERO);
        subsidy.setCreationTime(LocalDateTime.now());
        subsidyMapper.insert(subsidy);

        // 初始化日历后计算默认金额
        BigDecimal defaultAmt = calcCalendarTotal(subsidy.getId());
        subsidy.setApplyAmount(defaultAmt);
        subsidy.setSubsidyAmount(defaultAmt);
        subsidyMapper.updateById(subsidy);
        return subsidy;
    }

    /** 按天生成补助日历 */
    private void createCalendar(ReimSubsidy subsidy, ReimTrip trip) {
        BigDecimal mealStd = getMealStandard(trip.getDestinationCityId());
        BigDecimal transportStd = new BigDecimal("40");
        BigDecimal phoneStd = new BigDecimal("40");
        String[] weekDays = {"星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"};

        LocalDate date = trip.getStartDate();
        while (!date.isAfter(trip.getEndDate())) {
            ReimSubsidyCalendar cal = new ReimSubsidyCalendar();
            cal.setSubsidyId(subsidy.getId());
            cal.setSubsidyDate(date);
            cal.setDayOfWeek(weekDays[date.getDayOfWeek().getValue() - 1]);
            cal.setMealStandard(mealStd);
            cal.setTransportStandard(transportStd);
            cal.setPhoneStandard(phoneStd);
            cal.setIsMealSelected(1);
            cal.setIsTransportSelected(1);
            cal.setIsPhoneSelected(1);
            cal.setMealApplyAmount(mealStd);
            cal.setTransportApplyAmount(transportStd);
            cal.setPhoneApplyAmount(phoneStd);
            cal.setCreationTime(LocalDateTime.now());
            calendarMapper.insert(cal);
            date = date.plusDays(1);
        }
    }

    /** 计算补助日历金额合计 */
    private BigDecimal calcCalendarTotal(Long subsidyId) {
        List<ReimSubsidyCalendar> list = calendarMapper.selectList(
                new LambdaQueryWrapper<ReimSubsidyCalendar>().eq(ReimSubsidyCalendar::getSubsidyId, subsidyId));
        BigDecimal total = BigDecimal.ZERO;
        for (ReimSubsidyCalendar cal : list) {
            if (cal.getIsMealSelected() == 1 && cal.getMealApplyAmount() != null)
                total = total.add(cal.getMealApplyAmount());
            if (cal.getIsTransportSelected() == 1 && cal.getTransportApplyAmount() != null)
                total = total.add(cal.getTransportApplyAmount());
            if (cal.getIsPhoneSelected() == 1 && cal.getPhoneApplyAmount() != null)
                total = total.add(cal.getPhoneApplyAmount());
        }
        return total;
    }

    /** 重新计算主表补助合计 */
    private void recalcMainTotal(Long mainId) {
        List<ReimSubsidy> subsidies = subsidyMapper.selectList(
                new LambdaQueryWrapper<ReimSubsidy>().eq(ReimSubsidy::getMainId, mainId));
        BigDecimal totalSubsidy = BigDecimal.ZERO;
        BigDecimal totalMeal = BigDecimal.ZERO;
        BigDecimal totalTransport = BigDecimal.ZERO;
        BigDecimal totalPhone = BigDecimal.ZERO;
        for (ReimSubsidy sub : subsidies) {
            if (sub.getSubsidyAmount() != null) totalSubsidy = totalSubsidy.add(sub.getSubsidyAmount());
            List<ReimSubsidyCalendar> cals = calendarMapper.selectList(
                    new LambdaQueryWrapper<ReimSubsidyCalendar>().eq(ReimSubsidyCalendar::getSubsidyId, sub.getId()));
            for (ReimSubsidyCalendar cal : cals) {
                if (cal.getIsMealSelected() == 1 && cal.getMealApplyAmount() != null)
                    totalMeal = totalMeal.add(cal.getMealApplyAmount());
                if (cal.getIsTransportSelected() == 1 && cal.getTransportApplyAmount() != null)
                    totalTransport = totalTransport.add(cal.getTransportApplyAmount());
                if (cal.getIsPhoneSelected() == 1 && cal.getPhoneApplyAmount() != null)
                    totalPhone = totalPhone.add(cal.getPhoneApplyAmount());
            }
        }
        ReimMain main = mainMapper.selectById(mainId);
        main.setSubsidyTotal(totalSubsidy);
        main.setMealAllowance(totalMeal);
        main.setTransportationAllowance(totalTransport);
        main.setPhoneAllowance(totalPhone);
        main.setUpdateTime(LocalDateTime.now());
        mainMapper.updateById(main);
    }
}
