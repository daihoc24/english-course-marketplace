import React from "react";
import { FiArrowLeft } from "react-icons/fi";

const CourseFormHeader = ({ isEditMode, onBack }) => (
  <div className="mb-6 flex items-center">
    <button
      type="button"
      onClick={onBack}
      className="mr-4 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
      aria-label="Quay lại bảng giảng viên"
    >
      <FiArrowLeft size={24} className="text-gray-600" />
    </button>
    <h1 className="text-3xl font-bold text-gray-800">
      {isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
    </h1>
  </div>
);

export default React.memo(CourseFormHeader);
