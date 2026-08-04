export const roleOptions = [
  { value: "USER", label: "Học viên" },
  { value: "SELLER", label: "Giảng viên" },
  { value: "ADMIN", label: "Admin" },
];

export const roleTone = {
  USER: "blue",
  SELLER: "emerald",
  ADMIN: "violet",
};

export const userStatusTone = {
  ACTIVE: "emerald",
  LOCKED: "rose",
};

export const userStatusLabel = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
};

export const userStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
];

export const userRoleOptions = [
  { value: "ALL", label: "Tất cả vai trò" },
  ...roleOptions,
];

export function normalizeRole(value) {
  const raw = Array.isArray(value)
    ? value[0]?.name
    : typeof value === "object" && value !== null
      ? value.name
      : value;

  return String(raw || "USER").replace(/^ROLE_/, "").toUpperCase();
}

export function roleLabel(role) {
  return roleOptions.find((item) => item.value === role)?.label || role || "Chưa rõ";
}

export function getInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

export function toAdminUser(item = {}) {
  const role = normalizeRole(item.roles || item.role);
  return {
    id: item.id,
    fullname: item.fullname || item.fullName || item.username || "Chưa cập nhật",
    email: item.email || "",
    username: item.username || "",
    phone: item.phone || "",
    avatar: item.imageUrl || item.avatar || "",
    active: Boolean(item.active),
    role,
  };
}
