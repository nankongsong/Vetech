package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_employee")
public class ReimEmployee {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String employeeId;
    private String employeeNo;
    private String employeeName;
    private LocalDateTime creationTime;
}
