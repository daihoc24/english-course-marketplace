import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { confirmRegisterCode, forgotPassword, signIn, verifyRegister } from "../API/AuthService";
import { apiBaseUrl } from "../API/apiBaseUrl";
import { useProduct } from "../context/ProductContext";
import AuthFeedbackBox from "../features/auth/AuthFeedbackBox";
import AuthField from "../features/auth/AuthField";
import AuthPasswordField from "../features/auth/AuthPasswordField";
import {
  AUTH_MODES,
  getLoginCopy,
  getLoginFieldError,
  isLoginFormReady,
  normalizeEmail,
  sanitizeVerificationCode,
} from "../features/auth/authView";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const handleGoogleLogin = () => {
  window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
};

const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useProduct();
  const [authState, setAuthState] = useState(AUTH_MODES.LOGIN);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => getLoginFieldError({ name, value, mode: authState, verificationSent });

  const resetVerificationState = () => {
    setVerificationSent(false);
    setDemoCode("");
    setFormData((prev) => ({ ...prev, verificationCode: "" }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "verificationCode" ? sanitizeVerificationCode(value) : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFeedback(null);
    if (name === "email") resetVerificationState();
    setErrors((prev) => ({ ...prev, [name]: validateField(name, nextValue) }));
  };

  const switchMode = (nextMode) => {
    setAuthState(nextMode);
    setErrors({});
    setFeedback(null);
    resetVerificationState();
  };

  const handleLogin = async () => {
    const response = await signIn({
      email: normalizeEmail(formData.email),
      password: formData.password,
    });
    const { result } = response.data;
    localStorage.setItem("session", JSON.stringify(result));
    setSession(result);
    window.dispatchEvent(new Event("sessionUpdated"));

    const userRole = result.role?.toUpperCase();
    if (userRole === "ADMIN") navigate("/admin/dashboard");
    else if (userRole === "SELLER") navigate("/seller/dashboard");
    else navigate("/");
  };

  const handleForgotPassword = async () => {
    const response = await forgotPassword(normalizeEmail(formData.email));
    const { code, message } = response.data;
    if (code != null && code !== 0) {
      setFeedback({ type: "error", message: message || "Không thể gửi email đặt lại mật khẩu." });
      return;
    }
    setFeedback({ type: "success", message: message || "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư." });
  };

  const handleSendVerificationCode = async () => {
    const response = await verifyRegister(normalizeEmail(formData.email));
    const { code, message, result } = response.data;
    if (code != null && code !== 0) {
      setFeedback({ type: "error", message: message || "Không thể gửi mã xác thực." });
      return;
    }

    setVerificationSent(true);
    setDemoCode(result?.demoCode || "");
    setFeedback({
      type: "success",
      message: message || `Đã gửi mã xác thực. Mã có hiệu lực trong ${result?.expiresInMinutes || 10} phút.`,
    });
  };

  const handleConfirmCode = async () => {
    const response = await confirmRegisterCode(normalizeEmail(formData.email), formData.verificationCode.trim());
    const { code, message, result } = response.data;
    if (code != null && code !== 0) {
      setFeedback({ type: "error", message: message || "Mã xác thực không đúng hoặc đã hết hạn." });
      return;
    }

    const email = result?.email || normalizeEmail(formData.email);
    setFeedback({ type: "success", message: "Email đã xác thực. Đang chuyển sang bước tạo tài khoản..." });
    window.setTimeout(() => navigate(`/auth/register?email=${encodeURIComponent(email)}&verified=1`, { replace: true }), 500);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      verificationCode: validateField("verificationCode", formData.verificationCode),
    };
    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });
    setErrors(nextErrors);

    const formReady = isLoginFormReady(formData, authState, verificationSent);
    if (!formReady || Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (authState === AUTH_MODES.LOGIN) await handleLogin();
      else if (authState === AUTH_MODES.FORGOT) await handleForgotPassword();
      else if (verificationSent) await handleConfirmCode();
      else await handleSendVerificationCode();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      setFeedback({ type: "error", message });
      console.error("Auth request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formReady = isLoginFormReady(formData, authState, verificationSent);
  const copy = getLoginCopy(authState, verificationSent, isSubmitting);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={authState}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">{copy.title}</h2>
          <p className="text-sm font-semibold text-slate-600">{copy.subtitle}</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <AuthField
            type="email"
            name="email"
            label="Email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={verificationSent}
            error={errors.email}
          />

          {authState === AUTH_MODES.LOGIN && (
            <>
              <AuthPasswordField
                name="password"
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                error={errors.password}
                visible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode(AUTH_MODES.FORGOT)}
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-500"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </>
          )}

          {authState === AUTH_MODES.VERIFY_EMAIL && verificationSent && (
            <div>
              <AuthField
                type="text"
                inputMode="numeric"
                name="verificationCode"
                label="Mã xác thực"
                placeholder="Nhập mã 6 số"
                value={formData.verificationCode}
                onChange={handleInputChange}
                error={errors.verificationCode}
                inputClassName="text-center text-2xl font-bold tracking-[0.35em]"
              />
              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSubmitting}
                  className="font-medium text-blue-600 transition hover:text-blue-500 disabled:text-slate-400"
                >
                  Gửi lại mã
                </button>
                <button type="button" onClick={resetVerificationState} className="font-medium text-slate-600 transition hover:text-slate-800">
                  Đổi email
                </button>
              </div>
            </div>
          )}

          <AuthFeedbackBox feedback={feedback}>
            {demoCode && (
              <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-lg font-bold tracking-[0.25em] text-emerald-700">
                {demoCode}
              </p>
            )}
          </AuthFeedbackBox>

          <button
            type="submit"
            disabled={!formReady || isSubmitting}
            className={`flex w-full justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              formReady && !isSubmitting ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-slate-400"
            }`}
          >
            {copy.submitLabel}
          </button>

          {authState === AUTH_MODES.LOGIN && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <FcGoogle className="h-5 w-5" />
                <span className="ml-2">Google</span>
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => switchMode(authState === AUTH_MODES.LOGIN ? AUTH_MODES.VERIFY_EMAIL : AUTH_MODES.LOGIN)}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-500"
          >
            {copy.switchLabel}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;
