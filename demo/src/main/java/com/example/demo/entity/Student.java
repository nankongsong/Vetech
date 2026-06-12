package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

//学生表
@Data
@TableName("student")
public class Student {

    //学生编号（主键）
    @TableId
    private Integer id;

    //学生姓名
    private String name;

    //年龄
    private Integer age;

    //性别
    private String gender;
}
