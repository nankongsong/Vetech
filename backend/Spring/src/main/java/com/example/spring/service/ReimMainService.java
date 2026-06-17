package com.example.spring.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.spring.dto.*;
import com.example.spring.entity.*;
import com.example.spring.vo.ReimDetailVO;

import java.util.List;
import java.util.Map;

/**
 * 报销单核心业务服务接口
 */
public interface ReimMainService {

    /** 分页查询报销单列表 */
    IPage<ReimMain> pageQuery(ReimPageDTO dto);

    /** 查询报销单详情（含行程/补助/分摊） */
    ReimDetailVO getDetail(Long id);

    /** 新增报销单（草稿） */
    Long create(ReimMain main);

    /** 更新报销单基本信息（草稿） */
    void update(Long id, ReimMain main);

    /** 提交报销单（草稿→已完成），含完整校验和事务 */
    void submit(Long id, Integer version);

    /** 作废报销单（已完成→已作废） */
    void voidReim(Long id, Integer version);

    /** 删除草稿报销单 */
    void delete(Long id);

    /** 新增行程（级联生成补助+日历），返回 {tripId, subsidyId} */
    Map<String, Long> addTrip(Long mainId, TripDTO dto);

    /** 更新行程（同步更新补助+日历），返回 {subsidyId} */
    Map<String, Long> updateTrip(Long mainId, Long tripId, TripDTO dto);

    /** 删除行程（级联删除补助+日历） */
    void deleteTrip(Long mainId, Long tripId);

    /** 查询补助日历 */
    List<ReimSubsidyCalendar> getCalendar(Long mainId, Long subsidyId);

    /** 更新补助日历 */
    void updateCalendar(Long mainId, Long subsidyId, List<CalendarUpdateDTO> list);

    /** 查询费用分摊 */
    List<ReimCostAllocation> getAllocation(Long mainId);

    /** 更新费用分摊 */
    void updateAllocation(Long mainId, List<AllocationDTO> list);

    /** 均摊计算 */
    List<ReimCostAllocation> equalSplit(Long mainId, List<AllocationDTO> list);
}
