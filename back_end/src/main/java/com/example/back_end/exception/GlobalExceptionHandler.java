package com.example.back_end.exception;

import com.example.back_end.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.el.util.ExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLIntegrityConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException (MethodArgumentNotValidException exception){
        ApiResponse apiResponse = new ApiResponse();
        ErrorCode invalidPassword = ErrorCode.INVALID_PASSWORD;
        apiResponse.setCode(invalidPassword.getCode());
        apiResponse.setMessage(invalidPassword.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingValidationException (AppException exception){
        ApiResponse apiResponse = new ApiResponse();
        ErrorCode errorCode = exception.getErrorCode();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setResult(errorCode.getStatusCode());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Throwable rootCause = getRootCause(ex);
        String message = "Dữ liệu không hợp lệ";
        if (rootCause instanceof SQLIntegrityConstraintViolationException sqlEx) {
            String detailedMessage = sqlEx.getMessage();
            System.out.println("🔥 Chi tiết lỗi SQL: " + detailedMessage);
            if (detailedMessage.contains("users.email_UNIQUE")) {
                message = "Email đã tồn tại";
            }
        }
        ApiResponse apiResponse = new ApiResponse();
        ErrorCode invalidPassword = ErrorCode.UNAUTHORIZED;
        apiResponse.setCode(invalidPassword.getCode());
        apiResponse.setMessage(message);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(400);
        apiResponse.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    public static Throwable getRootCause(Throwable throwable) {
        Throwable cause;
        while ((cause = throwable.getCause()) != null && throwable != cause) {
            throwable = cause;
        }
        return throwable;
    }


}
