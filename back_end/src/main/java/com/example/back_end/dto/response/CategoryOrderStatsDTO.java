package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryOrderStatsDTO {
    private Integer categoryId;
    private Long totalOrders;
    private Double totalRevenue;
}
