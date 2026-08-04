export function normalizePagePayload(payload) {
  const value = payload?.result ?? payload;

  if (Array.isArray(value)) {
    return {
      content: value,
      totalElements: value.length,
    };
  }

  const content = Array.isArray(value?.content) ? value.content : [];
  const totalElements = Number(value?.totalElements ?? content.length);

  return {
    content,
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
  };
}
