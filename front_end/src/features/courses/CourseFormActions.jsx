import React from "react";
import { FiSave } from "react-icons/fi";

const CourseFormActions = ({ isEditMode, loading, onCancel }) => (
  <div className="flex justify-end space-x-4 pt-4">
    <button
      type="button"
      onClick={onCancel}
      className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
    >
      Hủy
    </button>
    <button
      type="submit"
      disabled={loading}
      className="flex items-center rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
    >
      <FiSave className="mr-2" />
      {loading ? "Đang lưu..." : isEditMode ? "Cập nhật khóa học" : "Tạo khóa học"}
    </button>
  </div>
);

export default React.memo(CourseFormActions);
