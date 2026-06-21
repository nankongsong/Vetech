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

    /** 状态：0-临时（未关联报销单），1-已确认（已关联） */
    private Integer status;

    private LocalDateTime creationTime;
}
