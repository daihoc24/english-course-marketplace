package com.example.back_end.controller;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.EmailVerificationResponse;
import com.example.back_end.entity.EmailVerificationCode;
import com.example.back_end.exception.ErrorCode;
import com.example.back_end.repositories.EmailVerificationCodeRepository;
import com.example.back_end.repositories.UserRepository;
import com.example.back_end.service.AuthService;
import com.example.back_end.service.SendEmailService;
import com.nimbusds.jose.JOSEException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
public class SendMailController {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern CODE_PATTERN = Pattern.compile("^\\d{6}$");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int VERIFICATION_CODE_TTL_MINUTES = 10;

    private final SendEmailService sendEmailService;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final EmailVerificationCodeRepository emailVerificationCodeRepository;

    @Value("${app.public-api-base-url}")
    private String publicApiBaseUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostMapping("/verifyRegister")
    ApiResponse<EmailVerificationResponse> verifyRegister(@RequestParam("email") String email) {
        String normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(400)
                    .message("Email không hợp lệ.")
                    .build();
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(ErrorCode.USER_EXISTED.getCode())
                    .message("Email này đã được đăng ký.")
                    .build();
        }

        String code = generateCode();
        LocalDateTime now = LocalDateTime.now();
        emailVerificationCodeRepository.save(EmailVerificationCode.builder()
                .email(normalizedEmail)
                .code(code)
                .createdAt(now)
                .expiresAt(now.plusMinutes(VERIFICATION_CODE_TTL_MINUTES))
                .build());

        EmailVerificationResponse payload = EmailVerificationResponse.builder()
                .email(normalizedEmail)
                .sent(false)
                .codeRequired(true)
                .expiresInMinutes(VERIFICATION_CODE_TTL_MINUTES)
                .build();

        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            payload.setDemoCode(code);
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(0)
                    .message("Chế độ demo: dùng mã xác thực bên dưới để tiếp tục đăng ký.")
                    .result(payload)
                    .build();
        }

        try {
            String body = """
                    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                      <h2>Xác thực email đăng ký</h2>
                      <p>Mã xác thực của bạn là:</p>
                      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">%s</p>
                      <p>Mã có hiệu lực trong %d phút. Không chia sẻ mã này cho người khác.</p>
                    </div>
                    """.formatted(code, VERIFICATION_CODE_TTL_MINUTES);
            sendEmailService.sendMail(normalizedEmail, "Mã xác thực đăng ký", body);
            payload.setSent(true);
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(0)
                    .message("Đã gửi mã xác thực. Vui lòng kiểm tra hộp thư.")
                    .result(payload)
                    .build();
        } catch (MailException | MessagingException exception) {
            payload.setDemoCode(code);
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(0)
                    .message("Chưa gửi được email trong môi trường hiện tại. Dùng mã demo bên dưới để tiếp tục đăng ký.")
                    .result(payload)
                    .build();
        }
    }

    @PostMapping("/verifyRegister/confirm")
    ApiResponse<EmailVerificationResponse> confirmRegisterCode(
            @RequestParam("email") String email,
            @RequestParam("code") String code
    ) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedCode = code == null ? "" : code.trim();

        if (!isValidEmail(normalizedEmail) || !CODE_PATTERN.matcher(normalizedCode).matches()) {
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(400)
                    .message("Mã xác thực không hợp lệ.")
                    .build();
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(ErrorCode.USER_EXISTED.getCode())
                    .message("Email này đã được đăng ký.")
                    .build();
        }

        EmailVerificationCode savedCode = emailVerificationCodeRepository
                .findTopByEmailAndCodeAndConsumedAtIsNullOrderByCreatedAtDesc(normalizedEmail, normalizedCode)
                .orElse(null);

        if (savedCode == null || savedCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ApiResponse.<EmailVerificationResponse>builder()
                    .code(400)
                    .message("Mã xác thực không đúng hoặc đã hết hạn.")
                    .build();
        }

        savedCode.setConsumedAt(LocalDateTime.now());
        emailVerificationCodeRepository.save(savedCode);

        return ApiResponse.<EmailVerificationResponse>builder()
                .code(0)
                .message("Email đã được xác thực.")
                .result(EmailVerificationResponse.builder()
                        .email(normalizedEmail)
                        .sent(true)
                        .codeRequired(false)
                        .build())
                .build();
    }

    @PostMapping("/forgotPassword")
    ApiResponse<Void> forgotPassword(@RequestParam("email") String email)
            throws ParseException, JOSEException, MessagingException {
        String normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            return ApiResponse.<Void>builder()
                    .code(400)
                    .message("Email không hợp lệ.")
                    .build();
        }
        if (userRepository.findByEmail(normalizedEmail).isEmpty()) {
            return ApiResponse.<Void>builder()
                    .code(ErrorCode.USER_NOT_EXISTED.getCode())
                    .message("Email chưa được đăng ký.")
                    .build();
        }

        String token = authService.createPasswordResetToken(normalizedEmail);
        String link = publicApiBaseUrl + "/auth/verifyAccount?token=" + token;
        String body = "<p>Nhấn vào liên kết sau để đặt lại mật khẩu:</p>"
                + "<p><a href=\"" + link + "\">Đặt lại mật khẩu</a></p>";
        sendEmailService.sendMail(normalizedEmail, "Đặt lại mật khẩu", body);

        return ApiResponse.<Void>builder()
                .code(0)
                .message("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.")
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private boolean isValidEmail(String email) {
        return EMAIL_PATTERN.matcher(email).matches();
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }
}
