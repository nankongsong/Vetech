package com.example.spring.controller;

import com.example.spring.entity.*;
import com.example.spring.service.BaseDataService;
import com.example.spring.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 基础数据查询控制器
 * 提供公司/部门/员工/业务类型/城市/项目的下拉选项数据
 */
@RestController
@RequestMapping("/api")
public class BaseDataController {

    @Autowired
    private BaseDataService baseDataService;

    /** 查询公司列表 */
    @GetMapping("/company/list")
    public Result<List<ReimCompany>> getCompanyList() {
        return Result.success(baseDataService.getCompanyList());
    }

    /** 查询部门列表 */
    @GetMapping("/department/list")
    public Result<List<ReimDepartment>> getDepartmentList() {
        return Result.success(baseDataService.getDepartmentList());
    }

    /** 查询员工列表 */
    @GetMapping("/employee/list")
    public Result<List<ReimEmployee>> getEmployeeList() {
        return Result.success(baseDataService.getEmployeeList());
    }

    /** 查询业务类型列表（全量，前端自行构建树形） */
    @GetMapping("/business-type/tree")
    public Result<List<ReimBusinessType>> getBusinessTypeTree() {
        return Result.success(baseDataService.getBusinessTypeTree());
    }

    /** 查询城市列表 */
    @GetMapping("/city/list")
    public Result<List<ReimCity>> getCityList() {
        return Result.success(baseDataService.getCityList());
    }

    /** 查询项目列表 */
    @GetMapping("/project/list")
    public Result<List<ReimProject>> getProjectList() {
        return Result.success(baseDataService.getProjectList());
    }
}
