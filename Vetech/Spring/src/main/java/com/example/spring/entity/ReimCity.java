package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_city")
public class ReimCity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String cityNo;
    private String cityName;
    private Integer cityType;
    private LocalDateTime creationTime;
}
