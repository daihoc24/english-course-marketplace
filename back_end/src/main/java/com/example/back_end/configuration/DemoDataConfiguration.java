package com.example.back_end.configuration;

import com.example.back_end.constant.PredefinedRole;
import com.example.back_end.entity.Category;
import com.example.back_end.entity.Course;
import com.example.back_end.entity.CourseDetail;
import com.example.back_end.entity.CourseReviewRequest;
import com.example.back_end.entity.LessonProgress;
import com.example.back_end.entity.Notification;
import com.example.back_end.entity.Order;
import com.example.back_end.entity.PaymentTransaction;
import com.example.back_end.entity.RefundRequest;
import com.example.back_end.entity.Report;
import com.example.back_end.entity.Role;
import com.example.back_end.entity.SellerPayoutAccount;
import com.example.back_end.entity.User;
import com.example.back_end.repositories.CategoryRepository;
import com.example.back_end.repositories.CourseDetailRepository;
import com.example.back_end.repositories.CourseRepository;
import com.example.back_end.repositories.CourseReviewRequestRepository;
import com.example.back_end.repositories.LessonProgressRepository;
import com.example.back_end.repositories.NotificationRepository;
import com.example.back_end.repositories.OrderRepository;
import com.example.back_end.repositories.PaymentTransactionRepository;
import com.example.back_end.repositories.RefundRequestRepository;
import com.example.back_end.repositories.ReportRepository;
import com.example.back_end.repositories.RoleRepository;
import com.example.back_end.repositories.SellerPayoutAccountRepository;
import com.example.back_end.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
@Profile("demo")
@RequiredArgsConstructor
@Slf4j
public class DemoDataConfiguration {
    private static final String DEMO_VIDEO_ONE = "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto/elephants.mp4";
    private static final String DEMO_VIDEO_TWO = "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto/snow_horses.mp4";
    private static final String DEMO_VIDEO_THREE = "https://res.cloudinary.com/demo/video/upload/f_mp4,q_auto/sea_turtle.mp4";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final CourseDetailRepository courseDetailRepository;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final ReportRepository reportRepository;
    private final CourseReviewRequestRepository courseReviewRequestRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final NotificationRepository notificationRepository;
    private final SellerPayoutAccountRepository sellerPayoutAccountRepository;

    @Bean
    @org.springframework.core.annotation.Order(2)
    ApplicationRunner demoAccounts(
            @Value("${DEMO_LEARNER_PASSWORD}") String learnerPassword,
            @Value("${DEMO_SELLER_PASSWORD}") String sellerPassword,
            @Value("${DEMO_ADMIN_PASSWORD}") String adminPassword) {
        return args -> {
            User learner = createIfAbsent("demo.learner", "demo.learner@example.test", "Demo Learner", learnerPassword, PredefinedRole.USER_ROLE);
            User seller = createIfAbsent("demo.seller", "demo.seller@example.test", "Demo Seller", sellerPassword, PredefinedRole.SELLER_ROLE);
            User admin = createIfAbsent("demo.admin", "demo.admin@example.test", "Demo Administrator", adminPassword, PredefinedRole.ADMIN_ROLE);
            seedPayoutAccount(seller);

            Map<String, Category> categories = seedCategories();
            List<Course> publishedCourses = seedPublishedCourses(seller, categories);
            Course pendingReviewCourse = seedPendingReviewCourse(seller, categories.get("Conversation"));

            Order ieltsOrder = seedPaidOrder(learner, publishedCourses.get(0), 2);
            Order businessOrder = seedPaidOrder(learner, publishedCourses.get(1), 5);
            seedLearningProgress(learner, publishedCourses.get(0));
            seedPaymentTransaction(ieltsOrder);
            seedPaymentTransaction(businessOrder);
            seedReport(learner, seller, publishedCourses.get(1));
            seedRefundRequest(learner, ieltsOrder);
            seedCourseReviewRequest(seller, pendingReviewCourse);
            seedNotifications(learner, seller, admin, publishedCourses.get(0), pendingReviewCourse);

            log.info("Portfolio demo product data is ready");
        };
    }

