package com.example.back_end.controller;

import com.example.back_end.dto.UserDto;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.entity.User;
import com.example.back_end.service.AuthService;
import com.example.back_end.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.URLEncoder;



@RestController
@RequestMapping("/auth/oauth2")
@RequiredArgsConstructor
@Slf4j
public class OAuth2Controller {

    private final UserService userService;
    private final AuthService authService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @GetMapping("/success")
    public ResponseEntity<Void> handleOAuth2Success(OAuth2AuthenticationToken token) {
        try {
            OAuth2User oauth2User = token.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String picture = oauth2User.getAttribute("picture");

            User user = userService.findOrCreateOAuth2User(email, name, picture);
            String jwtToken = authService.generateToken(user);

            UserDto userDto = new ModelMapper().map(user, UserDto.class);

            String redirectUrl = String.format("%s/auth/oauth2/callback?token=%s&user=%s", frontendBaseUrl,
                    jwtToken, URLEncoder.encode(objectMapper.writeValueAsString(userDto), "UTF-8"));

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();

        } catch (Exception e) {
            log.error("OAuth2 login failed", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendBaseUrl + "/login?error=oauth2_failed")
                    .build();
        }
    }

    @GetMapping("/failure")
    public ResponseEntity<ApiResponse<String>> handleOAuth2Failure() {
        return ResponseEntity.badRequest().body(
                ApiResponse.<String>builder()
                        .code(1)
                        .message("OAuth2 authentication failed")
                        .build()
        );
    }
}
