import { normalizeCertificateUrl } from "../../utils/certificates";

export const createEmptyResource = () => ({
  title: "",
  url: "",
  type: "LINK",
});

export const toResourceDrafts = (resources = []) => {
  const drafts = resources
    .map((resource) => ({
      title: resource.title || resource.fileName || "",
      type: resource.type || "LINK",
      url: normalizeCertificateUrl(resource.url || resource.link || resource.secureUrl),
    }))
    .filter((resource) => resource.title || resource.url);

  return drafts.length ? drafts : [createEmptyResource()];
};

export const normalizeResources = (resources = []) =>
  resources
    .map((resource, index) => ({
      title: String(resource.title || "").trim(),
      type: normalizeCertificateUrl(resource.url) ? "LINK" : "TEXT",
      url: normalizeCertificateUrl(resource.url),
      sortOrder: index + 1,
    }))
    .filter((resource) => resource.title || resource.url);

export const createEmptyLesson = (isPreview = true) => ({
  title: "",
  episodeNumber: "",
  isPreview,
  file: null,
  resources: [createEmptyResource()],
});

export const courseCategoryOptions = [
  { value: "1", label: "IELTS" },
  { value: "2", label: "Tiếng Anh thương mại" },
  { value: "3", label: "Tiếng Anh thiếu nhi" },
  { value: "4", label: "Giao tiếp" },
  { value: "5", label: "Ngữ pháp" },
  { value: "6", label: "Tiếng Anh tổng quát" },
];

export const courseLevelOptions = [
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Upper Intermediate", label: "Trung cấp cao" },
  { value: "Advanced", label: "Nâng cao" },
];

export const courseAgeOptions = [
  { value: "4-12 year old", label: "4-12 tuổi" },
  { value: "13-18 year old", label: "13-18 tuổi" },
  { value: "18+ year old", label: "Từ 18 tuổi trở lên" },
];
