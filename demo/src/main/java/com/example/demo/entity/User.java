package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("course")
public class User {
    /*
    id
     */
    @TableId
    private Integer id;
    private String Name;
}
