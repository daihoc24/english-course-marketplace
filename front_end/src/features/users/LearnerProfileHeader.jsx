import { Camera, Edit3, Save, ShieldCheck, User, X } from "lucide-react";

export default function LearnerProfileHeader({
  avatarLoading = false,
  displayAvatar = "",
  displayName = "",
  fileInputRef,
  initials = "",
  isEditing = false,
  onAvatarUpdate,
  onCancel,
  onFileChange,
  onSave,
  onStartEdit,
  saving = false,
  selectedFile,
  userInfo,
}) {
  return (
    <>
      <div className="relative min-h-56 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_34%),linear-gradient(135deg,#0f172a,#1e293b_55%,#2563eb)] px-6 py-8 text-white sm:px-10">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              <ShieldCheck className="h-4 w-4" />
              Hồ sơ học viên
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Quản lý thông tin cá nhân
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-50">
              Cập nhật hồ sơ để giảng viên và hệ thống hỗ trợ bạn tốt hơn trong quá trình học.
            </p>
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-8 mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 ring-4 ring-white">
          {displayAvatar ? (
            <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-blue-700">
              {initials || <User className="h-10 w-10" />}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef?.current?.click()}
            className="absolute bottom-2 right-2 rounded-full bg-slate-950 p-2 text-white shadow-lg hover:bg-blue-600"
            aria-label="Đổi ảnh đại diện"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-slate-950">{displayName || "Chưa cập nhật tên"}</h2>
          <p className="mt-1 text-sm text-slate-500">{userInfo.email}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Học viên</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              {userInfo.active ? "Tài khoản đang hoạt động" : "Tài khoản chưa kích hoạt"}
            </span>
          </div>
        </div>

        {selectedFile && (
          <button
            type="button"
            onClick={onAvatarUpdate}
            disabled={avatarLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {avatarLoading ? "Đang tải ảnh..." : "Lưu ảnh mới"}
          </button>
        )}
      </div>
    </>
  );
}
