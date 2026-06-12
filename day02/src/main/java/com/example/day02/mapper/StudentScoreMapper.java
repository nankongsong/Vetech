package com.example.day02.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.day02.dto.StudenDto;
import com.example.day02.dto.StudentScoreDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

//学生成绩自定义查询 Mapper
@Mapper
public interface StudentScoreMapper {

     //查询所有学生姓名、对应课程名、考试分数 分页
    IPage<StudentScoreDTO> selectStudentScorePage(Page<StudentScoreDTO> page);

     //查询张三的各科课程名称和对应成绩
    List<StudentScoreDTO> selectZhangSanScores(@Param("studentName") String studentName);

     //查询数学成绩大于 80 分的学生姓名
    List<StudentScoreDTO> selectMathScoreGt80(@Param("score") Double score);

     //搜索分页查询：按学生编号、姓名(模糊)、年龄筛选
    IPage<StudentScoreDTO> selectStudentScorePageWithSearch(
            Page<StudentScoreDTO> page,
            @Param("studentId") Integer studentId,
            @Param("name") String name,
            @Param("age") Integer age);
}
