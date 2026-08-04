package com.example.back_end.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DirectVideoUploadSignature {
    String cloudName;
    String apiKey;
    String publicId;
    String folder;
    String resourceType;
    Boolean useFilename;
    Boolean uniqueFilename;
    long timestamp;
    String signature;
}
