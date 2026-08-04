import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../API/AuthService";
import { loadSwal } from "../shared/utils/alerts";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const SendEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = isValidEmail(email.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!valid || submitting) return;

    setSubmitting(true);
    const Swal = await loadSwal();
    try {
      await forgotPassword(email.trim());
      await Swal.fire("Đã gửi email", "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu.", "success");
      navigate("/auth/login");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Chưa gửi được email",
        text: error?.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Quên mật khẩu</h2>
        <p className="mt-2 text-sm text-gray-600">Nhập email để nhận liên kết đặt lại mật khẩu.</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!valid || submitting}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate("/auth/login")}
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </>
  );
};

export default SendEmail;
