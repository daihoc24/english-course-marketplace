package com.example.back_end.configuration;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final String[] PUBLIC_ENDPOINTS_POST_PERMIT_ALL = {"/users/createUser", "users/createUser",
            "/auth/login", "auth/login", "/auth/introspect", "auth/introspect",
            "/auth/reset-password", "auth/reset-password", "/verifyRegister", "/verifyRegister/**",
            "/forgotPassword", "forgotPassword", "/users/existUser", "users/existUser"};
    private static final String[] PUBLIC_ENDPOINTS_GET_PERMIT_ALL = {"/auth/verifyAccount", "/courses",
            "/courses/categories", "/courses/{id}", "/courses/details/{id}", "/courses/{id}/learning-content", "/courses/{courseId}/comments",
            "/courses/search/**", "/seller/{sellerId}/courses",
            "/seller/teachers/catalog", "/seller/{courseId}", "/users/id/{userId}", "/notifications/stream"};
    private static final String[] AUTHENTICATED_GET_ENDPOINTS = {"/sendEmail", "/payment/vnpay/**", "/reports/**", "/order/**", "/courses/*/progress"};
    private static final String[] AUTHENTICATED_POST_ENDPOINTS = {"/auth/logout", "/favorites/add", "/payment/paypal/**", "/courses/*/progress/**"};
    private static final String[] AUTHENTICATED_DELETE_ENDPOINTS = {"/favorites/remove", "/courses/*/progress/**"};

    @Value("${jwt.signer-key}")
    protected String signerKey;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(cors -> cors.configurationSource(request -> {
                    var configuration = new org.springframework.web.cors.CorsConfiguration();
                    configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                            .map(String::trim)
                            .filter(origin -> !origin.isEmpty())
                            .toList());
                    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    configuration.setAllowedHeaders(List.of("*"));
                    configuration.setAllowCredentials(true);
                    return configuration;
                }))
                .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl("/auth/oauth2/success", true))
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS_POST_PERMIT_ALL).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_ENDPOINTS_GET_PERMIT_ALL).permitAll()
                        .requestMatchers(HttpMethod.GET, AUTHENTICATED_GET_ENDPOINTS).authenticated()
                        .requestMatchers(HttpMethod.POST, AUTHENTICATED_POST_ENDPOINTS).authenticated()
                        .requestMatchers(HttpMethod.DELETE, AUTHENTICATED_DELETE_ENDPOINTS).authenticated()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder())))
                .exceptionHandling(exception -> exception.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.builder()
                            .code(ErrorCode.UNAUTHENTICATED.getCode())
                            .message(ErrorCode.UNAUTHENTICATED.getMessage())
                            .build()));
                }))
                .csrf(AbstractHttpConfigurer::disable);
        return httpSecurity.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
        return NimbusJwtDecoder.withSecretKey(secretKeySpec).macAlgorithm(MacAlgorithm.HS512).build();
    }
}
