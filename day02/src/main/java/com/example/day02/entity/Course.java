package com.example.day02.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 课程表
 */
@Data
@TableName("course")
public class Course {

    /**
     * 课程编号（主键）
     */
    @TableId
    private Integer id;

    /**
     * 课程名称
     */
    private String name;

    /**
     * 教师编号
     */
    private Integer teacherId;
}
