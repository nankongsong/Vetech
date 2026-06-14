package com.example.spring.vo;

import com.example.spring.entity.*;
import lombok.Data;
import java.util.List;

/**
 * 报销单详情聚合VO
 * 包含主表信息 + 行程列表 + 补助列表 + 分摊列表
 */
@Data
public class ReimDetailVO {
    /** 报销单主信息 */
    private ReimMain main;

    /** 行程明细列表 */
    private List<ReimTrip> trips;

    /** 补助信息列表 */
    private List<ReimSubsidy> subsidies;

    /** 费用分摊列表 */
    private List<ReimCostAllocation> allocations;
}
