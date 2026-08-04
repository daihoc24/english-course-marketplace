package com.example.back_end.service;

import com.example.back_end.dto.response.CourseDetailResponseDTO;
import com.example.back_end.dto.response.CourseListResponseDTO;
import com.example.back_end.dto.response.CourseRatingResponseDTO;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.CourseRating;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.*;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CourseRatingRepository courseRatingRepository;


    @Autowired
    private CourseDetailRepository courseDetailRepository;

    @Autowired
    private LessonResourceService lessonResourceService;

    @Autowired
    private UserRepository userRepository;


    public List<CourseListResponseDTO> getAllCourses() {
        return courseRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .filter(course -> Boolean.TRUE.equals(course.getStatus()))
                .map(course -> {
                    // 👇 Lấy thông tin người bán
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());

                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())

                            // 👇 Thêm tên người bán vào đây
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")

                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    public boolean isCoursePurchasedByUser(Integer userId, Integer courseId) {
        return orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(userId, courseId, "PAID");
    }
    
    // Lấy ngày mua khóa học - trả về null nếu chưa mua
    public LocalDate getCoursePurchaseDate(Integer userId, Integer courseId) {
        Optional<LocalDate> purchaseDate = orderRepository.findPurchaseDateByUserIdAndCourseId(userId, courseId);
        return purchaseDate.orElse(null);
    }

    public CourseListResponseDTO getCourseById(Integer id) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course == null) {
            return null;
        }
        User seller = userRepository.findById(course.getSellerId())
                .orElse(null);
        Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
        Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
        return CourseListResponseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .price(course.getPrice())
                .sellerId(course.getSellerId())
                .categoryId(course.getCategoryId())
                .description(course.getDescription())
                .image(course.getImage())
                .rating(course.getRating())
                .status(course.getStatus())
                .sellerName(seller != null ? seller.getFullname() : "Unknown")
                .categoryName(getCategoryName(course.getCategoryId()))
                .episodeCount(episodeCount)
                .totalDuration(totalDuration)
                .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                .build();
    }

    public List<CourseDetailResponseDTO> getCourseDetailsByCourseId(Integer courseId) {
        return courseDetailRepository.findByCourse_Id(courseId).stream()
                .map(detail -> CourseDetailResponseDTO.builder()
                        .id(detail.getId())
                        .name(detail.getName())
                        .episodeNumber(detail.getEpisodeNumber())
                        .link(detail.getLink())
                        .duration(detail.getDuration())
                        .isPreview(detail.getIsPreview())
                        .resources(lessonResourceService.getResponses(detail.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    public void updateCourseRating(Integer courseId, Double newRating) {
        if (newRating < 1.0 || newRating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1.0 and 5.0");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Simple approach: directly set the new rating
        course.setRating(newRating);
        courseRepository.save(course);
    }

    private String getCategoryName(Integer categoryId) {
        // Fallback labels for the demo category ids.
        switch (categoryId) {
            case 1: return "IELTS";
            case 2: return "Business English";
            case 3: return "Kids English";
            case 4: return "Conversation";
            case 5: return "Grammar";
            case 6: return "General English";
            default: return "Unknown Category";
        }
    }

    // Search courses by keyword
    public List<CourseListResponseDTO> searchCourses(String keyword) {
        List<Course> courses = courseRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                keyword, keyword);
        
        return courses.stream()
                .filter(course -> Boolean.TRUE.equals(course.getStatus())) // Only active courses
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Advanced search with filters
    public List<CourseListResponseDTO> searchCoursesAdvanced(String keyword, Integer categoryId, 
                                                           Double minPrice, Double maxPrice, 
                                                           Double minRating, Boolean status) {
        List<Course> courses = courseRepository.findAll(
                buildCourseSpecification(keyword, categoryId, minPrice, maxPrice, minRating, status),
                Sort.by(Sort.Direction.DESC, "id"));
        
        return courses.stream()
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Advanced search with pagination and sorting using JPA Specification
    public Page<CourseListResponseDTO> searchCoursesAdvancedPaginated(
            String keyword, Integer categoryId, Double minPrice, Double maxPrice,
            Double minRating, Boolean status, int page, int size,
            String sortBy, String sortDirection) {
        
        // Build JPA Specification dynamically combining all non-null filter parameters
        Specification<Course> spec = buildCourseSpecification(keyword, categoryId, minPrice, maxPrice, minRating, Boolean.TRUE);
        
        // Map sortBy field names to entity field names and create Sort
        String entitySortField = mapSortField(sortBy);
        Sort sort = sortDirection.equalsIgnoreCase("asc") 
                ? Sort.by(entitySortField).ascending() 
                : Sort.by(entitySortField).descending();
        
        // Create Pageable with validated sort parameters
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Use courseRepository.findAll(spec, pageable) to get paginated results from DB
        Page<Course> coursePage = courseRepository.findAll(spec, pageable);
        
        // Handle out-of-bounds page: if requested page exceeds total pages, return empty content with correct totals
        if (page > 0 && page >= coursePage.getTotalPages()) {
            // Re-query to get correct total count, return empty content
            long totalElements = coursePage.getTotalElements();
            int totalPages = coursePage.getTotalPages();
            List<CourseListResponseDTO> emptyList = List.of();
            return new PageImpl<>(emptyList, pageable, totalElements);
        }
        
        // Map Course entities to CourseListResponseDTO
        List<CourseListResponseDTO> dtoList = coursePage.getContent().stream()
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtoList, pageable, coursePage.getTotalElements());
    }
    
    /**
     * Builds a JPA Specification for Course entity by dynamically combining
     * all non-null filter parameters into a single Specification.
     */
    private Specification<Course> buildCourseSpecification(
            String keyword, Integer categoryId, Double minPrice, Double maxPrice,
            Double minRating, Boolean status) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Keyword filter: match name OR description (case-insensitive)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), pattern);
                Predicate descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }
            
            // Category filter
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("categoryId"), categoryId));
            }
            
            // Min price filter
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            
            // Max price filter
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            
            // Min rating filter
            if (minRating != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("rating"), minRating));
            }
            
            // Status filter
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    private String mapSortField(String sortBy) {
        switch (sortBy) {
            case "createdDate": return "id"; // Use id as proxy for creation order
            case "price": return "price";
            case "averageRating": return "rating";
            default: return "id";
        }
    }

    // Get courses by category
    public List<CourseListResponseDTO> getCoursesByCategory(Integer categoryId) {
        List<Course> courses = courseRepository.findByCategoryIdAndStatusTrue(categoryId);
        
        return courses.stream()
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Get courses by price range
    public List<CourseListResponseDTO> getCoursesByPriceRange(Double minPrice, Double maxPrice) {
        List<Course> courses = courseRepository.findByPriceBetweenAndStatusTrue(minPrice, maxPrice);
        
        return courses.stream()
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId()).orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void submitRating(Integer courseId, Integer userId, Integer rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be 1-5");
        }
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!orderRepository.existsByIdUser_IdAndIdCourse_IdAndStatus(userId, courseId, "PAID")) {
            throw new IllegalArgumentException("Bạn cần mua khóa học trước khi đánh giá");
        }

        CourseRating courseRating = courseRatingRepository
                .findByCourseIdAndUserId(courseId, userId)
                .orElse(CourseRating.builder()
                        .courseId(courseId)
                        .userId(userId)
                        .build());

        courseRating.setRating(rating);
        courseRatingRepository.save(courseRating);

        // Update course average
        updateCourseAverageRating(courseId);
    }

    public CourseRatingResponseDTO getUserRating(Integer courseId, Integer userId) {
        Optional<CourseRating> rating = courseRatingRepository.findByCourseIdAndUserId(courseId, userId);
        return rating.map(this::convertToResponseDTO).orElse(null);
    }

    private void updateCourseAverageRating(Integer courseId) {
        Double avg = courseRatingRepository.getAverageRating(courseId);
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null) {
            course.setRating(avg != null ? avg : 0.0);
            courseRepository.save(course);
        }
    }

    private CourseRatingResponseDTO convertToResponseDTO(CourseRating rating) {
        return CourseRatingResponseDTO.builder()
                .id(rating.getId())
                .courseId(rating.getCourseId())
                .userId(rating.getUserId())
                .rating(rating.getRating())
                .createdAt(rating.getCreatedAt().toString())
                .build();
    }
    
    // Tìm kiếm khóa học theo từ khóa
    public List<CourseListResponseDTO> searchCoursesByKeyword(String keyword) {
        List<Course> courses = courseRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
        return convertToResponseDTOList(courses);
    }
    
    // Tìm kiếm khóa học theo category
    public List<CourseListResponseDTO> searchCoursesByCategory(Integer categoryId) {
        List<Course> courses = courseRepository.findByCategoryId(categoryId);
        return convertToResponseDTOList(courses);
    }
    
    // Tìm kiếm khóa học theo khoảng giá
    public List<CourseListResponseDTO> searchCoursesByPriceRange(Double minPrice, Double maxPrice) {
        List<Course> courses = courseRepository.findByPriceBetween(minPrice, maxPrice);
        return convertToResponseDTOList(courses);
    }
    
    // Tìm kiếm khóa học theo rating tối thiểu
    public List<CourseListResponseDTO> searchCoursesByMinRating(Double minRating) {
        List<Course> courses = courseRepository.findByRatingGreaterThanEqual(minRating);
        return convertToResponseDTOList(courses);
    }
    

    
    // Helper method để convert danh sách Course thành CourseListResponseDTO
    private List<CourseListResponseDTO> convertToResponseDTOList(List<Course> courses) {
        return courses.stream()
                .map(course -> {
                    User seller = userRepository.findById(course.getSellerId())
                            .orElse(null);
                    Integer episodeCount = courseDetailRepository.countByCourseId(course.getId());
                    Integer totalDuration = courseDetailRepository.sumDurationByCourseId(course.getId());
                    return CourseListResponseDTO.builder()
                            .id(course.getId())
                            .name(course.getName())
                            .price(course.getPrice())
                            .sellerId(course.getSellerId())
                            .categoryId(course.getCategoryId())
                            .description(course.getDescription())
                            .image(course.getImage())
                            .rating(course.getRating())
                            .status(course.getStatus())
                            .sellerName(seller != null ? seller.getFullname() : "Unknown")
                            .categoryName(getCategoryName(course.getCategoryId()))
                            .episodeCount(episodeCount)
                            .totalDuration(totalDuration)
                            .studentCount(orderRepository.countByIdCourse_IdAndStatus(course.getId(), "PAID"))
                            .build();
                })
                .collect(Collectors.toList());
    }
}
