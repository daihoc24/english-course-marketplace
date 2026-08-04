import { lazy, Suspense } from "react";
import CertificateList from "./CertificateList";

const CertificateEditor = lazy(() => import("./CertificateEditor"));

const CertificateEditorFallback = () => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
    Đang tải trình chỉnh sửa chứng chỉ...
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={`block ${className}`}>
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </div>
);

export default function LearnerProfileForm({
  certificateItems = [],
  displayedCertificateItems = [],
  formData = {},
  isEditing = false,
  onCertificateAdd,
  onCertificateChange,
  onCertificateRemove,
  onInputChange,
  userInfo = {},
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Thông tin cá nhân</h3>
          <p className="text-sm text-slate-500">Những thông tin cơ bản dùng trong trải nghiệm học tập.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Họ và tên">
          <input
            name="fullname"
            disabled={!isEditing}
            value={isEditing ? formData.fullname : userInfo.fullname}
            onChange={onInputChange}
            placeholder="Nhập họ và tên"
            className="profile-input"
          />
        </Field>

        <Field label="Tên tài khoản">
          <input
            name="username"
            disabled={!isEditing}
            value={isEditing ? formData.username : userInfo.username}
            onChange={onInputChange}
            placeholder="Nhập tên tài khoản"
            className="profile-input"
          />
        </Field>

        <Field label="Giới tính">
          <select
            name="gender"
            disabled={!isEditing}
            value={isEditing ? formData.gender : userInfo.gender}
            onChange={onInputChange}
            className="profile-input"
          >
            <option value="">Chưa cập nhật</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </Field>

        <Field label="Số điện thoại">
          <input
            name="phone"
            disabled={!isEditing}
            value={isEditing ? formData.phone : userInfo.phone}
            onChange={onInputChange}
            placeholder="Nhập số điện thoại"
            className="profile-input"
          />
        </Field>

        <Field label="Giới thiệu bản thân" className="md:col-span-2">
          <textarea
            name="introduce"
            disabled={!isEditing}
            value={isEditing ? formData.introduce : userInfo.introduce}
            onChange={onInputChange}
            placeholder="Ví dụ: Mục tiêu học TOEIC 750 trong 3 tháng..."
            rows={4}
            className="profile-input resize-none"
          />
        </Field>

        <Field label="Chứng chỉ / thành tựu" className="md:col-span-2">
          {isEditing ? (
            <Suspense fallback={<CertificateEditorFallback />}>
              <CertificateEditor
                items={certificateItems}
                onAdd={onCertificateAdd}
                onChange={onCertificateChange}
                onRemove={onCertificateRemove}
              />
            </Suspense>
          ) : (
            <CertificateList items={displayedCertificateItems} />
          )}
          <p className="text-sm text-slate-500">
            Có thể thêm nhiều chứng chỉ/thành tựu. Liên kết minh chứng là tùy chọn.
          </p>
        </Field>
      </div>
    </section>
  );
}
