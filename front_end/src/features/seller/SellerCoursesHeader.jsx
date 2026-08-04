import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";

export default function SellerCoursesHeader({ sellerId, totalCourses }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý khóa học</h1>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
          {totalCourses.toLocaleString("vi-VN")} khóa học
        </span>
      </div>
      <Link
        to="/seller/course/new"
        state={{ sellerId }}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <FaBook />
        Thêm khóa học mới
      </Link>
    </div>
  );
}
