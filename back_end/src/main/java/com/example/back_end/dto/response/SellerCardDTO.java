package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerCardDTO {
    private Integer id;
    private String fullname;
    private String avatar;
    /** Giới thiệu ngắn (đã cắt) — dùng như dòng "chuyên môn" trên UI */
    private String introduce;
    private String certificate;
    private Double averageRating;
    private Integer totalStudents;
    private Integer totalCourses;
    private Integer activeCourses;
}
