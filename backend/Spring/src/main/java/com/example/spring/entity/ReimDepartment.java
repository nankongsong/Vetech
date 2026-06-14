package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_department")
public class ReimDepartment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String departmentId;
    private String departmentNo;
    private String departmentName;
    private LocalDateTime creationTime;
}
