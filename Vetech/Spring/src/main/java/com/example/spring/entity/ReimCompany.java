package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_company")
public class ReimCompany {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String companyId;
    private String companyNo;
    private String companyName;
    private LocalDateTime creationTime;
}
