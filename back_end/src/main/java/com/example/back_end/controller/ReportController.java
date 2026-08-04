package com.example.back_end.controller;

import com.example.back_end.dto.request.ReportDecisionRequest;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.ReportResponseDTO;
import com.example.back_end.service.ReportService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ReportResponseDTO> createReport(
            @RequestParam Long courseId,
            @RequestParam String subject,
            @RequestParam String detail,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestPart(required = false) MultipartFile attachment
    ) {
        return ApiResponse.<ReportResponseDTO>builder()
                .code(0)
                .message("Đã gửi khiếu nại")
                .result(reportService.createReport(courseId, subject, detail, category, priority, attachment))
                .build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Page<ReportResponseDTO>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "date"));
        return ApiResponse.<Page<ReportResponseDTO>>builder()
                .code(0)
                .message("Lấy danh sách khiếu nại thành công")
                .result(reportService.getAllReports(status, keyword, pageable))
                .build();
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ReportResponseDTO>> getMyReports(@RequestParam(required = false) Integer courseId) {
        return ApiResponse.<List<ReportResponseDTO>>builder()
                .code(0)
                .message("Lấy danh sách khiếu nại của bạn thành công")
                .result(reportService.getMyReports(courseId))
                .build();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyAuthority('SCOPE_SELLER', 'SCOPE_ADMIN')")
    public ApiResponse<Page<ReportResponseDTO>> getSellerReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "date"));
        return ApiResponse.<Page<ReportResponseDTO>>builder()
                .code(0)
                .message("Lấy danh sách khiếu nại của người bán thành công")
                .result(reportService.getSellerReports(status, keyword, pageable))
                .build();
    }

    @PatchMapping("/{id}/request-seller-action")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<ReportResponseDTO> requestSellerAction(
            @PathVariable Long id,
            @Valid @RequestBody ReportDecisionRequest request
    ) {
        return ApiResponse.<ReportResponseDTO>builder()
                .code(0)
                .message("Đã yêu cầu người bán khắc phục")
                .result(reportService.requestSellerAction(id, request))
                .build();
    }

    @PatchMapping("/{id}/seller-response")
    @PreAuthorize("hasAnyAuthority('SCOPE_SELLER', 'SCOPE_ADMIN')")
    public ApiResponse<ReportResponseDTO> sellerRespond(
            @PathVariable Long id,
            @Valid @RequestBody ReportDecisionRequest request
    ) {
        return ApiResponse.<ReportResponseDTO>builder()
                .code(0)
                .message("Đã gửi phản hồi cho khiếu nại")
                .result(reportService.sellerRespond(id, request))
                .build();
    }

    @PatchMapping("/{id}/recommend-refund")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<ReportResponseDTO> recommendRefund(
            @PathVariable Long id,
            @Valid @RequestBody ReportDecisionRequest request
    ) {
        return ApiResponse.<ReportResponseDTO>builder()
                .code(0)
                .message("Đã đề xuất hoàn tiền")
                .result(reportService.recommendRefund(id, request))
                .build();
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<ReportResponseDTO> resolveReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportDecisionRequest request
    ) {
        return ApiResponse.<ReportResponseDTO>builder()
                .code(0)
                .message("Đã phản hồi khiếu nại")
                .result(reportService.resolveReport(id, request))
                .build();
    }
}
