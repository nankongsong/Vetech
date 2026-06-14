package com.example.spring.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 报销单列表查询参数
 */
@Data
public class ReimPageDTO {
    private Integer current;
    private Integer size;
    private String reimbursementNo;
    private String title;
    private String reason;
    private String companyId;
    private String departmentId;
    private String reimburserId;
    private String businessTypeId;
    private Integer status;
}
