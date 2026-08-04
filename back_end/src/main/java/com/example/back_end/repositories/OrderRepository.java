package com.example.back_end.repositories;

import com.example.back_end.entity.Order;
import com.example.back_end.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,Integer> {
    List<Order> getOrdersByIdUser(User user);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.idCourse JOIN FETCH o.idUser WHERE o.idUser.id = :userId ORDER BY o.dateOrder DESC")
    List<Order> findAllByUserIdWithCourseAndUser(@Param("userId") Integer userId);

    @Query(
            value = """
                    SELECT o FROM Order o
                    JOIN FETCH o.idCourse c
                    JOIN FETCH o.idUser u
                    WHERE u.id = :userId
                      AND (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(o) FROM Order o
                    JOIN o.idCourse c
                    JOIN o.idUser u
                    WHERE u.id = :userId
                      AND (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<Order> findMyCoursesPage(@Param("userId") Integer userId,
                                  @Param("status") String status,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);

    List<Order> findAll();

    @Query(
            value = """
                    SELECT o FROM Order o
                    JOIN FETCH o.idCourse c
                    JOIN FETCH o.idUser u
                    WHERE (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(o.id) LIKE CONCAT('%', :keyword, '%'))
                    """,
            countQuery = """
                    SELECT COUNT(o) FROM Order o
                    JOIN o.idCourse c
                    JOIN o.idUser u
                    WHERE (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(o.id) LIKE CONCAT('%', :keyword, '%'))
                    """
    )
    Page<Order> searchAdminOrders(@Param("status") String status,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);
    
    @Query("""
            SELECT o FROM Order o
            JOIN FETCH o.idCourse c
            JOIN FETCH o.idUser u
            WHERE c.sellerId = :sellerId
            """)
    List<Order> findBySellerIdThroughCourses(@Param("sellerId") Integer sellerId);

    @Query(
            value = """
                    SELECT o FROM Order o
                    JOIN FETCH o.idCourse c
                    JOIN FETCH o.idUser u
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(o.id) LIKE CONCAT('%', :keyword, '%'))
                    """,
            countQuery = """
                    SELECT COUNT(o) FROM Order o
                    JOIN o.idCourse c
                    JOIN o.idUser u
                    WHERE c.sellerId = :sellerId
                      AND (:status IS NULL OR o.status = :status)
                      AND (:keyword IS NULL
                           OR LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.fullname, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR STR(o.id) LIKE CONCAT('%', :keyword, '%'))
                    """
    )
    Page<Order> searchSellerOrders(@Param("sellerId") Integer sellerId,
                                   @Param("status") String status,
                                   @Param("keyword") String keyword,
                                   Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(o.pricePaid, c.price, 0.0)), 0.0)
            FROM Order o
            JOIN o.idCourse c
            WHERE c.sellerId = :sellerId
              AND UPPER(o.status) = 'PAID'
            """)
    Double sumPaidRevenueBySellerId(@Param("sellerId") Integer sellerId);

    @Query("""
            SELECT DISTINCT c.sellerId FROM Order o
            JOIN o.idCourse c
            WHERE o.status = 'PAID' AND c.sellerId IS NOT NULL
            """)
    List<Integer> findDistinctSellerIdsWithPaidOrders();

    boolean existsByIdUser_IdAndIdCourse_Id(Integer userId, Integer courseId);

    boolean existsByIdUser_IdAndIdCourse_IdAndStatus(Integer userId, Integer courseId, String status);
    long countByIdCourse_IdAndStatus(Integer courseId, String status);

    Optional<Order> findByIdUser_IdAndIdCourse_Id(Integer userId, Integer courseId);
    
    // Lấy ngày mua khóa học theo userId và courseId
    @Query("SELECT o.dateOrder FROM Order o WHERE o.idUser.id = :userId AND o.idCourse.id = :courseId")
    Optional<LocalDate> findPurchaseDateByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    // Lấy danh sách course IDs đã mua bởi user
    @Query("SELECT o.idCourse.id FROM Order o WHERE o.idUser.id = :userId AND o.status = 'PAID'")
    List<Integer> findCourseIdsByUserId(@Param("userId") Integer userId);

    @Query("SELECT DISTINCT o.idUser FROM Order o WHERE o.idCourse.id = :courseId AND o.status = 'PAID'")
    List<User> findPaidLearnersByCourseId(@Param("courseId") Integer courseId);
}
