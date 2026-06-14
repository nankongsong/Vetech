package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 异动日志（审计日志）表实体
 * 记录报销单的状态变更操作，便于审计追溯
 */
@Data
@TableName("reim_audit_log")
public class ReimAuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报销单主表ID */
    private Long mainId;

    /** 报销单号 */
    private String reimbursementNo;

    /** 操作类型：SUBMIT / VOID / DELETE */
    private String operation;

    /** 变更前状态：0-草稿，1-已完成，2-已作废 */
    private Integer fromStatus;

    /** 变更后状态：0-草稿，1-已完成，2-已作废 */
    private Integer toStatus;

    /** 操作人ID（未接入登录时默认为 SYSTEM） */
    private String operatorId;

    /** 操作人姓名 */
    private String operatorName;

    /** 备注 */
    private String remark;

    /** 操作时间 */
    private LocalDateTime creationTime;
}
