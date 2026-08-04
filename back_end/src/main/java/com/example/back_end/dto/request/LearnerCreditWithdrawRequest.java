package com.example.back_end.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LearnerCreditWithdrawRequest {
    @NotNull
    @Min(10000)
    private Long amountVnd;
}
