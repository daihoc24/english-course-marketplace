import React from "react";
import { courseAgeOptions, courseCategoryOptions, courseLevelOptions } from "./courseFormView";

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500";

const CourseBasicFields = ({ formData, onChange }) => (
  <>
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tên khóa học</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        className={fieldClassName}
        placeholder="Nhập tên khóa học"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Mô tả</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onChange}
        rows={4}
        required
        className={fieldClassName}
        placeholder="Mô tả ngắn về nội dung và lợi ích của khóa học"
      />
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Giá bán (VND)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={onChange}
          required
          min="0"
          step="1000"
          className={fieldClassName}
          placeholder="Ví dụ: 200000"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={onChange}
          required
          className={fieldClassName}
        >
          <option value="">Chọn danh mục</option>
          {courseCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
        <select name="level" value={formData.level} onChange={onChange} required className={fieldClassName}>
          {courseLevelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Độ tuổi phù hợp</label>
        <select name="age" value={formData.age} onChange={onChange} required className={fieldClassName}>
          <option value="">Chọn độ tuổi</option>
          {courseAgeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  </>
);

export default React.memo(CourseBasicFields);
