package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 补助日历表实体（按天明细）
 */
@Data
@TableName("reim_subsidy_calendar")
public class ReimSubsidyCalendar {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 补助信息ID */
    private Long subsidyId;

    /** 补助日期 */
    private LocalDate subsidyDate;

    /** 星期 */
    private String dayOfWeek;

    /** 餐补标准金额 */
    private BigDecimal mealStandard;

    /** 交补标准金额 */
    private BigDecimal transportStandard;

    /** 通补标准金额 */
    private BigDecimal phoneStandard;

    /** 餐补是否选中：0-否，1-是 */
    private Integer isMealSelected;

    /** 交补是否选中：0-否，1-是 */
    private Integer isTransportSelected;

    /** 通补是否选中：0-否，1-是 */
    private Integer isPhoneSelected;

    /** 餐补申请金额 */
    private BigDecimal mealApplyAmount;

    /** 交补申请金额 */
    private BigDecimal transportApplyAmount;

    /** 通补申请金额 */
    private BigDecimal phoneApplyAmount;

    /** 创建时间 */
    private LocalDateTime creationTime;
}
