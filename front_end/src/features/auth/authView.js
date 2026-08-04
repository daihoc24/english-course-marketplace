export const AUTH_MODES = {
  LOGIN: "login",
  FORGOT: "forgot",
  VERIFY_EMAIL: "register",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isValidEmail = (email = "") => EMAIL_PATTERN.test(email.trim());

export const isValidVerificationCode = (code = "") => VERIFICATION_CODE_PATTERN.test(code);

export const sanitizeVerificationCode = (value = "") => value.replace(/\D/g, "").slice(0, 6);

export const passwordRules = [
  { id: "length", label: "8 ký tự", test: (password) => password.length >= 8 },
  { id: "uppercase", label: "Chữ hoa", test: (password) => /[A-Z]/.test(password) },
  { id: "number", label: "Số", test: (password) => /[0-9]/.test(password) },
  { id: "special", label: "Ký tự đặc biệt", test: (password) => /[^A-Za-z0-9]/.test(password) },
];

export const getPasswordStrength = (password = "") => passwordRules.filter((rule) => rule.test(password)).length;

export const getPasswordStrengthMeta = (password = "") => {
  const strength = getPasswordStrength(password);
  const labels = ["Nhập mật khẩu", "Yếu", "Tạm ổn", "Tốt", "Mạnh"];
  const colors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  return {
    strength,
    label: labels[strength],
    colorClass: colors[strength],
    percent: (strength / passwordRules.length) * 100,
  };
};

export const isStrongPassword = (password = "") => getPasswordStrength(password) === passwordRules.length;

export const getLoginFieldError = ({ name, value, mode, verificationSent }) => {
  if (name === "email" && value && !isValidEmail(value)) return "Vui lòng nhập email hợp lệ";
  if (name === "password" && mode === AUTH_MODES.LOGIN && !value.trim()) return "Vui lòng nhập mật khẩu";
  if (name === "verificationCode" && verificationSent && value && !isValidVerificationCode(value)) {
    return "Mã xác thực gồm 6 số";
  }
  return "";
};

export const getRegisterFieldError = (name, value, formData) => {
  if (name === "email" && value && !isValidEmail(value)) return "Vui lòng nhập email hợp lệ";
  if (name === "password" && value && !isStrongPassword(value)) {
    return "Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt";
  }
  if (name === "confirmPassword" && value && value !== formData.password) return "Mật khẩu xác nhận không khớp";
  if (name === "fullName" && !value.trim()) return "Vui lòng nhập họ tên";
  if (name === "username" && !value.trim()) return "Vui lòng nhập tên tài khoản";
  if (name === "phone" && !value.trim()) return "Vui lòng nhập số điện thoại";
  return "";
};

export const isLoginFormReady = (formData, mode, verificationSent) => {
  if (mode === AUTH_MODES.LOGIN) return isValidEmail(formData.email) && formData.password.trim().length > 0;
  if (mode === AUTH_MODES.FORGOT) return isValidEmail(formData.email);
  if (verificationSent) return isValidEmail(formData.email) && isValidVerificationCode(formData.verificationCode);
  return isValidEmail(formData.email);
};

export const isRegisterFormReady = (formData, isEmailAvailable) => (
  isValidEmail(formData.email)
  && isStrongPassword(formData.password)
  && formData.password === formData.confirmPassword
  && Boolean(formData.fullName.trim())
  && Boolean(formData.username.trim())
  && Boolean(formData.phone.trim())
  && formData.termsAccepted
  && isEmailAvailable
);

export const getLoginCopy = (mode, verificationSent, isSubmitting) => {
  const title =
    mode === AUTH_MODES.LOGIN ? "Đăng nhập" : mode === AUTH_MODES.FORGOT ? "Quên mật khẩu" : "Xác thực email";
  const subtitle =
    mode === AUTH_MODES.LOGIN
      ? "Đăng nhập vào tài khoản của bạn"
      : mode === AUTH_MODES.FORGOT
      ? "Nhập email để đặt lại mật khẩu"
      : verificationSent
      ? "Nhập mã 6 số đã gửi tới email của bạn"
      : "Nhập email để nhận mã xác thực";
  const submitLabel = isSubmitting
    ? "Đang xử lý..."
    : mode === AUTH_MODES.LOGIN
    ? "Đăng nhập"
    : mode === AUTH_MODES.FORGOT
    ? "Gửi email"
    : verificationSent
    ? "Xác nhận mã"
    : "Gửi mã xác thực";
  const switchLabel =
    mode === AUTH_MODES.LOGIN
      ? "Chưa có tài khoản? Xác thực email để đăng ký"
      : mode === AUTH_MODES.FORGOT
      ? "Quay lại đăng nhập"
      : "Đã có tài khoản? Đăng nhập";

  return { title, subtitle, submitLabel, switchLabel };
};
