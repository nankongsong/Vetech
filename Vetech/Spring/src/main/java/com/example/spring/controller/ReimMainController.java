package com.example.spring.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.spring.dto.*;
import com.example.spring.entity.ReimCostAllocation;
import com.example.spring.entity.ReimMain;
import com.example.spring.entity.ReimSubsidyCalendar;
import com.example.spring.service.ReimMainService;
import com.example.spring.vo.ReimDetailVO;
import com.example.spring.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 报销单REST控制器
 */
@RestController
@RequestMapping("/api/reim")
public class ReimMainController {

    @Autowired
    private ReimMainService reimMainService;

    /** 分页查询报销单列表 */
    @GetMapping("/page")
    public Result<IPage<ReimMain>> pageQuery(ReimPageDTO dto) {
        return Result.success(reimMainService.pageQuery(dto));
    }

    /** 查询报销单详情（含行程/补助/分摊） */
    @GetMapping("/{id}")
    public Result<ReimDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(reimMainService.getDetail(id));
    }

    /** 新增报销单（草稿） */
    @PostMapping
    public Result<Map<String, Long>> create(@RequestBody ReimMain main) {
        Long id = reimMainService.create(main);
        return Result.success(Map.of("id", id));
    }

    /** 更新报销单基本信息 */
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ReimMain main) {
        reimMainService.update(id, main);
        return Result.success(null);
    }

    /** 提交报销单（草稿→已完成） */
    @PutMapping("/{id}/submit")
    public Result<Void> submit(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer version = body.get("version");
        reimMainService.submit(id, version);
        return Result.success("提交成功", null);
    }

    /** 作废报销单（已完成→已作废） */
    @PutMapping("/{id}/void")
    public Result<Void> voidReim(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer version = body.get("version");
        reimMainService.voidReim(id, version);
        return Result.success("作废成功", null);
    }

    /** 删除草稿报销单 */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        reimMainService.delete(id);
        return Result.success("删除成功", null);
    }

    // ── 行程管理 ──

    /** 新增行程 */
    @PostMapping("/{mainId}/trip")
    public Result<Void> addTrip(@PathVariable Long mainId, @RequestBody TripDTO dto) {
        reimMainService.addTrip(mainId, dto);
        return Result.success("行程添加成功", null);
    }

    /** 更新行程 */
    @PutMapping("/{mainId}/trip/{tripId}")
    public Result<Void> updateTrip(@PathVariable Long mainId, @PathVariable Long tripId, @RequestBody TripDTO dto) {
        reimMainService.updateTrip(mainId, tripId, dto);
        return Result.success("行程更新成功", null);
    }

    /** 删除行程 */
    @DeleteMapping("/{mainId}/trip/{tripId}")
    public Result<Void> deleteTrip(@PathVariable Long mainId, @PathVariable Long tripId) {
        reimMainService.deleteTrip(mainId, tripId);
        return Result.success("行程删除成功", null);
    }

    // ── 补助日历 ──

    /** 查询补助日历 */
    @GetMapping("/{mainId}/subsidy/{subsidyId}/calendar")
    public Result<List<ReimSubsidyCalendar>> getCalendar(@PathVariable Long mainId, @PathVariable Long subsidyId) {
        return Result.success(reimMainService.getCalendar(mainId, subsidyId));
    }

    /** 更新补助日历 */
    @PutMapping("/{mainId}/subsidy/{subsidyId}/calendar")
    public Result<Void> updateCalendar(@PathVariable Long mainId, @PathVariable Long subsidyId,
                                       @RequestBody List<CalendarUpdateDTO> list) {
        reimMainService.updateCalendar(mainId, subsidyId, list);
        return Result.success("补助日历更新成功", null);
    }

    // ── 费用分摊 ──

    /** 查询费用分摊 */
    @GetMapping("/{mainId}/allocation")
    public Result<List<ReimCostAllocation>> getAllocation(@PathVariable Long mainId) {
        return Result.success(reimMainService.getAllocation(mainId));
    }

    /** 更新费用分摊 */
    @PutMapping("/{mainId}/allocation")
    public Result<Void> updateAllocation(@PathVariable Long mainId, @RequestBody List<AllocationDTO> list) {
        reimMainService.updateAllocation(mainId, list);
        return Result.success("分摊信息更新成功", null);
    }

    /** 均摊计算 */
    @PutMapping("/{mainId}/allocation/equal-split")
    public Result<List<ReimCostAllocation>> equalSplit(@PathVariable Long mainId, @RequestBody List<AllocationDTO> list) {
        return Result.success(reimMainService.equalSplit(mainId, list));
    }
}
