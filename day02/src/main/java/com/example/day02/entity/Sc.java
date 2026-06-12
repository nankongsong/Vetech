package com.example.day02.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

 //成绩表
@Data
@TableName("sc")
public class Sc {

    /**
     * 学生编号
     */
     private Integer studentId;

    /**
     * 课程编号
     */
    private Integer courseId;

    /**
     * 分数
     */
    private Double score;
}
