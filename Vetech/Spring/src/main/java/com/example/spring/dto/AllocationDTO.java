package com.example.spring.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 费用分摊请求DTO
 */
@Data
public class AllocationDTO {
    private Long id;
    private String companyId;
    private String companyNo;
    private String companyName;
    private String projectId;
    private String projectNo;
    private String projectName;
    private BigDecimal allocationRatio;
    private Integer sortOrder;
}
