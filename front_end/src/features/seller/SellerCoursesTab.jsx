import { lazy, Suspense, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerService from "../../API/SellerService";
import AdminPagination from "../../component/AdminPagination";
import { ProductContext } from "../../context/ProductContext";
import StateBlock from "../../shared/components/feedback/StateBlock";
import TableToolbar from "../../shared/components/table/TableToolbar";
import { loadSwal } from "../../shared/utils/alerts";
import { normalizePagePayload } from "../../utils/pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  courseApprovalOptions,
  sellerLevelOptions,
} from "./sellerDashboardView";
import SellerCoursesHeader from "./SellerCoursesHeader";
import { getDeleteBlockedMessage, toSellerCourseCardData } from "./sellerCourseView";
import { getSellerIdFromSession } from "./sellerSession";
import { SellerLoadingState } from "./SellerStates";

const SellerCourseCard = lazy(() =>
  import("./SellerCourseCard").then((module) => ({ default: module.SellerCourseCard }))
);
const SellerCourseModal = lazy(() => import("./SellerCourseModal"));

const CoursesTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCourses, setTotalCourses] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useContext(ProductContext);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const sellerId = getSellerIdFromSession(session);
  const sellerToken = session?.token;

  const fetchCourses = useCallback(async () => {
    if (!sellerToken || !sellerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await SellerService.getSellerCourses(sellerId, {
        page: currentPage - 1,
        size: pageSize,
        keyword: debouncedSearchTerm.trim() || undefined,
        level: selectedLevel || undefined,
        status: selectedStatus || undefined,
      });
      if (response.code === 200) {
        const { content, totalElements } = normalizePagePayload(response);
        setCourses(content.map(toSellerCourseCardData));
        setTotalCourses(totalElements);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError("Không thể tải danh sách khóa học");
      setCourses([]);
      setTotalCourses(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, pageSize, selectedLevel, selectedStatus, sellerId, sellerToken]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedLevel, selectedStatus, pageSize]);

  const handleDeleteCourse = async (courseId) => {
    const Swal = await loadSwal();
    const targetCourse = courses.find((course) => course.id === courseId);
    if (targetCourse && !["draft", "rejected"].includes(targetCourse.approvalStatus)) {
      await Swal.fire({
        icon: "info",
        title: "Không thể xóa khóa học",
        text: getDeleteBlockedMessage(targetCourse),
        confirmButtonText: "Đã hiểu",
      });
      return;
    }
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa khóa học này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    });

    if (result.isConfirmed) {
      try {
        const response = await SellerService.deleteCourse(sellerId, courseId);
        if (response.code === 200) {
          await fetchCourses();
          Swal.fire(
            "Đã xóa!",
            "Khóa học đã được xóa thành công.",
            "success"
          );
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        Swal.fire(
          "Lỗi!",
          "Có lỗi xảy ra khi xóa khóa học.",
          "error"
        );
      }
    }
  };

  const handleEditCourse = (course) => {
    navigate(`/seller/course/${course.id}/edit`, { 
      state: { 
        course,
        sellerId 
      }
    });
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleResubmitCourse = (courseId) => {
    const course = courses.find((item) => item.id === courseId);
    if (course) handleEditCourse(course);
  };

  const handleSubmitForReview = async (course) => {
    const Swal = await loadSwal();
    try {
      const response = await SellerService.submitCourseForReview(sellerId, course.id);
      if (response.code !== 200) throw new Error(response.message || "Không thể gửi xét duyệt");
      const updateCourseStatus = (item) => item.id === course.id ? { ...item, approvalStatus: "pending", status: "Pending Review" } : item;
      setCourses((previous) => previous.map(updateCourseStatus));
      setSelectedCourse((previous) => previous ? updateCourseStatus(previous) : previous);
      await Swal.fire({ title: "Đã gửi xét duyệt", text: "Khóa học đang chờ kiểm tra.", icon: "success" });
    } catch (error) {
      await Swal.fire({ title: "Chưa thể gửi xét duyệt", text: error?.response?.data?.message || error?.message || "Vui lòng thử lại.", icon: "warning" });
    }
  };

  if (loading) {
    return <SellerLoadingState text="Đang tải danh sách khóa học..." />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Có lỗi xảy ra
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <SellerCoursesHeader sellerId={sellerId} totalCourses={totalCourses} />

      <div className="mb-6">
        <TableToolbar
          filters={[
            {
              key: "level",
              options: sellerLevelOptions,
              value: selectedLevel,
              onChange: setSelectedLevel,
            },
            {
              key: "status",
              options: courseApprovalOptions,
              value: selectedStatus,
              onChange: setSelectedStatus,
            },
          ]}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm khóa học..."
          searchValue={searchTerm}
        />
      </div>

      {courses.length === 0 ? (
        <StateBlock text="Chưa có khóa học phù hợp" />
      ) : (
        <Suspense fallback={<StateBlock text="Đang tải danh sách khóa học..." />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <SellerCourseCard
                key={course.id}
                course={course}
                indexLabel={(currentPage - 1) * pageSize + index + 1}
                onDelete={handleDeleteCourse}
                onEdit={handleEditCourse}
                onResubmit={handleResubmitCourse}
                onView={handleViewCourse}
              />
            ))}
          </div>
        </Suspense>
      )}

      <AdminPagination
        currentPage={currentPage}
        itemLabel="khóa học"
        onPageChange={setCurrentPage}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        pageSizeOptions={[6, 9, 12, 24]}
        totalItems={totalCourses}
      />
      {showModal && (
        <Suspense fallback={null}>
          <SellerCourseModal
            course={selectedCourse}
            onClose={() => setShowModal(false)}
            onSubmitForReview={handleSubmitForReview}
            open={showModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CoursesTab;


