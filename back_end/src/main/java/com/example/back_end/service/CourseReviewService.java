package com.example.back_end.service;
import com.example.back_end.dto.request.CourseReviewDecisionRequest;
import com.example.back_end.dto.response.CourseReviewResponse;
import com.example.back_end.dto.response.CourseReviewLessonResponse;
import com.example.back_end.entity.*;
import com.example.back_end.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service @RequiredArgsConstructor
public class CourseReviewService {
 private final CourseRepository courses; private final UserRepository users; private final CourseDetailRepository lessons; private final CourseReviewRequestRepository reviews; private final NotificationService notificationService; private final LessonResourceService lessonResourceService;
 @Transactional public CourseReviewResponse submit(Integer sellerId, Integer courseId) {
  Course course=courses.findById(courseId).orElseThrow(()->new IllegalArgumentException("Course not found"));
  if(!sellerId.equals(course.getSellerId())) throw new IllegalArgumentException("You do not own this course");
  if(Boolean.TRUE.equals(course.getStatus())) throw new IllegalArgumentException("Course is already published");
  CourseReviewRequest pendingReview = reviews.findTopByCourse_IdOrderBySubmittedAtDesc(courseId)
          .filter(review -> "PENDING".equals(review.getStatus())).orElse(null);
  if(pendingReview != null) return map(pendingReview);
  if(course.getDescription()==null||course.getDescription().isBlank()||course.getPrice()==null||course.getPrice()<=0||!lessons.existsByCourse_Id(courseId)) throw new IllegalArgumentException("Khóa học cần có mô tả, giá bán và ít nhất một bài giảng trước khi gửi xét duyệt");
  if(!lessons.existsByCourse_IdAndIsPreviewTrue(courseId)) throw new IllegalArgumentException("Khóa học cần có ít nhất một bài giảng cho phép xem thử trước khi gửi xét duyệt");
  CourseReviewRequest r=new CourseReviewRequest(); r.setCourse(course); r.setSeller(users.findById(sellerId).orElseThrow()); r.setStatus("PENDING"); r.setSubmittedAt(LocalDateTime.now());
  CourseReviewResponse response = map(reviews.save(r));
  notificationService.notifyUsers(users.findActiveUsersByRoleName("ADMIN"), sellerId, "COURSE_REVIEW_SUBMITTED", "Khóa học mới chờ duyệt", "Giảng viên " + r.getSeller().getFullname() + " đã gửi khóa \"" + course.getName() + "\" để xét duyệt.", "/admin/course-approval");
  return response;
 }
 @Transactional(readOnly=true) public List<CourseReviewResponse> pending(){return reviews.findAllByOrderBySubmittedAtDesc().stream().map(this::map).toList();}
 @Transactional(readOnly=true) public Page<CourseReviewResponse> pending(String status,String keyword,Pageable pageable){return reviews.searchAdminReviews(normalizeStatusFilter(status),normalizeKeyword(keyword),pageable).map(this::map);}
 @Transactional public CourseReviewResponse decide(Long id, CourseReviewDecisionRequest body){ CourseReviewRequest r=reviews.findById(id).orElseThrow(()->new IllegalArgumentException("Review request not found")); if(!"PENDING".equals(r.getStatus()))throw new IllegalArgumentException("Review request already processed"); r.setStatus(body.getDecision());r.setChecklistNote(body.getNote());r.setRejectionReason("REJECTED".equals(body.getDecision())?body.getNote():null);r.setReviewedAt(LocalDateTime.now());r.setReviewer(users.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow());r.getCourse().setStatus("APPROVED".equals(body.getDecision()));
  boolean approved = "APPROVED".equals(body.getDecision());
  notificationService.notifyUser(r.getSeller().getId(), r.getReviewer().getId(), approved ? "COURSE_APPROVED" : "COURSE_REJECTED", approved ? "Khóa học đã được phê duyệt" : "Khóa học cần chỉnh sửa", approved ? "Khóa \"" + r.getCourse().getName() + "\" đã được công khai trên nền tảng." : "Khóa \"" + r.getCourse().getName() + "\" chưa được phê duyệt. Vui lòng xem lý do và cập nhật nội dung.", "/seller/dashboard");
  return map(r);}
 private CourseReviewResponse map(CourseReviewRequest r){
  Course c=r.getCourse();
  List<CourseReviewLessonResponse> lessonVideos=lessons.findByCourse_Id(c.getId()).stream()
          .map(lesson -> new CourseReviewLessonResponse(lesson.getId(), lesson.getName(), lesson.getEpisodeNumber(), lesson.getDuration(), lesson.getIsPreview(), lesson.getLink(), lessonResourceService.getResponses(lesson.getId())))
          .toList();
  int totalDuration=lessonVideos.stream().mapToInt(lesson -> lesson.duration() == null ? 0 : lesson.duration()).sum();
  return CourseReviewResponse.builder().id(r.getId()).courseId(c.getId()).courseName(c.getName()).description(c.getDescription()).price(c.getPrice()).categoryId(c.getCategoryId()).level(c.getLevel()).image(c.getImage()).totalHour((int)Math.ceil(totalDuration/60.0)).lessons(lessonVideos.size()).sellerId(r.getSeller().getId()).sellerName(r.getSeller().getFullname()).status(r.getStatus()).rejectionReason(r.getRejectionReason()).submittedAt(r.getSubmittedAt()).lessonVideos(lessonVideos).build();}
 private String normalizeKeyword(String value){return value==null||value.trim().isBlank()?null:value.trim();}
 private String normalizeStatusFilter(String value){return value==null||value.trim().isBlank()||"ALL".equalsIgnoreCase(value)?null:value.trim().toUpperCase(Locale.ROOT);}
}
