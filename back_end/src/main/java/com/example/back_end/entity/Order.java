package com.example.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@AllArgsConstructor
@RequiredArgsConstructor
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_user", nullable = false, referencedColumnName = "id")
    private User idUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_course", nullable = false, referencedColumnName = "CourseID")
    private Course idCourse;

    /** Nullable so Hibernate can add column to existing rows; new rows get today via @PrePersist / OrderService. */
    @Column(name = "date_order")
    private LocalDate dateOrder;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "price_paid")
    private Double pricePaid;

    @Column(name = "refund_eligible_until")
    private LocalDate refundEligibleUntil;

    @PrePersist
    void defaultDateOrder() {
        if (dateOrder == null) {
            dateOrder = LocalDate.now();
        }
        if (status == null) {
            status = "PAID";
        }
        if (refundEligibleUntil == null) {
            refundEligibleUntil = dateOrder.plusDays(7);
        }
    }
}
