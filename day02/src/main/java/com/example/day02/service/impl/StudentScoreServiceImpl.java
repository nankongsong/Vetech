package com.example.day02.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.day02.dto.StudenDto;
import com.example.day02.dto.StudentScoreDTO;
import com.example.day02.mapper.StudentScoreMapper;
import com.example.day02.service.StudentScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

//学生成绩查询服务实现
@Service
public class StudentScoreServiceImpl implements StudentScoreService {

    @Autowired
    private StudentScoreMapper studentScoreMapper;

    @Override
    public IPage<StudentScoreDTO> getStudentScorePage(int current, int size) {
        Page<StudentScoreDTO> page = new Page<>(current, size);
        return studentScoreMapper.selectStudentScorePage(page);
    }

    @Override
    public List<StudentScoreDTO> getZhangSanScores() {
        return studentScoreMapper.selectZhangSanScores("张三");
    }

    @Override
    public List<StudentScoreDTO> getMathScoreGt80() {
        return studentScoreMapper.selectMathScoreGt80(80.0);
    }

    @Override
    public IPage<StudentScoreDTO> searchStudentScores(int current, int size,
                                                       Integer studentId, String name, Integer age) {
        Page<StudentScoreDTO> page = new Page<>(current, size);
        return studentScoreMapper.selectStudentScorePageWithSearch(page, studentId, name, age);
    }

}
