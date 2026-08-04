package com.example.back_end.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundDecisionRequest {
    @NotBlank
    @Pattern(regexp = "APPROVED|REJECTED")
    private String decision;

    @Size(max = 500)
    private String adminNote;
}
