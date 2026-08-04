import React from "react";
import { Play, X } from "lucide-react";

const CourseVideoPreviewModal = ({
  open,
  previewVideoSource,
  courseThumbnail,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="course-preview-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="course-preview-modal relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="course-preview-modal-header flex items-center justify-between border-b bg-white p-4">
          <h3 className="text-lg font-semibold">Xem thử khóa học</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Đóng video xem thử"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="course-preview-modal-video aspect-video bg-black">
          {previewVideoSource ? (
            <video
              src={previewVideoSource}
              poster={courseThumbnail}
              className="h-full w-full"
              controls
              autoPlay
              preload="metadata"
              title="Video xem trước khóa học"
            >
              Trình duyệt không hỗ trợ phát video này.
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white">
              <div className="text-center">
                <Play className="mx-auto mb-4 h-16 w-16 opacity-50" />
                <p className="text-lg">Chưa thể xem trước video</p>
                <p className="mt-2 text-sm opacity-75">
                  Khóa học này chưa có video xem trước khả dụng.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseVideoPreviewModal);
