package com.example.spring.vo;

import lombok.Data;
import java.util.List;

/**
 * 业务类型树形节点VO
 */
@Data
public class BusinessTypeTreeVO {
    private String businessTypeId;
    private String businessTypeNo;
    private String businessTypeName;
    private String superiorId;
    private Integer hasSubordinate;
    private List<BusinessTypeTreeVO> children;
}
