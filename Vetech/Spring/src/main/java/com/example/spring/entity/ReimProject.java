package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_project")
public class ReimProject {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String projectId;
    private String projectNo;
    private String projectName;
    private LocalDateTime creationTime;
}
