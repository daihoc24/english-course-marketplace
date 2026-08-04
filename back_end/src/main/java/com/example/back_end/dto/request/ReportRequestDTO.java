package com.example.back_end.dto.request;

import lombok.Data;

@Data
public class ReportRequestDTO {
    private Long courseId;
    private String subject;
    private String detail;
    private String category;
    private String priority;
}
