import { createRefundRequest } from "../../API/RefundService";
import { loadSwal } from "../../shared/utils/alerts";
import { readStoredSession } from "../../utils/session";

const refundDialogHtml = `
  <div class="text-left">
    <label class="mb-2 block text-sm font-semibold text-slate-700">Lý do hoàn tiền</label>
    <textarea id="refundReason" class="swal2-textarea" maxlength="500" placeholder="Mô tả vấn đề bạn gặp phải, ví dụ: video lỗi, nội dung không đúng mô tả..." style="width:100%; min-height:120px; margin:0;"></textarea>
    <label class="mt-4 mb-2 block text-sm font-semibold text-slate-700">Minh chứng đính kèm <span class="font-normal text-slate-400">(không bắt buộc)</span></label>
    <input id="refundAttachment" type="file" accept="image/*,video/*" style="display:none" />
    <label for="refundAttachment" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:9px 12px;color:#0f172a;font-size:14px;font-weight:600;">
      Chọn tệp
    </label>
    <span id="refundAttachmentName" style="margin-left:10px;color:#64748b;font-size:13px;">Chưa chọn tệp</span>
    <p class="mt-2 text-xs text-slate-500">Hỗ trợ ảnh tối đa 5MB hoặc video tối đa 1GB. Nếu được duyệt, tiền hoàn sẽ vào tín dụng học tập để bạn mua khóa khác hoặc rút tiền.</p>
  </div>
`;

const validateRefundFile = (Swal, file) => {
  if (!file) return true;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    Swal.showValidationMessage("Minh chứng phải là ảnh hoặc video");
    return false;
  }

  const maxSize = isVideo ? 1024 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    Swal.showValidationMessage(isVideo ? "Video minh chứng tối đa 1GB" : "Ảnh minh chứng tối đa 5MB");
    return false;
  }

  return true;
};

const readRefundForm = (Swal) => {
  const reason = document.getElementById("refundReason")?.value?.trim();
  const file = document.getElementById("refundAttachment")?.files?.[0] || null;

  if (!reason) {
    Swal.showValidationMessage("Vui lòng nhập lý do hoàn tiền");
    return false;
  }

  if (!validateRefundFile(Swal, file)) return false;
  return { reason, file };
};

export const requestOrderRefund = async (orderId) => {
  const session = readStoredSession();
  if (!session?.token) return false;
  const Swal = await loadSwal();

  const result = await Swal.fire({
    title: "Yêu cầu hoàn tiền",
    html: refundDialogHtml,
    showCancelButton: true,
    confirmButtonText: "Gửi yêu cầu hoàn tiền",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#2563eb",
    focusConfirm: false,
    didOpen: () => {
      const input = document.getElementById("refundAttachment");
      const name = document.getElementById("refundAttachmentName");
      input?.addEventListener("change", () => {
        const file = input.files?.[0];
        if (name) name.textContent = file ? file.name : "Chưa chọn tệp";
      });
    },
    preConfirm: () => readRefundForm(Swal),
  });

  if (!result.isConfirmed || !result.value?.reason) return false;

  try {
    await createRefundRequest(orderId, result.value.reason, session.token, result.value.file);
    await Swal.fire({
      icon: "success",
      title: "Đã gửi yêu cầu",
      text: "Admin sẽ xem xét yêu cầu. Nếu được duyệt, tiền hoàn sẽ vào tín dụng học tập của bạn.",
    });
    return true;
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Chưa thể gửi yêu cầu",
      text: error?.response?.data?.message || "Vui lòng thử lại.",
    });
    return false;
  }
};
