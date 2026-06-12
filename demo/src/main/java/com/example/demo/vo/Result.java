package com.example.demo.vo;

import lombok.Data;

import java.io.Serializable;

/*
前端统一工具类
 */
@Data
public class Result<T> implements Serializable {
    private static final long serializatonUID = 1L;
    private int code;
    private String msg;
    private T data;

//    public static <T> Result<T> success(T data){
//        Result<T> result = new Result<T>();
//        result.setCode(200);
//
//    }
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("操作成功");
        result.setData(data);
        return result;
    }
}
