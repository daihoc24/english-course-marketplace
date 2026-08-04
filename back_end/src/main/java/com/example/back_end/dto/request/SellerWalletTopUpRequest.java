package com.example.back_end.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellerWalletTopUpRequest {
    @NotNull
    @Min(10_000)
    @Max(100_000_000)
    private Long amountVnd;

    @Size(max = 500)
    private String note;
}
