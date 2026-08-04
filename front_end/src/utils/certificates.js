const CERTIFICATE_LINK_SEPARATOR = " || ";
const LEGACY_CERTIFICATE_SEPARATOR = " :: ";

export const normalizeCertificateUrl = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\/\S+$/i.test(text)) return text;
  if (/^www\.[^\s]+\.[a-z]{2,}([/?#]\S*)?$/i.test(text)) return `https://${text}`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}([/?#]\S*)?$/i.test(text)) {
    return `https://${text}`;
  }
  return "";
};

const parseCertificateLine = (line) => {
  const text = String(line || "").trim();
  if (!text) return null;

  const separator = text.includes(CERTIFICATE_LINK_SEPARATOR)
    ? CERTIFICATE_LINK_SEPARATOR
    : text.includes(LEGACY_CERTIFICATE_SEPARATOR)
      ? LEGACY_CERTIFICATE_SEPARATOR
      : "";

  if (separator) {
    const [title, ...linkParts] = text.split(separator);
    return {
      title: title.trim(),
      link: normalizeCertificateUrl(linkParts.join(separator)),
    };
  }

  const pipeMatch = text.match(/^(.*?)\s+\|\s+(\S.*)$/);
  if (pipeMatch && normalizeCertificateUrl(pipeMatch[2])) {
    return {
      title: pipeMatch[1].trim(),
      link: normalizeCertificateUrl(pipeMatch[2]),
    };
  }

  const link = normalizeCertificateUrl(text);
  return link ? { title: "", link } : { title: text, link: "" };
};

const normalizeCertificateEntry = (item) => {
  if (!item) return null;
  if (typeof item === "string") return parseCertificateLine(item);

  const title = String(item.title || item.name || item.label || item.fileName || "").trim();
  const link = normalizeCertificateUrl(item.link || item.url || item.certificateUrl || item.secureUrl || item.fileUrl);
  return title || link ? { title, link } : null;
};

export const parseCertificates = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeCertificateEntry).filter((item) => item && (item.title || item.link));
  }

  const text = String(value || "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const certificates = entries
      .map(normalizeCertificateEntry)
      .filter((item) => item && (item.title || item.link));
    if (certificates.length) return certificates;
  } catch {
    // Keep supporting the older text format below.
  }

  const rawItems = text.includes("\n") || text.includes(CERTIFICATE_LINK_SEPARATOR) || text.includes(LEGACY_CERTIFICATE_SEPARATOR)
    ? text.split(/\r?\n/)
    : text.split(/[,;]/);

  return rawItems
    .map(parseCertificateLine)
    .filter((item) => item && (item.title || item.link));
};

export const serializeCertificates = (items = []) => {
  const certificates = items
    .map(normalizeCertificateEntry)
    .filter((item) => item && (item.title || item.link));
  return certificates.length ? JSON.stringify(certificates) : "";
};

export const certificateInputRows = (value) => {
  const parsed = parseCertificates(value).map((item) => ({
    title: item.title || "",
    link: item.link || "",
  }));
  return parsed.length ? parsed : [{ title: "", link: "" }];
};

export const parseCertificateEntries = parseCertificates;
export const serializeCertificateEntries = serializeCertificates;
export const toEditableCertificateEntries = certificateInputRows;
