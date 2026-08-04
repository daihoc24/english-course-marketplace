package com.example.back_end.controller;

import com.example.back_end.dto.request.SellerPayoutAccountRequest;
import com.example.back_end.dto.request.SellerWalletTopUpRequest;
import com.example.back_end.dto.request.WithdrawalDecisionRequest;
import com.example.back_end.dto.request.WithdrawalRequestCreate;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.AutoPayoutRunResponse;
import com.example.back_end.dto.response.SellerPayoutAccountResponse;
import com.example.back_end.dto.response.SellerWalletTransactionResponse;
import com.example.back_end.dto.response.SellerWalletSummaryResponse;
import com.example.back_end.dto.response.WithdrawalRequestResponse;
import com.example.back_end.service.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class WithdrawalController {
    private final WithdrawalService withdrawalService;

    @GetMapping("/seller/{sellerId}/withdrawal-requests")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<Page<WithdrawalRequestResponse>> sellerRequests(@PathVariable Integer sellerId,
                                                                       @RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size,
                                                                       @RequestParam(required = false) String keyword,
                                                                       @RequestParam(required = false) String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "requestedAt"));
        return ApiResponse.<Page<WithdrawalRequestResponse>>builder()
                .code(200)
                .result(withdrawalService.sellerRequests(sellerId, status, keyword, pageable))
                .build();
    }

    @GetMapping("/seller/{sellerId}/wallet-transactions")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<Page<SellerWalletTransactionResponse>> walletTransactions(@PathVariable Integer sellerId,
                                                                                @RequestParam(defaultValue = "0") int page,
                                                                                @RequestParam(defaultValue = "4") int size,
                                                                                @RequestParam(required = false) String keyword,
                                                                                @RequestParam(required = false) String status,
                                                                                @RequestParam(required = false) String type) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponse.<Page<SellerWalletTransactionResponse>>builder()
                .code(200)
                .result(withdrawalService.walletTransactions(sellerId, status, type, keyword, pageable))
                .build();
    }

    @GetMapping("/seller/{sellerId}/wallet-summary")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<SellerWalletSummaryResponse> walletSummary(@PathVariable Integer sellerId) {
        return ApiResponse.<SellerWalletSummaryResponse>builder()
                .code(200)
                .result(withdrawalService.walletSummary(sellerId))
                .build();
    }

    @PostMapping("/seller/{sellerId}/wallet-topups/demo")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<SellerWalletTransactionResponse> topUpWalletDemo(@PathVariable Integer sellerId,
                                                                        @Valid @RequestBody SellerWalletTopUpRequest request) {
        return ApiResponse.<SellerWalletTransactionResponse>builder()
                .code(200)
                .message("Đã nạp tiền vào ví người bán demo")
                .result(withdrawalService.topUpWalletDemo(sellerId, request))
                .build();
    }

    @GetMapping("/seller/{sellerId}/payout-account")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<SellerPayoutAccountResponse> payoutAccount(@PathVariable Integer sellerId) {
        return ApiResponse.<SellerPayoutAccountResponse>builder()
                .code(200)
                .result(withdrawalService.payoutAccount(sellerId))
                .build();
    }

    @PostMapping("/seller/{sellerId}/payout-account/demo")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<SellerPayoutAccountResponse> createDemoPayoutAccount(@PathVariable Integer sellerId) {
        return ApiResponse.<SellerPayoutAccountResponse>builder()
                .code(200)
                .message("Đã tạo tài khoản nhận tiền demo")
                .result(withdrawalService.createDemoPayoutAccount(sellerId))
                .build();
    }

    @PatchMapping("/seller/{sellerId}/payout-account")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<SellerPayoutAccountResponse> savePayoutAccount(@PathVariable Integer sellerId,
                                                                      @Valid @RequestBody SellerPayoutAccountRequest request) {
        return ApiResponse.<SellerPayoutAccountResponse>builder()
                .code(200)
                .message("Đã cập nhật tài khoản nhận tiền")
                .result(withdrawalService.savePayoutAccount(sellerId, request))
                .build();
    }

    @PostMapping("/seller/{sellerId}/withdrawal-requests")
    @PreAuthorize("(hasAuthority('SCOPE_SELLER') or hasAuthority('SCOPE_ADMIN')) and @userAccessAuthorization.canAccess(#sellerId, authentication)")
    public ApiResponse<WithdrawalRequestResponse> create(@PathVariable Integer sellerId,
                                                         @Valid @RequestBody WithdrawalRequestCreate request) {
        return ApiResponse.<WithdrawalRequestResponse>builder()
                .code(200)
                .message("Đã gửi yêu cầu rút tiền")
                .result(withdrawalService.create(sellerId, request))
                .build();
    }

    @GetMapping("/admin/withdrawal-requests")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Page<WithdrawalRequestResponse>> all(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size,
                                                            @RequestParam(required = false) String keyword,
                                                            @RequestParam(required = false) String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "requestedAt"));
        return ApiResponse.<Page<WithdrawalRequestResponse>>builder()
                .code(200)
                .result(withdrawalService.all(status, keyword, pageable))
                .build();
    }

    @PostMapping("/admin/withdrawal-requests/auto-run")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<AutoPayoutRunResponse> runAutoPayout() {
        return ApiResponse.<AutoPayoutRunResponse>builder()
                .code(200)
                .message("Đã chạy chi trả tự động demo")
                .result(withdrawalService.runAutoPayout())
                .build();
    }

    @PatchMapping("/admin/withdrawal-requests/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<WithdrawalRequestResponse> decide(@PathVariable Long id,
                                                         @Valid @RequestBody WithdrawalDecisionRequest request) {
        return ApiResponse.<WithdrawalRequestResponse>builder()
                .code(200)
                .message("Đã cập nhật yêu cầu rút tiền")
                .result(withdrawalService.decide(id, request))
                .build();
    }
}
