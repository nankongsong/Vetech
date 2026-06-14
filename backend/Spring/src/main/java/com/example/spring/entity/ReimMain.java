package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 报销单主表实体
 */
@Data
@TableName("reim_main")
public class ReimMain {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报销单号，格式：BXyyyyMMddXXXX */
    private String reimbursementNo;

    /** 报销标题 */
    private String reimbursementTitle;

    /** 出差事由 */
    private String businessTripReason;

    /** 报销人ID */
    private String reimburserId;

    /** 报销人工号 */
    private String reimburserNo;

    /** 报销人姓名 */
    private String reimburserName;

    /** 报销部门ID */
    private String reimDepartmentId;

    /** 报销部门编号 */
    private String reimDepartmentNo;

    /** 报销部门名称 */
    private String reimDepartmentName;

    /** 费用归属公司ID */
    private String reimCompanyId;

    /** 费用归属公司编号 */
    private String reimCompanyNo;

    /** 费用归属公司名称 */
    private String reimCompanyName;

    /** 业务类型ID */
    private String businessTypeId;

    /** 业务类型编号 */
    private String businessTypeNo;

    /** 业务类型名称 */
    private String businessTypeName;

    /** 补助总金额 */
    private BigDecimal subsidyTotal;

    /** 餐费补助合计 */
    private BigDecimal mealAllowance;

    /** 交通补助合计 */
    private BigDecimal transportationAllowance;

    /** 通讯补助合计 */
    private BigDecimal phoneAllowance;

    /** 备注信息 */
    private String remarks;

    /** 单据状态：0-草稿，1-已完成，2-已作废 */
    private Integer status;

    /** 乐观锁版本号 */
    @Version
    private Integer version;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime creationTime;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
