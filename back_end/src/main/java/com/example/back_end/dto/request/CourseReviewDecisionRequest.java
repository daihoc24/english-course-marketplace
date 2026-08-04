package com.example.back_end.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter; import lombok.Setter;
@Getter @Setter public class CourseReviewDecisionRequest { @NotBlank @Pattern(regexp = "APPROVED|REJECTED") private String decision; private String note; }
