export const cleanOperationalText = (value, fallback = "") => {
  const text = String(value || "").trim();
  if (!text) return fallback;

  return text
    .replace(/^Demo\s*[:-]\s*/i, "")
    .replace(/\bkhóa học demo\b/gi, "khóa học")
    .replace(/\bkhóa demo\b/gi, "khóa học")
    .replace(/\bgiảng viên demo\b/gi, "giảng viên")
    .replace(/\bhọc viên demo\b/gi, "học viên")
    .replace(/\btrong môi trường demo\b/gi, "")
    .replace(/\bở môi trường demo\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
};
