package com.example.back_end.controller;

import com.example.back_end.dto.request.RefundDecisionRequest;
import com.example.back_end.dto.request.RefundRequestCreate;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.RefundRequestResponse;
import com.example.back_end.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RefundController {
    private final RefundService refundService;

    @PostMapping(value = "/orders/{orderId}/refund-requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<RefundRequestResponse> create(@PathVariable Integer orderId,
                                                     @RequestPart("reason") String reason,
                                                     @RequestPart(value = "attachment", required = false) MultipartFile attachment) {
        RefundRequestCreate request = new RefundRequestCreate();
        request.setReason(reason);
        return ApiResponse.<RefundRequestResponse>builder().code(200).result(refundService.create(orderId, request, attachment)).build();
    }

    @PostMapping(value = "/orders/{orderId}/refund-requests", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<RefundRequestResponse> createJson(@PathVariable Integer orderId,
                                                         @Valid @RequestBody RefundRequestCreate request) {
        return ApiResponse.<RefundRequestResponse>builder().code(200).result(refundService.create(orderId, request, null)).build();
    }

    @GetMapping("/orders/refund-requests/mine")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<RefundRequestResponse>> mine() { return ApiResponse.<List<RefundRequestResponse>>builder().code(200).result(refundService.mine()).build(); }

    @GetMapping("/seller/refund-requests")
    @PreAuthorize("hasAnyAuthority('SCOPE_SELLER', 'SCOPE_ADMIN')")
    public ApiResponse<Page<RefundRequestResponse>> sellerRequests(@RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size,
                                                                   @RequestParam(required = false) String keyword,
                                                                   @RequestParam(required = false) String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "requestedAt"));
        return ApiResponse.<Page<RefundRequestResponse>>builder()
                .code(200)
                .result(refundService.sellerRequests(status, keyword, pageable))
                .build();
    }

    @GetMapping("/admin/refund-requests")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Page<RefundRequestResponse>> all(@RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(required = false) String keyword,
                                                        @RequestParam(required = false) String status) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "requestedAt"));
        return ApiResponse.<Page<RefundRequestResponse>>builder()
                .code(200)
                .result(refundService.all(status, keyword, pageable))
                .build();
    }

    @PatchMapping("/admin/refund-requests/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<RefundRequestResponse> decide(@PathVariable Long id, @RequestBody RefundDecisionRequest request) {
        return ApiResponse.<RefundRequestResponse>builder().code(200).result(refundService.decide(id, request)).build();
    }
}
