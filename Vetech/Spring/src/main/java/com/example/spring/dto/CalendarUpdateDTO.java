package com.example.spring.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 补助日历更新请求DTO（单条日历记录）
 */
@Data
public class CalendarUpdateDTO {
    private Long id;
    private Integer isMealSelected;
    private Integer isTransportSelected;
    private Integer isPhoneSelected;
    private BigDecimal mealApplyAmount;
    private BigDecimal transportApplyAmount;
    private BigDecimal phoneApplyAmount;
}
