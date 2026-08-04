package com.example.back_end.controller;

import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.dto.response.MyCourseResponse;
import com.example.back_end.dto.response.OrderResponse;
import com.example.back_end.entity.Order;
import com.example.back_end.service.order.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final IOrderService orderService;

    @GetMapping({"/invidual", "/individual"})
    public ApiResponse<List<Order>> getPersonalOrders() {
        List<Order> orders = orderService.getStudentOrder();
        return ApiResponse.<List<Order>>builder()
                .code(200)
                .message("Success")
                .result(orders)
                .build();
    }

    @GetMapping("/my-courses")
    public ApiResponse<Page<MyCourseResponse>> getMyCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 24);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "dateOrder"));
        Page<MyCourseResponse> result = orderService.getMyCourses(status, keyword, pageable);
        return ApiResponse.<Page<MyCourseResponse>>builder()
                .code(200)
                .message("Success")
                .result(result)
                .build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<Page<OrderResponse>> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size,
                                                         @RequestParam(required = false) String status,
                                                         @RequestParam(required = false) String keyword) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "dateOrder"));
        return ApiResponse.<Page<OrderResponse>>builder()
                .code(200)
                .message("Success")
                .result(orderService.getAll(status, keyword, pageable))
                .build();
    }
}
