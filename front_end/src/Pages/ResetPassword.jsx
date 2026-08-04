import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../API/AuthService";

const validatePassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Thiếu token. Mở lại liên kết trong email.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Mật khẩu ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      const { code, message } = res.data;
      if (code != null && code !== 0) {
        setError(message || "Không đổi được mật khẩu.");
        return;
      }
      alert(message || "Đã đặt lại mật khẩu. Vui lòng đăng nhập.");
      navigate("/auth/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Đang xử lý…" : "Cập nhật mật khẩu"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button type="button" onClick={() => navigate("/auth/login")} className="text-sm text-blue-600">
          Về đăng nhập
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
