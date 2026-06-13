package com.example.spring.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.spring.entity.ReimSubsidyCalendar;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReimSubsidyCalendarMapper extends BaseMapper<ReimSubsidyCalendar> {

    /** 批量插入补助日历（单条SQL，避免循环逐条INSERT） */
    int batchInsert(List<ReimSubsidyCalendar> list);

    /** 按补助ID列表批量删除 */
    int batchDeleteBySubsidyIds(List<Long> subsidyIds);

    /** 批量更新补助日历 */
    int batchUpdate(List<ReimSubsidyCalendar> list);

    /** 按主表ID聚合统计各补助项合计（一次SQL替代N+1循环查询） */
    Map<String, Object> sumAllowanceByMainId(Long mainId);
}
