package com.example.day02.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.day02.entity.Sc;
import org.apache.ibatis.annotations.Mapper;

/**
 * 成绩表 Mapper
 */
@Mapper
public interface ScMapper extends BaseMapper<Sc> {
}
