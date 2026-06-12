package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 行程明细表实体
 */
@Data
@TableName("reim_trip")
public class ReimTrip {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报销单主表ID */
    private Long mainId;

    /** 出行人员ID */
    private String travelerId;

    /** 出行人员工号 */
    private String travelerNo;

    /** 出行人员姓名 */
    private String travelerName;

    /** 出发城市ID */
    private String originCityId;

    /** 出发城市名称 */
    private String originCityName;

    /** 到达城市ID */
    private String destinationCityId;

    /** 到达城市名称 */
    private String destinationCityName;

    /** 出发日期 */
    private LocalDate startDate;

    /** 到达日期 */
    private LocalDate endDate;

    /** 行程说明 */
    private String tripDesc;

    /** 排序序号 */
    private Integer sortOrder;

    /** 创建时间 */
    private LocalDateTime creationTime;
}
