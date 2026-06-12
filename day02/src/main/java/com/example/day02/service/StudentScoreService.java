package com.example.day02.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.day02.dto.StudenDto;
import com.example.day02.dto.StudentScoreDTO;

import java.util.List;

/**
 * 学生成绩查询服务接口
 */
public interface StudentScoreService {

    /**
     * 分页查询所有学生姓名、课程名、成绩
     */
    IPage<StudentScoreDTO> getStudentScorePage(int current, int size);

    /**
     * 查询张三的各科成绩
     */
    List<StudentScoreDTO> getZhangSanScores();

    /**
     * 查询数学成绩大于80分的学生
     */
    List<StudentScoreDTO> getMathScoreGt80();

    /**
     * 搜索分页查询成绩：支持按学生编号、姓名(模糊)、年龄筛选
     */
    IPage<StudentScoreDTO> searchStudentScores(int current, int size,
                                                Integer studentId, String name, Integer age);
}
