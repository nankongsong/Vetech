package com.example.spring.exception;

import com.example.spring.vo.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 * 统一捕获并处理各类异常，返回标准Result格式
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常处理
     */
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBizException(BizException e) {
        log.warn("业务异常：code={}, msg={}", e.getCode(), e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 运行时异常处理
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<Void> handleRuntimeException(RuntimeException e) {
        log.error("系统异常：", e);
        return Result.error("系统内部错误，请联系管理员");
    }

    /**
     * 通用异常处理
     */
//    @ExceptionHandler(Exception.class)
//    public Result<Void> handleException(Exception e) {
//        log.error("未知异常：", e);
//        return Result.error("系统内部错误，请联系管理员");
//    }
}
