package com.example.spring.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.spring.entity.*;
import com.example.spring.mapper.*;
import com.example.spring.service.BaseDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 基础数据查询服务实现
 */
@Service
public class BaseDataServiceImpl implements BaseDataService {

    @Autowired private ReimCompanyMapper companyMapper;
    @Autowired private ReimDepartmentMapper departmentMapper;
    @Autowired private ReimEmployeeMapper employeeMapper;
    @Autowired private ReimBusinessTypeMapper businessTypeMapper;
    @Autowired private ReimCityMapper cityMapper;
    @Autowired private ReimProjectMapper projectMapper;

    @Override
    public List<ReimCompany> getCompanyList() {
        return companyMapper.selectList(null);
    }

    @Override
    public List<ReimDepartment> getDepartmentList() {
        return departmentMapper.selectList(null);
    }

    @Override
    public List<ReimEmployee> getEmployeeList() {
        return employeeMapper.selectList(null);
    }

    @Override
    public List<ReimBusinessType> getBusinessTypeTree() {
        return businessTypeMapper.selectList(
                new LambdaQueryWrapper<ReimBusinessType>().orderByAsc(ReimBusinessType::getSortOrder));
    }

    @Override
    public List<ReimCity> getCityList() {
        return cityMapper.selectList(null);
    }

    @Override
    public List<ReimProject> getProjectList() {
        return projectMapper.selectList(null);
    }
}
