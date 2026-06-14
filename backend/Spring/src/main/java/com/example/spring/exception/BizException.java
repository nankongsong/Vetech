package com.example.spring.exception;

import lombok.Getter;

/**
 * 业务异常类
 * 用于在Service层抛出业务校验不通过等异常，由全局异常处理器统一捕获
 */
@Getter
public class BizException extends RuntimeException {

    /** 错误码 */
    private final int code;

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BizException(String message) {
        super(message);
        this.code = 500;
    }
}
