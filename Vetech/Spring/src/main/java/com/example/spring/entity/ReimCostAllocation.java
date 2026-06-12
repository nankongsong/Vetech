package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 费用分摊表实体
 */
@Data
@TableName("reim_cost_allocation")
public class ReimCostAllocation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报销单主表ID */
    private Long mainId;

    /** 费用归属公司ID */
    private String companyId;

    /** 公司编号 */
    private String companyNo;

    /** 公司名称 */
    private String companyName;

    /** 项目ID */
    private String projectId;

    /** 项目编号 */
    private String projectNo;

    /** 项目名称 */
    private String projectName;

    /** 分摊比例（0~1，如1.0000=100%） */
    private BigDecimal allocationRatio;

    /** 分摊金额 */
    private BigDecimal allocationAmount;

    /** 排序序号（第1行为自动计算行，不可编辑） */
    private Integer sortOrder;

    /** 创建时间 */
    private LocalDateTime creationTime;
}
