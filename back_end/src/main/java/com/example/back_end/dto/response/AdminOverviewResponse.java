package com.example.back_end.dto.response;

import java.util.List;

public record AdminOverviewResponse(long totalUsers, long publishedCourses, double paidRevenue,
                                    List<MonthlyMetric> monthlySales, List<CourseMetric> topCourses,
                                    List<RecentOrder> recentOrders) {
    public record MonthlyMetric(String name, long sales, double revenue) {}
    public record CourseMetric(String name, long value) {}
    public record RecentOrder(int id, String learnerName, String courseName, String level,
                              Integer lessons, Integer totalHours, double pricePaid, String status) {}
}
