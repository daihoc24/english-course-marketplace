package com.example.back_end.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailVerificationResponse {
    private String email;
    private boolean sent;
    private String verificationUrl;
    private boolean codeRequired;
    private Integer expiresInMinutes;
    private String demoCode;
}
