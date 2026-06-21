package com.example.spring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reim_attachment")
public class ReimAttachment {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long mainId;

    private String fileName;

    private String filePath;

    private Long fileSize;

    private String contentType;

    private LocalDateTime creationTime;
}
