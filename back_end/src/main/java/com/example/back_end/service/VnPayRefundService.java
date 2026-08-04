package com.example.back_end.service;

import com.example.back_end.configuration.VnpayConfig;
import com.example.back_end.entity.PaymentTransaction;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class VnPayRefundService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public RefundResult refund(PaymentTransaction transaction, String createBy, String reason, HttpServletRequest request) {
        if (transaction.getTransactionRef() == null || transaction.getTransactionRef().isBlank()) {
            throw new IllegalArgumentException("Thiếu mã đơn hàng VNPay để hoàn tiền");
        }
        if (transaction.getGatewayTransactionDate() == null || transaction.getGatewayTransactionDate().isBlank()) {
            throw new IllegalArgumentException("Thiếu ngày giao dịch VNPay để hoàn tiền");
        }

        String createDate = nowVnPay();
        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 32);
        String transactionNo = transaction.getGatewayTransactionId() == null ? "" : transaction.getGatewayTransactionId();
        String orderInfo = reason == null || reason.isBlank()
                ? "Hoan tien khoa hoc"
                : stripUnsafe(reason);
        String ipAddress = VnpayConfig.getIpAddress(request);
        String createUser = stripUnsafe(createBy == null || createBy.isBlank() ? "admin" : createBy);

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("vnp_RequestId", requestId);
        payload.put("vnp_Version", "2.1.0");
        payload.put("vnp_Command", "refund");
        payload.put("vnp_TmnCode", VnpayConfig.vnp_TmnCode);
        payload.put("vnp_TransactionType", "02");
        payload.put("vnp_TxnRef", transaction.getTransactionRef());
        payload.put("vnp_Amount", String.valueOf(transaction.getAmountVnd() * 100));
        payload.put("vnp_OrderInfo", orderInfo);
        payload.put("vnp_TransactionNo", transactionNo);
        payload.put("vnp_TransactionDate", transaction.getGatewayTransactionDate());
        payload.put("vnp_CreateBy", createUser);
        payload.put("vnp_CreateDate", createDate);
        payload.put("vnp_IpAddr", ipAddress);

        String data = String.join("|",
                payload.get("vnp_RequestId"),
                payload.get("vnp_Version"),
                payload.get("vnp_Command"),
                payload.get("vnp_TmnCode"),
                payload.get("vnp_TransactionType"),
                payload.get("vnp_TxnRef"),
                payload.get("vnp_Amount"),
                payload.get("vnp_TransactionNo"),
                payload.get("vnp_TransactionDate"),
                payload.get("vnp_CreateBy"),
                payload.get("vnp_CreateDate"),
                payload.get("vnp_IpAddr"),
                payload.get("vnp_OrderInfo")
        );
        payload.put("vnp_SecureHash", VnpayConfig.hmacSHA512(VnpayConfig.vnp_HashSecret, data));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(payload), headers);
            ResponseEntity<String> response = restTemplate.exchange(VnpayConfig.vnp_ApiUrl, HttpMethod.POST, entity, String.class);
            JsonNode body = objectMapper.readTree(response.getBody());
            String responseCode = body.path("vnp_ResponseCode").asText("");
            String message = body.path("vnp_Message").asText(body.path("vnp_ResponseMessage").asText(""));
            if (!"00".equals(responseCode)) {
                throw new RuntimeException("VNPay từ chối hoàn tiền: " + responseCode + (message.isBlank() ? "" : " - " + message));
            }
            String refundTransactionNo = body.path("vnp_TransactionNo").asText(requestId);
            return new RefundResult(refundTransactionNo, "COMPLETED", response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("VNPay refund returned {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("VNPay từ chối hoàn tiền: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Không thể hoàn tiền VNPay: {}", e.getMessage());
            throw new RuntimeException("Không thể hoàn tiền VNPay", e);
        }
    }

    private String nowVnPay() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return formatter.format(new Date());
    }

    private String stripUnsafe(String value) {
        return value.replace("|", " ").replace("\n", " ").replace("\r", " ").trim();
    }

    public record RefundResult(String refundId, String status, String rawResponse) {
    }
}
