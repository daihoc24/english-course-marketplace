package com.example.back_end.configuration;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PayPalConfig {

    @Value("${paypal.client-id}")
    private String paypalClientId;

    @Value("${paypal.client-secret}")
    private String paypalClientSecret;

    @Value("${paypal.base-url}")
    private String paypalBaseUrl;

    @Value("${paypal.return-url}")
    private String paypalReturnUrl;

    @Value("${paypal.vnd-to-usd-rate}")
    private double paypalVndToUsdRate;

    // Static fields populated from @Value after construction
    public static String clientId;
    public static String clientSecret;
    public static String baseUrl;
    public static String returnUrl;
    public static double vndToUsdRate;

    @PostConstruct
    private void init() {
        clientId = paypalClientId;
        clientSecret = paypalClientSecret;
        baseUrl = paypalBaseUrl;
        returnUrl = paypalReturnUrl;
        vndToUsdRate = paypalVndToUsdRate;
    }
}
