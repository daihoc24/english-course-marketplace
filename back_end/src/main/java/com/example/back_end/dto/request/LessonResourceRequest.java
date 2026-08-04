package com.example.back_end.dto.request;

import lombok.Data;

@Data
public class LessonResourceRequest {
    private String title;
    private String type;
    private String url;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private Integer sortOrder;
}
