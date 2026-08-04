package com.example.back_end.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawalRequestCreate {
    @NotNull
    @Min(10000)
    private Long amountVnd;

    @NotBlank
    @Size(max = 30)
    private String method;

    @Size(max = 120)
    private String bankName;

    @NotBlank
    @Size(max = 120)
    private String accountName;

    @NotBlank
    @Size(max = 80)
    private String accountNumber;

    @Size(max = 500)
    private String note;
}
