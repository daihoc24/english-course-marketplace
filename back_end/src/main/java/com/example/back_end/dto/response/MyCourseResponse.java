package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyCourseResponse {
    private Integer orderId;
    private Integer courseId;
    private String courseName;
    private String courseImage;
    private String description;
    private String sellerName;
    private Double rating;
    private Double pricePaid;
    private String status;
    private LocalDate dateOrder;
    private LocalDate refundEligibleUntil;
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer progressPercent;
}
