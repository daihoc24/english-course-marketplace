import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Flag, Loader2, X } from "lucide-react";
import { createReport } from "../API/ReportService";

const DEFAULT_FORM = {
  subject: "",
  detail: "",
  category: "TECHNICAL",
  priority: "NORMAL",
};

const categories = [
  { value: "TECHNICAL", label: "Lỗi kỹ thuật" },
  { value: "PAYMENT", label: "Thanh toán" },
  { value: "CONTENT", label: "Nội dung khóa học" },
  { value: "QUALITY", label: "Chất lượng giảng dạy" },
  { value: "OTHER", label: "Vấn đề khác" },
];

const priorities = [
  { value: "LOW", label: "Thấp" },
  { value: "NORMAL", label: "Bình thường" },
  { value: "HIGH", label: "Cao" },
];

const isSuccessCode = (code) => code === 0 || code === 200 || code === undefined || code === null;

const ReusableReportForm = ({ courseId, courseTitle, onCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return "";
    });
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] || null;
    setMessage(null);
    if (!file) {
      clearAttachment();
      return;
    }
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setMessage({ type: "error", text: "Chỉ hỗ trợ ảnh hoặc video minh họa." });
      clearAttachment();
      event.target.value = "";
      return;
    }
    const maxSize = isVideo ? 1024 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: "error", text: isVideo ? "Video đính kèm quá lớn. Vui lòng chọn video không quá 1GB." : "Ảnh đính kèm quá lớn. Vui lòng chọn ảnh dưới 5MB." });
      clearAttachment();
      event.target.value = "";
      return;
    }
    setAttachmentFile(file);
    setAttachmentPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return URL.createObjectURL(file);
    });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setMessage(null);
    clearAttachment();
  };

  useEffect(() => () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
  }, [attachmentPreview]);

  const validate = () => {
    if (!courseId) return "Không xác định được khóa học cần khiếu nại.";
    if (!form.subject.trim()) return "Vui lòng nhập chủ đề khiếu nại.";
    if (!form.detail.trim()) return "Vui lòng mô tả chi tiết vấn đề.";
    if (form.subject.trim().length < 3) return "Chủ đề nên có ít nhất 3 ký tự.";
    if (form.detail.trim().length < 10) return "Nội dung khiếu nại nên có ít nhất 10 ký tự để admin dễ xử lý.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: "error", text: validationMessage });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload = new FormData();
      payload.append("courseId", String(Number(courseId)));
      payload.append("subject", form.subject.trim());
      payload.append("detail", form.detail.trim());
      payload.append("category", form.category);
      payload.append("priority", form.priority);
      if (attachmentFile) {
        payload.append("attachment", attachmentFile);
      }

      const response = await createReport(payload);

      const code = response.data?.code;
      if (isSuccessCode(code)) {
        setMessage({ type: "success", text: response.data?.message || "Đã gửi khiếu nại. Admin sẽ kiểm tra và phản hồi sớm." });
        onCreated?.(response.data?.result);
        setForm(DEFAULT_FORM);
        clearAttachment();
        window.setTimeout(() => {
          setShowModal(false);
          setMessage(null);
        }, 900);
      } else {
        setMessage({ type: "error", text: response.data?.message || "Không thể gửi khiếu nại." });
      }
    } catch (error) {
      console.error("Lỗi khi gửi khiếu nại:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Không thể gửi khiếu nại. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        <Flag size={17} />
        Gửi khiếu nại về khóa học
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Hỗ trợ chất lượng</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Gửi khiếu nại tới quản trị viên</h2>
                <p className="mt-1 text-sm text-slate-500">Mô tả rõ vấn đề để admin có thể kiểm tra khóa học nhanh hơn.</p>
                {courseTitle && <p className="mt-3 inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">Khóa học: {courseTitle}</p>}
              </div>
              <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              {message && (
                <div
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Chủ đề</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Ví dụ: Video bài học bị lỗi"
                  maxLength={120}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Chi tiết</label>
                <textarea
                  name="detail"
                  value={form.detail}
                  onChange={handleChange}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Mô tả vấn đề bạn gặp phải, ví dụ: bài số mấy, lỗi xảy ra khi nào..."
                  maxLength={2000}
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.detail.length}/2000 ký tự</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Loại vấn đề</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mức độ ưu tiên</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Ảnh hoặc video đính kèm (không bắt buộc)</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Thêm bằng chứng để quản trị viên kiểm tra nhanh hơn. Ảnh tối đa 5MB, video tối đa 1GB.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
                    Chọn tệp
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleAttachmentChange} />
                  </label>
                </div>
                {attachmentPreview ? (
                  <div className="mt-4 flex items-center gap-4">
                    {attachmentFile?.type?.startsWith("video/") ? (
                      <video src={attachmentPreview} controls preload="metadata" className="h-24 w-40 rounded-2xl border border-slate-200 bg-slate-950 object-cover" />
                    ) : (
                      <img src={attachmentPreview} alt="Ảnh đính kèm" className="h-24 w-24 rounded-2xl border border-slate-200 object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{attachmentFile?.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{Math.round((attachmentFile?.size || 0) / 1024)} KB</p>
                      <button
                        type="button"
                        onClick={clearAttachment}
                        className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Xóa tệp
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Chưa chọn tệp nào.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Đang gửi..." : "Gửi khiếu nại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReusableReportForm;
