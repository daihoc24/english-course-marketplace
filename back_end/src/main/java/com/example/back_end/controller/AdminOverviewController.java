package com.example.back_end.controller;

import com.example.back_end.dto.response.AdminOverviewResponse;
import com.example.back_end.dto.response.ApiResponse;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class AdminOverviewController {
    private final UserRepository users;
    private final CourseRepository courses;
    private final OrderRepository orders;
    private final CourseDetailRepository courseDetails;

    @GetMapping("/admin/overview")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ApiResponse<AdminOverviewResponse> overview() {
        var paidOrders = orders.findAll().stream()
                .filter(order -> "PAID".equals(order.getStatus()))
                .toList();
        double paidRevenue = paidOrders.stream()
                .map(order -> order.getPricePaid() == null ? 0D : order.getPricePaid())
                .mapToDouble(Double::doubleValue)
                .sum();
        var monthlySales = paidOrders.stream().filter(order -> order.getDateOrder() != null)
                .collect(Collectors.groupingBy(order -> YearMonth.from(order.getDateOrder())))
                .entrySet().stream().sorted(Map.Entry.comparingByKey())
                .map(entry -> new AdminOverviewResponse.MonthlyMetric(entry.getKey().format(DateTimeFormatter.ofPattern("MM/yyyy")), entry.getValue().size(), entry.getValue().stream().map(order -> order.getPricePaid() == null ? 0D : order.getPricePaid()).mapToDouble(Double::doubleValue).sum())).toList();
        var topCourses = paidOrders.stream().collect(Collectors.groupingBy(order -> order.getIdCourse().getName(), Collectors.counting())).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())).limit(5)
                .map(entry -> new AdminOverviewResponse.CourseMetric(entry.getKey(), entry.getValue())).toList();
        var recentOrders = paidOrders.stream().sorted(Comparator.comparing(order -> order.getDateOrder(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10).map(order -> {
                    Integer courseId = order.getIdCourse().getId();
                    Integer lessonCount = courseDetails.countByCourseId(courseId);
                    Integer totalMinutes = courseDetails.sumDurationByCourseId(courseId);
                    int totalHours = (int) Math.ceil((totalMinutes == null ? 0 : totalMinutes) / 60.0);
                    return new AdminOverviewResponse.RecentOrder(order.getId(), order.getIdUser().getFullname(), order.getIdCourse().getName(), order.getIdCourse().getLevel(), lessonCount, totalHours, order.getPricePaid() == null ? 0D : order.getPricePaid(), order.getStatus());
                }).toList();
        return ApiResponse.<AdminOverviewResponse>builder()
                .code(200)
                .result(new AdminOverviewResponse(users.count(), courses.countByStatusTrue(), paidRevenue, monthlySales, topCourses, recentOrders))
                .build();
    }
}
