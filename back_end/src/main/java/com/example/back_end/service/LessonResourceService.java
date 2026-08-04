package com.example.back_end.service;

import com.example.back_end.dto.request.LessonResourceRequest;
import com.example.back_end.dto.response.LessonResourceResponse;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.LessonResource;
import com.example.back_end.repositories.LessonResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class LessonResourceService {
    private static final int MAX_RESOURCES_PER_LESSON = 20;

    private final LessonResourceRepository lessonResourceRepository;

    @Transactional(readOnly = true)
    public List<LessonResourceResponse> getResponses(Long lessonId) {
        return lessonResourceRepository.findByLesson_IdOrderBySortOrderAscIdAsc(lessonId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<LessonResourceResponse> replaceResources(CourseDetail lesson, List<LessonResourceRequest> requests) {
        List<LessonResourceRequest> safeRequests = requests == null ? List.of() : requests.stream()
                .filter(Objects::nonNull)
                .filter(request -> !blank(request.getTitle()) || !blank(request.getUrl()))
                .toList();
        if (safeRequests.size() > MAX_RESOURCES_PER_LESSON) {
            throw new IllegalArgumentException("Mỗi bài học chỉ được đính kèm tối đa " + MAX_RESOURCES_PER_LESSON + " tài liệu");
        }

        lessonResourceRepository.deleteByLesson_Id(lesson.getId());
        List<LessonResource> resources = IntStream.range(0, safeRequests.size())
                .mapToObj(index -> toEntity(lesson, safeRequests.get(index), index))
                .toList();
        return lessonResourceRepository.saveAll(resources).stream().map(this::toResponse).toList();
    }

    public LessonResourceResponse toResponse(LessonResource resource) {
        return LessonResourceResponse.builder()
                .id(resource.getId())
                .lessonId(resource.getLesson() == null ? null : resource.getLesson().getId())
                .title(resource.getTitle())
                .type(resource.getType())
                .url(resource.getUrl())
                .fileName(resource.getFileName())
                .mimeType(resource.getMimeType())
                .fileSize(resource.getFileSize())
                .sortOrder(resource.getSortOrder())
                .build();
    }

    private LessonResource toEntity(CourseDetail lesson, LessonResourceRequest request, int index) {
        String url = trimToNull(request.getUrl());
        String title = trimToNull(request.getTitle());
        if (title == null) {
            title = url == null ? "Tài liệu bài học" : "Liên kết tài liệu";
        }
        String type = normalizeType(request.getType(), url);
        return LessonResource.builder()
                .lesson(lesson)
                .title(limit(title, 255))
                .type(type)
                .url(limit(url, 1000))
                .fileName(limit(trimToNull(request.getFileName()), 255))
                .mimeType(limit(trimToNull(request.getMimeType()), 120))
                .fileSize(request.getFileSize())
                .sortOrder(request.getSortOrder() == null ? index + 1 : request.getSortOrder())
                .build();
    }

    private String normalizeType(String value, String url) {
        String type = trimToNull(value);
        if (type == null) return url == null ? "TEXT" : "LINK";
        type = type.toUpperCase(Locale.ROOT);
        return switch (type) {
            case "FILE", "PDF", "ZIP", "TEXT" -> type;
            default -> "LINK";
        };
    }

    private boolean blank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String text = value.trim();
        return text.isEmpty() ? null : text;
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, maxLength);
    }
}
