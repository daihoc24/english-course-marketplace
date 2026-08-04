export const loadSwal = async () => {
  const module = await import("sweetalert2");
  return module.default;
};
