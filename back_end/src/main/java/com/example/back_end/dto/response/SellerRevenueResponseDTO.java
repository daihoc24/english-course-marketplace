package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerRevenueResponseDTO {
    private Double totalRevenue;
    private Double monthlyRevenue;
    private List<MonthlyRevenueData> monthlyData;
    private List<TransactionData> transactions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueData {
        private String month;
        private Double revenue;
        private Integer orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionData {
        private Integer orderId;
        private Integer courseId;
        private String courseName;
        private String learnerName;
        private LocalDate dateOrder;
        private Double amount;
        private String status;
    }
} 
