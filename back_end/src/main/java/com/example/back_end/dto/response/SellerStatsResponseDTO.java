package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerStatsResponseDTO {
    private Integer totalCourses;
    private Integer activeCourses;
    private Integer pendingCourses;
    private Integer totalStudents;
    private Double totalRevenue;
    private Double averageRating;
    private Integer totalOrders;
} 