package com.example.spring.service;

import com.example.spring.entity.*;

import java.util.List;

/**
 * 基础数据查询服务
 */
public interface BaseDataService {

    List<ReimCompany> getCompanyList();

    List<ReimDepartment> getDepartmentList();

    List<ReimEmployee> getEmployeeList();

    List<ReimBusinessType> getBusinessTypeTree();

    List<ReimCity> getCityList();

    List<ReimProject> getProjectList();
}
