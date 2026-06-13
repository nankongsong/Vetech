package com.example.spring.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 行程新增/编辑请求DTO
 */
@Data
public class TripDTO {
    private String travelerId;
    private String travelerNo;
    private String travelerName;
    private String originCityId;
    private String originCityName;
    private String destinationCityId;
    private String destinationCityName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String tripDesc;
}
