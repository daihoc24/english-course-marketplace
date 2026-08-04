import React from "react";
import { FiUpload, FiX } from "react-icons/fi";

const CourseCoverImageField = ({ image, onImageChange, onClearImage }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Ảnh bìa khóa học</label>
    <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors duration-200 hover:border-blue-500">
      <div className="space-y-1 text-center">
        {image ? (
          <div className="relative">
            <img
              src={image}
              alt="Ảnh bìa khóa học"
              className="mx-auto h-48 w-auto rounded-lg object-cover shadow-md"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors duration-200 hover:bg-red-600"
              aria-label="Xóa ảnh bìa"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <>
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">
                <span>Chọn ảnh</span>
                <input type="file" className="sr-only" accept="image/*" onChange={onImageChange} />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

export default React.memo(CourseCoverImageField);
