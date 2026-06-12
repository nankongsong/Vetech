package com.example.day02.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.day02.entity.Course;
import org.apache.ibatis.annotations.Mapper;

/**
 * 课程表 Mapper
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {
}
