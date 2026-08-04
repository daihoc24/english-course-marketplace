package com.example.back_end.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportDecisionRequest {
    @NotBlank(message = "Vui lòng nhập nội dung phản hồi")
    @Size(max = 700, message = "Phản hồi tối đa 700 ký tự")
    private String responseText;
}
