package com.example.back_end.controller;

import com.example.back_end.dto.request.LearnerCreditWithdrawRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.LearnerWalletSummaryResponse;
import com.example.back_end.dto.response.LearnerWalletTransactionResponse;
import com.example.back_end.service.LearnerWalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/learner/wallet")
@RequiredArgsConstructor
public class LearnerWalletController {
    private final LearnerWalletService learnerWalletService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<LearnerWalletSummaryResponse> summary() {
        return ApiResponse.<LearnerWalletSummaryResponse>builder()
                .code(200)
                .result(learnerWalletService.summary())
                .build();
    }

    @PostMapping("/withdrawals/demo")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<LearnerWalletTransactionResponse> withdrawDemo(
            @Valid @RequestBody LearnerCreditWithdrawRequest request
    ) {
        return ApiResponse.<LearnerWalletTransactionResponse>builder()
                .code(200)
                .result(learnerWalletService.withdrawDemo(request))
                .build();
    }
}
