import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailExists, register } from "../API/AuthService";
import AuthFeedbackBox from "../features/auth/AuthFeedbackBox";
import AuthField from "../features/auth/AuthField";
import AuthPasswordField from "../features/auth/AuthPasswordField";
import PasswordStrength from "../features/auth/PasswordStrength";
import { getRegisterFieldError, isRegisterFormReady, isValidEmail, normalizeEmail } from "../features/auth/authView";
import useQueryParam from "../utils/useQueryParam";

const Register = () => {
  const verifiedEmail = useQueryParam("email");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
    phone: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const isEmailLocked = Boolean(verifiedEmail);

  useEffect(() => {
    if (!verifiedEmail) return;
    setFormData((prev) => ({ ...prev, email: normalizeEmail(verifiedEmail) }));
    setIsEmailAvailable(true);
    setErrors((prev) => ({ ...prev, email: "" }));
  }, [verifiedEmail]);

  const validateField = (name, value, nextForm = formData) => getRegisterFieldError(name, value, nextForm);

  const checkEmailAvailability = useCallback(
    async (email) => {
      if (isEmailLocked || !email || !isValidEmail(email)) return;
      setIsCheckingEmail(true);
      try {
        const response = await checkEmailExists(normalizeEmail(email));
        setIsEmailAvailable(!response.data.result);
      } catch (error) {
        console.error("Error checking email:", error);
        setIsEmailAvailable(false);
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [isEmailLocked],
  );

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    const nextForm = { ...formData, [name]: nextValue };

    setFormData(nextForm);
    setSubmitMessage(null);

    if (type !== "checkbox") {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue, nextForm),
        ...(name === "password" && nextForm.confirmPassword
          ? { confirmPassword: validateField("confirmPassword", nextForm.confirmPassword, nextForm) }
          : {}),
      }));
    }
  };

  useEffect(() => {
    if (isEmailLocked) return undefined;
    const timeoutId = window.setTimeout(() => {
      checkEmailAvailability(formData.email);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [checkEmailAvailability, formData.email, isEmailLocked]);

  const formReady = isRegisterFormReady(formData, isEmailAvailable) && !isCheckingEmail;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    ["fullName", "username", "phone", "email", "password", "confirmPassword"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) nextErrors[field] = error;
    });
    if (!formData.termsAccepted) nextErrors.termsAccepted = "Bạn cần đồng ý điều khoản sử dụng";
    setErrors(nextErrors);
    if (!formReady || Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await register({
        username: formData.username.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        email: normalizeEmail(formData.email),
        fullname: formData.fullName.trim(),
        active: 1,
      });
      const { code, message } = response.data;
      if (code != null && code !== 0) {
        setSubmitMessage({ type: "error", message: message || "Không thể tạo tài khoản." });
        return;
      }
      setSubmitMessage({ type: "success", message: "Tạo tài khoản thành công. Đang chuyển về đăng nhập..." });
      window.setTimeout(() => navigate("/auth/login"), 900);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Không thể tạo tài khoản.";
      setSubmitMessage({ type: "error", message });
      console.error("Register failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailError = errors.email || (!isEmailAvailable ? "Email này đã được đăng ký" : "");

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Tạo tài khoản</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          {verifiedEmail ? "Email của bạn đã được xác thực" : "Hoàn tất thông tin để bắt đầu học"}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <AuthField
          type="text"
          name="fullName"
          label="Họ và tên"
          value={formData.fullName}
          placeholder="Nhập họ và tên"
          onChange={handleInputChange}
          error={errors.fullName}
        />

        <AuthField
          type="text"
          name="username"
          label="Tên tài khoản"
          value={formData.username}
          placeholder="Nhập tên tài khoản"
          onChange={handleInputChange}
          error={errors.username}
        />

        <AuthField
          type="tel"
          name="phone"
          label="Số điện thoại"
          value={formData.phone}
          placeholder="Nhập số điện thoại"
          onChange={handleInputChange}
          error={errors.phone}
        />

        <AuthField
          type="email"
          name="email"
          label="Email"
          placeholder="Nhập email"
          value={formData.email}
          onChange={handleInputChange}
          readOnly={isEmailLocked}
          error={emailError}
          hint={isEmailLocked ? "Email đã xác thực, không cần nhập lại." : ""}
          trailing={
            isCheckingEmail ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-500" /> : null
          }
        />

        <div>
          <AuthPasswordField
            name="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            autoComplete="new-password"
            error={errors.password}
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <AuthPasswordField
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          placeholder="Nhập lại mật khẩu"
          onChange={handleInputChange}
          autoComplete="new-password"
          error={errors.confirmPassword}
          visible={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
        />

        <div>
          <label className="flex items-start gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Tôi đồng ý với điều khoản sử dụng</span>
          </label>
          {errors.termsAccepted && <p className="mt-1 text-sm text-rose-500">{errors.termsAccepted}</p>}
        </div>

        <AuthFeedbackBox feedback={submitMessage} />

        <button
          type="submit"
          disabled={!formReady || isSubmitting}
          className={`flex w-full justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            formReady && !isSubmitting ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-slate-400"
          }`}
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" onClick={() => navigate("/auth/login")} className="text-sm font-medium text-blue-600 transition hover:text-blue-500">
          Đã có tài khoản? Đăng nhập
        </button>
      </div>
    </>
  );
};

export default Register;
