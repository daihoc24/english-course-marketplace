import React from "react";
import { FiPlus, FiSave, FiTrash2, FiUpload, FiVideo } from "react-icons/fi";
import LessonResourceFields from "./LessonResourceFields";
import { createEmptyResource, toResourceDrafts } from "./courseFormView";

const CourseLessonsEditor = ({
  lesson,
  lessonFileInputRef,
  lessonUploading,
  lessonUploadProgress,
  uploadedLessons,
  lessonResourceDrafts,
  resourceSavingLessonId,
  onLessonChange,
  onLessonFileChange,
  onLessonUpload,
  onNewLessonResourceChange,
  onAddNewLessonResource,
  onRemoveNewLessonResource,
  onDeleteLesson,
  onAddLessonResource,
  onLessonResourceDraftChange,
  onRemoveLessonResource,
  onSaveLessonResources,
}) => (
  <section className="space-y-4 border-t border-slate-200 pt-6">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Bài giảng video</h2>
      <p className="mt-1 text-sm text-slate-600">
        Thêm video bài giảng trực tiếp để học viên xem an toàn trong khóa học.
        Trước khi gửi xét duyệt, hãy bật xem thử miễn phí cho ít nhất một bài.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
      <input
        type="text"
        value={lesson.title}
        onChange={(event) => onLessonChange("title", event.target.value)}
        placeholder="Tên bài học (không bắt buộc)"
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
      <input
        type="number"
        min="1"
        value={lesson.episodeNumber}
        onChange={(event) => onLessonChange("episodeNumber", event.target.value)}
        placeholder="Số thứ tự bài"
        className="rounded-lg border border-slate-300 px-3 py-2"
      />
      <input
        ref={lessonFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(event) => onLessonFileChange(event.target.files?.[0] || null)}
        className="sr-only"
      />

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600">
            <FiVideo size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">
              {lesson.file ? lesson.file.name : "Chưa chọn video"}
            </p>
            <p className="text-xs text-slate-500">
              {lesson.file ? `${(lesson.file.size / 1024 / 1024).toFixed(1)} MB` : "Hỗ trợ MP4, WebM, MOV"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => lessonFileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
        >
          <FiUpload /> {lesson.file ? "Chọn lại video" : "Chọn video"}
        </button>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={lesson.isPreview}
          onChange={(event) => onLessonChange("isPreview", event.target.checked)}
        />
        Cho phép xem thử miễn phí
      </label>
      <div className="md:text-right">
        <button
          type="button"
          onClick={onLessonUpload}
          disabled={lessonUploading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {lessonUploading ? `Đang tải lên ${lessonUploadProgress}%` : "Tải video lên"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tài liệu bài học</h3>
            <p className="mt-1 text-xs text-slate-500">
              Đính kèm file PDF/bài tập hoặc thêm link tham khảo cho video này.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddNewLessonResource}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <FiPlus /> Thêm tài liệu
          </button>
        </div>
        <LessonResourceFields
          resources={lesson.resources || [createEmptyResource()]}
          onChange={onNewLessonResourceChange}
          onRemove={onRemoveNewLessonResource}
        />
      </div>
    </div>

    {uploadedLessons.length > 0 && (
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {uploadedLessons.map((item) => (
          <li key={item.id} className="px-4 py-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">
                  Bài {item.episodeNumber}
                  {item.name ? ` - ${item.name}` : ""}
                </p>
                <p className="text-slate-500">
                  {item.duration || 0} phút - {item.isPreview ? "Xem thử" : "Chỉ học viên đã mua"} - {(item.resources || []).length} tài liệu
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteLesson(item.id)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label="Xóa bài giảng"
              >
                <FiTrash2 />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Tài liệu của bài {item.episodeNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => onAddLessonResource(item.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  <FiPlus /> Thêm tài liệu
                </button>
              </div>
              <LessonResourceFields
                resources={lessonResourceDrafts[item.id] || toResourceDrafts(item.resources)}
                onChange={(index, field, value) => onLessonResourceDraftChange(item.id, index, field, value)}
                onRemove={(index) => onRemoveLessonResource(item.id, index)}
              />
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => onSaveLessonResources(item.id)}
                  disabled={resourceSavingLessonId === item.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <FiSave />
                  {resourceSavingLessonId === item.id ? "Đang lưu..." : "Lưu tài liệu"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default React.memo(CourseLessonsEditor);
