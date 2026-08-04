package com.example.back_end.configuration;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.lang.reflect.Field;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityConfigTest {

    @Test
    void createsHs512JwtDecoderFromRuntimeSigningKey() {
        SecurityConfig config = new SecurityConfig();
        config.signerKey = "portfolio-test-signing-key-that-is-long-enough-for-hs512-security";

        JwtDecoder decoder = config.jwtDecoder();

        assertNotNull(decoder);
    }

    @Test
    void registrationEmailVerificationEndpointIsPublicPost() throws Exception {
        Field field = SecurityConfig.class.getDeclaredField("PUBLIC_ENDPOINTS_POST_PERMIT_ALL");
        field.setAccessible(true);
        String[] publicPostEndpoints = (String[]) field.get(null);

        assertTrue(Arrays.asList(publicPostEndpoints).contains("/verifyRegister"));
    }

    @Test
    void directOrderPostWildcardIsNotExposed() throws Exception {
        Field field = SecurityConfig.class.getDeclaredField("AUTHENTICATED_POST_ENDPOINTS");
        field.setAccessible(true);
        String[] authenticatedPostEndpoints = (String[]) field.get(null);

        assertFalse(Arrays.asList(authenticatedPostEndpoints).contains("/order/**"));
    }
}
