package com.example.back_end.service;

import com.cloudinary.Cloudinary;
import com.example.back_end.dto.response.DirectVideoUploadSignature;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonVideoService {
    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    @Value("${cloudinary.api-key}")
    private String apiKey;
    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    public DirectVideoUploadSignature createDirectUploadSignature(Integer sellerId) {
        requireCloudinaryConfigured();
        long timestamp = System.currentTimeMillis() / 1000;
        String publicId = "course-marketplace/lessons/" + sellerId + "/" + UUID.randomUUID();
        String signature = cloudinary.apiSignRequest(Map.of("public_id", publicId, "timestamp", timestamp), apiSecret);
        return DirectVideoUploadSignature.builder()
                .cloudName(cloudName)
                .apiKey(apiKey)
                .publicId(publicId)
                .resourceType("video")
                .timestamp(timestamp)
                .signature(signature)
                .build();
    }

    public DirectVideoUploadSignature createCourseImageUploadSignature(Integer sellerId) {
        requireCloudinaryConfigured();
        long timestamp = System.currentTimeMillis() / 1000;
        String publicId = "course-marketplace/covers/" + sellerId + "/" + UUID.randomUUID();
        String signature = cloudinary.apiSignRequest(Map.of("public_id", publicId, "timestamp", timestamp), apiSecret);
        return DirectVideoUploadSignature.builder()
                .cloudName(cloudName)
                .apiKey(apiKey)
                .publicId(publicId)
                .resourceType("image")
                .timestamp(timestamp)
                .signature(signature)
                .build();
    }

    public DirectVideoUploadSignature createRawUploadSignature(Integer ownerId, String folderName) {
        requireCloudinaryConfigured();
        long timestamp = System.currentTimeMillis() / 1000;
        String safeFolderName = folderName == null || folderName.isBlank() ? "files" : folderName.trim();
        String folder = "course-marketplace/" + safeFolderName + "/" + ownerId;
        Map<String, Object> params = Map.of(
                "folder", folder,
                "timestamp", timestamp,
                "unique_filename", "true",
                "use_filename", "true"
        );
        String signature = cloudinary.apiSignRequest(params, apiSecret);
        return DirectVideoUploadSignature.builder()
                .cloudName(cloudName)
                .apiKey(apiKey)
                .folder(folder)
                .resourceType("raw")
                .timestamp(timestamp)
                .signature(signature)
                .useFilename(true)
                .uniqueFilename(true)
                .build();
    }

    public void delete(String publicId) throws Exception {
        if (publicId == null || publicId.isBlank()) return;
        cloudinary.uploader().destroy(publicId, Map.of("resource_type", "video", "invalidate", true));
    }

    private void requireCloudinaryConfigured() {
        if (cloudName == null || cloudName.isBlank() || apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
        }
    }
}
