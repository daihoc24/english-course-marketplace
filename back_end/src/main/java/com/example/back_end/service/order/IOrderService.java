package com.example.back_end.service.order;

import com.example.back_end.dto.response.MyCourseResponse;
import com.example.back_end.dto.response.OrderResponse;
import com.example.back_end.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IOrderService {
    /** Called only after a payment transaction has been verified by the selected provider. */
    Order grantCourseAccessAfterVerifiedPayment(Integer userId, Integer courseId);

    List<Order> getStudentOrder();

    Page<MyCourseResponse> getMyCourses(String status, String keyword, Pageable pageable);

    List<OrderResponse> getAll();

    Page<OrderResponse> getAll(String status, String keyword, Pageable pageable);
}
