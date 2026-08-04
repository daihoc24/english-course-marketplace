package com.example.back_end.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResourceResponse {
    private Long id;
    private Long lessonId;
    private String title;
    private String type;
    private String url;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private Integer sortOrder;
}
