package com.example.day02.dto;

import lombok.Data;

/**
 * 学生成绩DTO —— 用于三表关联查询结果
 */
@Data
public class StudentScoreDTO {

    /**
     * 学生姓名
     */
    private String studentName;

    /**
     * 课程名称
     */
    private String courseName;

    /**
     * 考试分数
     */
    private Double score;

    /**
     * 年龄
     */
    private Integer age;

    /**
     * 学生编号
     */
    private Integer studentId;

    /**
     * 课程编号
     */
    private Integer courseId;
}

