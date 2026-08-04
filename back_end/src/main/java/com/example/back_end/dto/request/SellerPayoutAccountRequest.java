package com.example.back_end.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellerPayoutAccountRequest {
    @NotBlank
    @Pattern(regexp = "BANK|PAYPAL")
    private String method;

    @Size(max = 120)
    private String bankName;

    @NotBlank
    @Size(max = 120)
    private String accountName;

    @NotBlank
    @Size(max = 80)
    private String accountNumber;
}
