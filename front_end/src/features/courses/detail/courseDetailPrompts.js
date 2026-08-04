import { loadSwal } from "../../../shared/utils/alerts";

export const promptLoginToWatchCourse = async (navigate) => {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    title: "Đăng nhập",
    text: "Đăng nhập để xem nội dung khóa học.",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Đăng nhập",
    cancelButtonText: "Hủy",
  });
  if (result.isConfirmed) navigate("/auth/login");
};

export const promptPurchaseRequired = async () => {
  const Swal = await loadSwal();
  await Swal.fire({
    title: "Nội dung khóa",
    text: "Bạn cần mua khóa học để xem tập này.",
    icon: "warning",
  });
};

export const promptLoginForEnrollment = async (navigate) => {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    title: "Hãy đăng nhập để thực hiện đăng ký khóa học",
    showClass: {
      popup: "animate__animated animate__fadeInUp animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown animate__faster",
    },
  });
  if (result.isConfirmed) navigate("/auth/login");
};

export const promptLoginForFavorite = async (navigate) => {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    title: "Vui lòng đăng nhập để thêm yêu thích",
    text: "Bạn cần đăng nhập để lưu khóa học vào danh sách yêu thích",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Đăng nhập",
    cancelButtonText: "Hủy",
  });
  if (result.isConfirmed) navigate("/auth/login");
};

export const promptLoginToReportCourse = async (navigate) => {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    title: "Đăng nhập để gửi khiếu nại",
    text: "Khiếu nại cần gắn với tài khoản của bạn để admin có thể theo dõi và phản hồi.",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Đăng nhập",
    cancelButtonText: "Hủy",
  });
  if (result.isConfirmed) navigate("/auth/login");
};
