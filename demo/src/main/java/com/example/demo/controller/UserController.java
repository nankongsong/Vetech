package com.example.demo.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.dto.StudentDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户接口 —— 演示常用 Spring MVC 注解用法
 */
@RestController                          // ① 组合注解 = @Controller + @ResponseBody
@RequestMapping("/users")                // ② 统一路径前缀
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public List<User> list() {
        return userService.list();
    }

    @GetMapping("/age")
    public List<StudentDTO> age(){
        return userService.getInfo();
    }
//    @GetMapping("/getMath")
//    public IPage<UserDTO> getMath(){
//        return userService.getName();
//    }
    // ==================== 请求映射注解 ====================

    /**
     * GET /users —— 查询用户列表
     * @GetMapping = @RequestMapping(method = RequestMethod.GET)
     */
   @GetMapping("/getUser")// ③ GET 请求
    public String getUser(){
        return "hello";
    }
    @ResponseBody
   // public Result
//    public List<String> list() {
//        return List.of("张三", "李四", "王五");
//    }

    /**
     * GET /users/{id} —— 按 ID 查询
     * @PathVariable 从 URL 路径中取值
     */
    @GetMapping("/{id}")                 // ④ 路径变量
    public String getById(@PathVariable("id") Long id) {
        return "用户ID: " + id;
    }

    /**
     * POST /users —— 新增用户
     * @RequestBody 把 JSON 请求体自动反序列化为 Java 对象
     */
    @PostMapping                         // ⑤ POST 请求
    public String create(@RequestBody Map<String, Object> body) {
        return "新增用户: " + body.get("name");
    }

    /**
     * PUT /users/{id} —— 全量更新
     */
    @PutMapping("/{id}")                 // ⑥ PUT 请求
    public String update(@PathVariable Long id,
                         @RequestBody Map<String, Object> body) {
        return "更新用户 " + id + " -> " + body.get("name");
    }

    /**
     * DELETE /users/{id} —— 删除用户
     */
    @DeleteMapping("/{id}")              // ⑦ DELETE 请求
    public String delete(@PathVariable Long id) {
        return "删除用户: " + id;
    }

    // ==================== 参数绑定注解 ====================

    /**
     * GET /users/search?keyword=xxx&page=1
     * @RequestParam 绑定 URL 查询参数，可设默认值、是否必填
     */
    @GetMapping("/search")               // ⑧ 查询参数
    public String search(@RequestParam("keyword") String keyword,
                         @RequestParam(value = "page", defaultValue = "1") int page) {
        return "搜索 '" + keyword + "' 第 " + page + " 页";
    }

    /**
     * PATCH /users/{id} —— 局部更新
     */
    @PatchMapping("/{id}")               // ⑨ PATCH 请求
    public String patch(@PathVariable Long id,
                        @RequestBody Map<String, Object> partial) {
        return "局部更新用户 " + id;
    }
//    @GetMapping("/getUserList")
//    public List<User> getUserList(){
//        List<User> userlist = userService.list();
//        return userlist;
//    }

}
