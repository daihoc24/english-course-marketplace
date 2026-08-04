package com.example.back_end.dto.response;

import com.example.back_end.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Integer id;
    private Integer idUser;
    private String userName;
    private String userEmail;
    private Course idCourse;
    private Integer courseId;
    private String courseName;
    private String courseImage;
    private LocalDate dateOrder;
    private String status;
    private Double pricePaid;
    private LocalDate refundEligibleUntil;
}
