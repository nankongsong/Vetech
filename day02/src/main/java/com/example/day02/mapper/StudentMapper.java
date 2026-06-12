package com.example.day02.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.day02.entity.Student;
import org.apache.ibatis.annotations.Mapper;

/**
 * 学生表 Mapper
 */
@Mapper
public interface StudentMapper extends BaseMapper<Student> {
}
