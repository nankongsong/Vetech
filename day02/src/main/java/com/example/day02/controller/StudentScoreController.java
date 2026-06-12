package com.example.day02.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.day02.dto.StudenDto;
import com.example.day02.dto.StudentScoreDTO;
import com.example.day02.service.StudentScoreService;
import com.example.day02.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 学生成绩查询控制器
 */
@RestController
@RequestMapping("/api/score")
public class StudentScoreController {

    @Autowired
    private StudentScoreService studentScoreService;

    /**
     * (2) 分页查询所有学生姓名、对应课程名、考试分数
     * GET /api/score/page?current=1&size=10
     */
    @GetMapping("/page")
    public Result<IPage<StudentScoreDTO>> getStudentScorePage(
            @RequestParam(value = "current", defaultValue = "1") int current,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        IPage<StudentScoreDTO> page = studentScoreService.getStudentScorePage(current, size);
        return Result.success(page);
    }

    /**
     * (3) 查询张三的各科课程名称和对应成绩
     * GET /api/score/zhangsan
     */
    @GetMapping("/zhangsan")
    public Result<List<StudentScoreDTO>> getZhangSanScores() {
        List<StudentScoreDTO> list = studentScoreService.getZhangSanScores();
        return Result.success(list);
    }

    /**
     * (4) 查询数学成绩大于 80 分的学生姓名
     * GET /api/score/math-gt80
     */
    @GetMapping("/math-gt80")
    public Result<List<StudentScoreDTO>> getMathScoreGt80() {
        List<StudentScoreDTO> list = studentScoreService.getMathScoreGt80();
        return Result.success(list);
    }

    /**
     * (5) 搜索分页查询成绩
     * GET /api/score/search?current=1&size=10&studentId=&name=&age=
     */
    @GetMapping("/search")
    public Result<IPage<StudentScoreDTO>> searchStudentScores(
            @RequestParam(value = "current", defaultValue = "1") int current,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "studentId", required = false) Integer studentId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "age", required = false) Integer age) {
        IPage<StudentScoreDTO> page = studentScoreService.searchStudentScores(current, size, studentId, name, age);
        return Result.success(page);
    }
}

