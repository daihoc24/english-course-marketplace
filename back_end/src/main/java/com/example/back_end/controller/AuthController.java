package com.example.back_end.controller;

import com.example.back_end.dto.request.IntrospectRequest;
import com.example.back_end.dto.request.LoginRequest;
import com.example.back_end.dto.request.ResetPasswordRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.AuthenticationResponse;
import com.example.back_end.dto.response.IntrospectResponse;
import com.example.back_end.service.AuthService;
import com.example.back_end.service.SendEmailService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;

@RestController
@RequestMapping("/auth")

public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    SendEmailService sendEmailService;
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> login(@RequestBody LoginRequest request) {
        var res = authService.login(request);
        return ApiResponse.<AuthenticationResponse>builder().result(res).build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> autResponse(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        authService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/verifyAccount")
    public void verifyAccount(@RequestParam("token") String token, HttpServletResponse response)
            throws ParseException, JOSEException, IOException {
        IntrospectRequest request = new IntrospectRequest(token);
        var result = authService.introspect(request);
        if (!result.isValid()) {
            response.sendRedirect(frontendBaseUrl + "/auth/login?verify=invalid");
            return;
        }
        String email = result.getEmail();
        String tokenUse = authService.getTokenUse(token);
        if ("PASSWORD_RESET".equals(tokenUse)) {
            String enc = URLEncoder.encode(token, StandardCharsets.UTF_8);
            response.sendRedirect(frontendBaseUrl + "/auth/reset-password?token=" + enc);
        } else {
            response.sendRedirect(frontendBaseUrl + "/auth/email-verified?email="
                    + URLEncoder.encode(email, StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/reset-password")
    ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest body)
            throws ParseException, JOSEException {
        authService.resetPasswordWithToken(body.getToken(), body.getNewPassword());
        return ApiResponse.<Void>builder()
                .code(0)
                .message("Đã đặt lại mật khẩu.")
                .build();
    }
}
