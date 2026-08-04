export const formatSellerCourseDuration = (minutes) => {
  const total = Number(minutes || 0);
  if (!total) return "Chưa có thời lượng";
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours} giờ ${mins} phút`;
  if (hours) return `${hours} giờ`;
  return `${mins} phút`;
};
