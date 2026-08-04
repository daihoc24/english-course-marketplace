package com.example.back_end.repositories;

import com.example.back_end.entity.User;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Integer> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    Optional<User> findUserByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email);

    @Override
    <S extends User> List<S> findAll(Example<S> example);
    Optional<User> findUserById(int id);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.active = true ORDER BY u.fullname")
    List<User> findActiveUsersByRoleName(@Param("roleName") String roleName);

    @Query(
            value = """
                    SELECT DISTINCT u FROM User u
                    LEFT JOIN u.roles r
                    WHERE (:keyword IS NULL
                           OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
                      AND (:role IS NULL OR r.name = :role)
                      AND (:active IS NULL OR u.active = :active)
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT u) FROM User u
                    LEFT JOIN u.roles r
                    WHERE (:keyword IS NULL
                           OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                           OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
                      AND (:role IS NULL OR r.name = :role)
                      AND (:active IS NULL OR u.active = :active)
                    """
    )
    Page<User> searchAdminUsers(@Param("keyword") String keyword,
                                @Param("role") String role,
                                @Param("active") Boolean active,
                                Pageable pageable);
}
