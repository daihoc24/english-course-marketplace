package com.example.back_end.service;

import com.example.back_end.configuration.PayPalConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Slf4j
public class PayPalService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Lấy access token từ PayPal sandbox bằng client credentials.
     * Gọi POST /v1/oauth2/token với Basic Auth.
     */
    public String getAccessToken() {
        String url = PayPalConfig.baseUrl + "/v1/oauth2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(PayPalConfig.clientId, PayPalConfig.clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>("grant_type=client_credentials", headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("Lỗi lấy PayPal access token: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy access token từ PayPal", e);
        }
    }

    /**
     * Tạo đơn hàng PayPal với intent=CAPTURE.
     * Quy đổi VND → USD (chia cho 25000), gọi POST /v2/checkout/orders.
     * Trả về approval URL để redirect người dùng.
     */
    public CreatedOrder createOrder(long amountVND, int courseId, int userId) {
        String accessToken = getAccessToken();
        String url = PayPalConfig.baseUrl + "/v2/checkout/orders";

        // Quy đổi VND sang USD
        String formattedAmount = formatUsdAmount(amountVND);

        // Build return URL với courseId và userId
        String returnUrl = PayPalConfig.returnUrl + "?paypal=success&courseId=" + courseId + "&userId=" + userId;
        String cancelUrl = PayPalConfig.returnUrl + "?paypal=cancel&courseId=" + courseId + "&userId=" + userId;

        // Build request body
        Map<String, Object> orderRequest = new LinkedHashMap<>();
        orderRequest.put("intent", "CAPTURE");

        // Purchase units
        Map<String, Object> purchaseUnit = new LinkedHashMap<>();
        Map<String, String> amount = new LinkedHashMap<>();
        amount.put("currency_code", "USD");
        amount.put("value", formattedAmount);
        purchaseUnit.put("amount", amount);
        purchaseUnit.put("custom_id", String.valueOf(courseId));
        orderRequest.put("purchase_units", Collections.singletonList(purchaseUnit));

        // Application context (redirect URLs)
        Map<String, String> applicationContext = new LinkedHashMap<>();
        applicationContext.put("return_url", returnUrl);
        applicationContext.put("cancel_url", cancelUrl);
        orderRequest.put("application_context", applicationContext);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        try {
            String body = objectMapper.writeValueAsString(orderRequest);
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String orderId = jsonNode.path("id").asText();

            // Tìm approval URL trong links
            JsonNode links = jsonNode.get("links");
            if (!orderId.isBlank() && links != null) {
                for (JsonNode link : links) {
                    if ("approve".equals(link.get("rel").asText())) {
                        return new CreatedOrder(orderId, link.get("href").asText());
                    }
                }
            }

            log.error("Không tìm thấy approval URL trong response PayPal");
            throw new RuntimeException("Không tìm thấy approval URL từ PayPal");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi tạo đơn hàng PayPal: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo đơn hàng PayPal", e);
        }
    }

    /**
     * Capture đơn hàng PayPal sau khi người dùng approve.
     * Gọi POST /v2/checkout/orders/{token}/capture.
     * Trả về true nếu capture thành công, false nếu thất bại.
     */
    public CaptureResult captureOrder(String token, long expectedAmountVnd, int expectedCourseId) {
        String accessToken = getAccessToken();
        String url = PayPalConfig.baseUrl + "/v2/checkout/orders/" + token + "/capture";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<String> request = new HttpEntity<>("", headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            if (!"COMPLETED".equals(jsonNode.path("status").asText())) {
                return CaptureResult.failed();
            }

            JsonNode purchaseUnit = jsonNode.path("purchase_units").path(0);
            JsonNode capture = purchaseUnit.path("payments").path("captures").path(0);
            JsonNode capturedAmount = capture.path("amount");
            String actualCustomId = purchaseUnit.path("custom_id").asText("");
            if (!actualCustomId.isBlank() && !String.valueOf(expectedCourseId).equals(actualCustomId)) {
                log.warn("PayPal capture custom_id mismatch. expectedCourseId={}, actualCustomId={}",
                        expectedCourseId, actualCustomId);
            }

            boolean amountMatches = "USD".equals(capturedAmount.path("currency_code").asText())
                    && formatUsdAmount(expectedAmountVnd).equals(capturedAmount.path("value").asText());
            if (!amountMatches) {
                log.warn("PayPal capture amount mismatch. expectedUsd={}, actualCurrency={}, actualValue={}",
                        formatUsdAmount(expectedAmountVnd),
                        capturedAmount.path("currency_code").asText(),
                        capturedAmount.path("value").asText());
            }
            return amountMatches
                    ? new CaptureResult(capture.path("id").asText(), capture.path("status").asText(), capturedAmount.path("currency_code").asText(), capturedAmount.path("value").asText())
                    : CaptureResult.failed();
        } catch (HttpStatusCodeException e) {
            log.warn("PayPal capture returned {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return isOrderAlreadyCompleted(token, accessToken, expectedAmountVnd, expectedCourseId);
        } catch (Exception e) {
            log.error("Lỗi capture đơn hàng PayPal: {}", e.getMessage());
            return CaptureResult.failed();
        }
    }

    public RefundResult refundCapture(String captureId, long amountVnd, String note, String idempotencyKey) {
        if (captureId == null || captureId.isBlank()) {
            throw new IllegalArgumentException("Thiếu mã capture PayPal để hoàn tiền");
        }
        String accessToken = getAccessToken();
        String url = PayPalConfig.baseUrl + "/v2/payments/captures/" + captureId + "/refund";

        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, String> amount = new LinkedHashMap<>();
        amount.put("currency_code", "USD");
        amount.put("value", formatUsdAmount(amountVnd));
        body.put("amount", amount);
        body.put("note_to_payer", note == null || note.isBlank() ? "Hoàn tiền khóa học" : note);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        headers.set("PayPal-Request-Id", idempotencyKey);
        headers.set("Prefer", "return=representation");

        try {
            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String status = jsonNode.path("status").asText("");
            if (!"COMPLETED".equals(status) && !"PENDING".equals(status)) {
                throw new RuntimeException("PayPal trả trạng thái hoàn tiền không hợp lệ: " + status);
            }
            return new RefundResult(jsonNode.path("id").asText(), status, response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("PayPal refund returned {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("PayPal từ chối hoàn tiền: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Không thể hoàn tiền PayPal: {}", e.getMessage());
            throw new RuntimeException("Không thể hoàn tiền PayPal", e);
        }
    }

    private CaptureResult isOrderAlreadyCompleted(String token, String accessToken, long expectedAmountVnd, int expectedCourseId) {
        String url = PayPalConfig.baseUrl + "/v2/checkout/orders/" + token;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> request = new HttpEntity<>("", headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            if (!"COMPLETED".equals(jsonNode.path("status").asText())) {
                return CaptureResult.failed();
            }

            JsonNode purchaseUnit = jsonNode.path("purchase_units").path(0);
            JsonNode capture = purchaseUnit.path("payments").path("captures").path(0);
            JsonNode capturedAmount = capture.path("amount");
            String actualCustomId = purchaseUnit.path("custom_id").asText("");
            if (!actualCustomId.isBlank() && !String.valueOf(expectedCourseId).equals(actualCustomId)) {
                log.warn("PayPal completed order custom_id mismatch. expectedCourseId={}, actualCustomId={}",
                        expectedCourseId, actualCustomId);
            }

            boolean amountMatches = "USD".equals(capturedAmount.path("currency_code").asText())
                    && formatUsdAmount(expectedAmountVnd).equals(capturedAmount.path("value").asText());
            if (!amountMatches) {
                log.warn("PayPal completed order amount mismatch. expectedUsd={}, actualCurrency={}, actualValue={}",
                        formatUsdAmount(expectedAmountVnd),
                        capturedAmount.path("currency_code").asText(),
                        capturedAmount.path("value").asText());
            }
            return amountMatches
                    ? new CaptureResult(capture.path("id").asText(), capture.path("status").asText(), capturedAmount.path("currency_code").asText(), capturedAmount.path("value").asText())
                    : CaptureResult.failed();
        } catch (HttpStatusCodeException e) {
            log.warn("PayPal order lookup returned {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return CaptureResult.failed();
        } catch (Exception e) {
            log.error("Không thể kiểm tra lại trạng thái đơn PayPal {}: {}", token, e.getMessage());
            return CaptureResult.failed();
        }
    }

    private String formatUsdAmount(long amountVnd) {
        return BigDecimal.valueOf(amountVnd)
                .divide(BigDecimal.valueOf(PayPalConfig.vndToUsdRate), 2, RoundingMode.HALF_UP)
                .toPlainString();
    }

    public record CreatedOrder(String orderId, String approvalUrl) {
    }

    public record CaptureResult(String captureId, String status, String currencyCode, String value) {
        public boolean success() {
            return captureId != null && !captureId.isBlank() && "COMPLETED".equals(status);
        }

        public static CaptureResult failed() {
            return new CaptureResult(null, "FAILED", null, null);
        }
    }

    public record RefundResult(String refundId, String status, String rawResponse) {
    }
}