    private User createIfAbsent(String username, String email, String fullName, String password, String roleName) {
        Role role = roleRepository.findById(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).description(roleName + " role").build()));
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(username))
                .orElseGet(() -> User.builder().username(username).build());

        user.setEmail(email);
        user.setFullname(fullName);
        user.setPhone("0000000000");
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(role));
        if (PredefinedRole.SELLER_ROLE.equals(roleName)) {
            user.setAvatar("https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80");
            user.setCertificate("IELTS 8.0, TESOL, 5+ năm đào tạo tiếng Anh giao tiếp và luyện thi");
            user.setIntroduce("Giảng viên demo chuyên xây dựng lộ trình học thực tế, có bài xem thử và phản hồi rõ ràng cho học viên.");
            user.setGender("Other");
        }
        User saved = userRepository.save(user);
        log.info("Demo account '{}' is ready", email);
        return saved;
    }

    private Map<String, Category> seedCategories() {
        Map<String, String> fixtures = new LinkedHashMap<>();
        fixtures.put("IELTS", "Luyện thi IELTS theo kỹ năng và band mục tiêu");
        fixtures.put("Business English", "Tiếng Anh thương mại cho họp, email và thuyết trình");
        fixtures.put("Kids English", "Tiếng Anh thiếu nhi với nội dung nhẹ nhàng, dễ tiếp cận");
        fixtures.put("Conversation", "Giao tiếp tiếng Anh đời sống và công việc");
        fixtures.put("Grammar", "Ngữ pháp tiếng Anh từ nền tảng đến nâng cao");
        fixtures.put("General English", "Lộ trình tiếng Anh tổng quát cho người học bận rộn");

        Map<String, Category> categories = new LinkedHashMap<>();
        fixtures.forEach((name, description) -> categories.put(name, category(name, description)));
        return categories;
    }

    private Category category(String name, String description) {
        Category category = categoryRepository.findByName(name).orElseGet(Category::new);
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    private List<Course> seedPublishedCourses(User seller, Map<String, Category> categories) {
        return List.of(
                course(seller, categories.get("IELTS"), "Demo IELTS Speaking Sprint",
                        "Lộ trình luyện IELTS Speaking trong 14 ngày với câu trả lời mẫu, rubric và bài xem thử.",
                        399000D, 4.8, true, "Intermediate", "18+ year old",
                        "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
                        List.of(
                                lesson(1, "Xem thử: cách trả lời Part 1", 18, true, DEMO_VIDEO_ONE),
                                lesson(2, "Part 2 cue card theo cấu trúc STAR", 24, false, DEMO_VIDEO_TWO),
                                lesson(3, "Part 3 mở rộng ý và phản biện", 27, false, DEMO_VIDEO_THREE)
                        )),
                course(seller, categories.get("Business English"), "Demo Business English Meetings",
                        "Học cách mở cuộc họp, trình bày ý kiến, phản hồi lịch sự và chốt action item bằng tiếng Anh.",
                        329000D, 4.7, true, "Upper Intermediate", "18+ year old",
                        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
                        List.of(
                                lesson(1, "Xem thử: meeting phrases cần nhớ", 16, true, DEMO_VIDEO_TWO),
                                lesson(2, "Cách đặt câu hỏi và xác nhận yêu cầu", 20, false, DEMO_VIDEO_THREE),
                                lesson(3, "Role-play: xử lý bất đồng trong họp", 22, false, DEMO_VIDEO_ONE)
                        )),
                course(seller, categories.get("Grammar"), "Demo Grammar Foundations",
                        "Củng cố thì, mệnh đề và cấu trúc câu với ví dụ dễ hiểu, phù hợp người mất gốc.",
                        249000D, 4.6, true, "Beginner", "13-18 year old",
                        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
                        List.of(
                                lesson(1, "Xem thử: hiện tại đơn và hiện tại tiếp diễn", 14, true, DEMO_VIDEO_THREE),
                                lesson(2, "Quá khứ đơn qua tình huống đời sống", 18, false, DEMO_VIDEO_ONE)
                        )),
                course(seller, categories.get("Conversation"), "Demo Conversation Confidence",
                        "Tăng phản xạ nói qua các chủ đề hằng ngày: giới thiệu bản thân, du lịch, công việc và sở thích.",
                        289000D, 4.9, true, "Intermediate", "18+ year old",
                        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
                        List.of(
                                lesson(1, "Xem thử: small talk tự nhiên", 15, true, DEMO_VIDEO_ONE),
                                lesson(2, "Nói về công việc và kế hoạch", 21, false, DEMO_VIDEO_TWO)
                        ))
        );
    }

    private Course seedPendingReviewCourse(User seller, Category category) {
        return course(seller, category, "Demo Pronunciation Masterclass",
                "Khóa học đang chờ admin duyệt: luyện phát âm, trọng âm và ngữ điệu qua bài tập ngắn.",
                359000D, 0D, false, "Advanced", "18+ year old",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
                List.of(
                        lesson(1, "Xem thử: âm cuối thường bị bỏ qua", 12, true, DEMO_VIDEO_TWO),
                        lesson(2, "Word stress trong câu dài", 19, false, DEMO_VIDEO_THREE)
                ));
    }

    private Course course(User seller, Category category, String name, String description, Double price,
                          Double rating, Boolean status, String level, String age, String image,
                          List<LessonFixture> lessonFixtures) {
        Course course = courseRepository.findByName(name).orElseGet(Course::new);
        course.setName(name);
        course.setDescription(description);
        course.setPrice(price);
        course.setRating(rating);
        course.setStatus(status);
        course.setSellerId(seller.getId());
        course.setCategoryId(category.getId());
        course.setLevel(level);
        course.setAge(age);
        course.setImage(image);
        course.setLessons(lessonFixtures.size());
        course.setTotalHour((int) Math.ceil(lessonFixtures.stream().mapToInt(LessonFixture::duration).sum() / 60.0));
        Course saved = courseRepository.save(course);
        lessonFixtures.forEach(fixture -> upsertLesson(saved, fixture));
        return saved;
    }

    private LessonFixture lesson(Integer episodeNumber, String title, Integer duration, Boolean preview, String videoUrl) {
        return new LessonFixture(episodeNumber, title, duration, preview, videoUrl);
    }

    private void upsertLesson(Course course, LessonFixture fixture) {
        CourseDetail detail = courseDetailRepository
                .findByCourse_IdAndEpisodeNumber(course.getId(), fixture.episodeNumber())
                .orElseGet(CourseDetail::new);
        detail.setCourse(course);
        detail.setCourseId(course.getId());
        detail.setEpisodeNumber(fixture.episodeNumber());
        detail.setName(fixture.title());
        detail.setDuration(fixture.duration());
        detail.setIsPreview(fixture.preview());
        detail.setLink(fixture.videoUrl());
        detail.setVideoPublicId("demo/course-" + course.getId() + "/lesson-" + fixture.episodeNumber());
        courseDetailRepository.save(detail);
    }

    private Order seedPaidOrder(User learner, Course course, int daysAgo) {
        return orderRepository.findByIdUser_IdAndIdCourse_Id(learner.getId(), course.getId())
                .orElseGet(() -> {
                    Order order = new Order();
                    order.setIdUser(learner);
                    order.setIdCourse(course);
                    order.setStatus("PAID");
                    order.setDateOrder(LocalDate.now().minusDays(daysAgo));
                    order.setPricePaid(course.getPrice());
                    order.setRefundEligibleUntil(LocalDate.now().plusDays(Math.max(1, 7 - daysAgo)));
                    return orderRepository.save(order);
                });
    }

    private void seedPaymentTransaction(Order order) {
        String transactionRef = "DEMO-" + order.getIdUser().getId() + "-" + order.getIdCourse().getId();
        paymentTransactionRepository.findByProviderAndTransactionRef("DEMO", transactionRef)
                .orElseGet(() -> {
                    PaymentTransaction transaction = new PaymentTransaction();
                    transaction.setProvider("DEMO");
                    transaction.setTransactionRef(transactionRef);
                    transaction.setUser(order.getIdUser());
                    transaction.setCourse(order.getIdCourse());
                    transaction.setOrder(order);
                    transaction.setAmountVnd(Math.round(order.getPricePaid() == null ? order.getIdCourse().getPrice() : order.getPricePaid()));
                    transaction.setStatus("COMPLETED");
                    transaction.setGatewayTransactionId("demo-capture-" + order.getId());
                    transaction.setGatewayTransactionDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
                    transaction.setCreatedAt(LocalDateTime.now().minusHours(2));
                    transaction.setCompletedAt(LocalDateTime.now().minusHours(1));
                    return paymentTransactionRepository.save(transaction);
                });
    }

    private void seedLearningProgress(User learner, Course course) {
        List<CourseDetail> lessons = courseDetailRepository.findByCourse_Id(course.getId());
        if (lessons.isEmpty()) return;
        CourseDetail firstLesson = lessons.get(0);
        lessonProgressRepository.findByUser_IdAndLesson_Id(learner.getId(), firstLesson.getId())
                .orElseGet(() -> {
                    LessonProgress progress = new LessonProgress();
                    progress.setUser(learner);
                    progress.setCourse(course);
                    progress.setLesson(firstLesson);
                    progress.setCompleted(true);
                    progress.setCompletedAt(LocalDateTime.now().minusDays(1));
                    return lessonProgressRepository.save(progress);
                });
    }

    private void seedReport(User learner, User seller, Course course) {
        if (reportRepository.existsByUser_IdAndCourse_IdAndSubject(learner.getId(), course.getId(), "Demo: cần bổ sung phụ đề")) {
            return;
        }
        Report report = new Report();
        report.setUser(learner);
        report.setCourse(course);
        report.setSubject("Demo: cần bổ sung phụ đề");
        report.setDetail("Một bài học trong khóa demo đang thiếu phụ đề. Người học muốn admin yêu cầu giảng viên kiểm tra lại.");
        report.setCategory("CONTENT_QUALITY");
        report.setPriority("HIGH");
        report.setStatus("SELLER_ACTION_REQUIRED");
        report.setDate(LocalDateTime.now().minusDays(1));
        report.setSellerActionRequest("Vui lòng kiểm tra video bài 2 và bổ sung ghi chú học tập hoặc phụ đề tóm tắt.");
        report.setSellerActionRequestedAt(LocalDateTime.now().minusHours(18));
        report.setSellerActionRequestedBy(seller);
        reportRepository.save(report);
    }

    private void seedRefundRequest(User learner, Order order) {
        if (refundRequestRepository.existsByOrder_Id(order.getId())) {
            return;
        }
        RefundRequest refund = new RefundRequest();
        refund.setOrder(order);
        refund.setRequester(learner);
        refund.setReason("Demo: học viên muốn kiểm tra quy trình hoàn tiền trong vòng 7 ngày.");
        refund.setStatus("PENDING");
        refund.setRequestedAt(LocalDateTime.now().minusHours(6));
        refund.setGatewayProvider("DEMO");
        refundRequestRepository.save(refund);
    }

    private void seedCourseReviewRequest(User seller, Course course) {
        if (courseReviewRequestRepository.existsByCourse_IdAndStatus(course.getId(), "PENDING")) {
            return;
        }
        CourseReviewRequest request = new CourseReviewRequest();
        request.setCourse(course);
        request.setSeller(seller);
        request.setStatus("PENDING");
        request.setSubmittedAt(LocalDateTime.now().minusHours(3));
        courseReviewRequestRepository.save(request);
    }

    private void seedNotifications(User learner, User seller, User admin, Course purchasedCourse, Course pendingCourse) {
        notification(learner, seller, "COURSE_PURCHASED", "Khóa học demo đã sẵn sàng",
                "Bạn có thể tiếp tục học \"" + purchasedCourse.getName() + "\" và theo dõi tiến độ trong trang khóa học của tôi.",
                "/course-video/" + purchasedCourse.getId());
        notification(seller, admin, "REPORT_SELLER_ACTION_REQUIRED", "Có yêu cầu xử lý khiếu nại demo",
                "Admin đã yêu cầu kiểm tra nội dung một khóa học demo.",
                "/seller/reports");
        notification(admin, seller, "COURSE_REVIEW_SUBMITTED", "Có khóa học demo chờ duyệt",
                "Giảng viên demo đã gửi \"" + pendingCourse.getName() + "\" để admin kiểm duyệt.",
                "/admin/course-approval");
    }

    private void seedPayoutAccount(User seller) {
        SellerPayoutAccount account = sellerPayoutAccountRepository.findBySeller_Id(seller.getId())
                .orElseGet(SellerPayoutAccount::new);
        account.setSeller(seller);
        account.setMethod("BANK");
        account.setBankName("MB Bank Demo");
        account.setAccountName("DEMO SELLER");
        account.setAccountNumber("9704" + String.format("%08d", seller.getId()));
        account.setStatus("VERIFIED");
        account.setDemoMode(true);
        sellerPayoutAccountRepository.save(account);
    }

    private void notification(User recipient, User actor, String type, String title, String message, String targetUrl) {
        if (notificationRepository.existsByRecipient_IdAndTypeAndTargetUrl(recipient.getId(), type, targetUrl)) {
            return;
        }
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .title(title)
                .message(message)
                .targetUrl(targetUrl)
                .createdAt(LocalDateTime.now().minusMinutes(20))
                .build());
    }

    private record LessonFixture(Integer episodeNumber, String title, Integer duration, Boolean preview, String videoUrl) {
    }
}
