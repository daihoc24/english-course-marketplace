import { sellerCategoryLabels } from "./sellerDashboardView";

const sellerCourseFallbackImage =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80";

export const getSellerCourseApprovalStatus = (course) => {
  const reviewStatus = String(course.reviewStatus || "").toUpperCase();
  if (course.status) return "approved";
  if (reviewStatus === "PENDING") return "pending";
  if (reviewStatus === "REJECTED") return "rejected";
  return "draft";
};

export const toSellerCourseCardData = (course) => {
  const reviewStatus = String(course.reviewStatus || "").toUpperCase();
  const approvalStatus = getSellerCourseApprovalStatus(course);

  return {
    id: course.id,
    name: course.name,
    price: course.price,
    description: course.description || "",
    rating: course.rating || 0,
    episodeCount: course.episodeCount || 0,
    duration: course.duration || 0,
    categoryId: course.categoryId,
    image: course.image || sellerCourseFallbackImage,
    category: sellerCategoryLabels[course.categoryId] || "Chưa phân loại",
    level: course.level || "Chưa chọn",
    age: course.age || "Chưa chọn",
    status: course.status ? "Active" : reviewStatus === "PENDING" ? "Pending Review" : "Draft",
    approvalStatus,
    rejectionReason: course.rejectionReason || null,
    totalHour: course.totalHour ?? Math.ceil((course.duration || 0) / 60),
    lessons: course.lessons ?? course.episodeCount ?? 0,
    students: course.studentCount ?? 0,
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: new Date().toISOString().split("T")[0],
  };
};

export const getDeleteBlockedMessage = (course) => (
  course?.approvalStatus === "approved"
    ? "Khóa học đã được phê duyệt nên không thể xóa trực tiếp. Bạn có thể chỉnh sửa để gửi xét duyệt lại hoặc dùng chức năng ngừng bán khi được bổ sung."
    : "Khóa học đang chờ xét duyệt nên chưa thể xóa."
);
