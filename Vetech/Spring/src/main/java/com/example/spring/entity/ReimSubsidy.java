package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 补助信息表实体
 */
@Data
@TableName("reim_subsidy")
public class ReimSubsidy {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报销单主表ID */
    private Long mainId;

    /** 行程明细ID */
    private Long tripId;

    /** 出行人员ID */
    private String travelerId;

    /** 出行人员工号 */
    private String travelerNo;

    /** 出行人员姓名 */
    private String travelerName;

    /** 开始日期 */
    private LocalDate startDate;

    /** 结束日期 */
    private LocalDate endDate;

    /** 补助天数 */
    private Integer subsidyDays;

    /** 行程路线 */
    private String tripRoute;

    /** 补助城市ID */
    private String subsidyCityId;

    /** 补助城市名称 */
    private String subsidyCityName;

    /** 申请金额 */
    private BigDecimal applyAmount;

    /** 补助金额 */
    private BigDecimal subsidyAmount;

    /** 创建时间 */
    private LocalDateTime creationTime;
}
