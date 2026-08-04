import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useQueryParam from "../utils/useQueryParam";

const EmailVerified = () => {
  const navigate = useNavigate();
  const email = useQueryParam("email") || "";
  const registerPath = `/auth/register?email=${encodeURIComponent(email)}&verified=1`;

  useEffect(() => {
    if (!email) return;

    const payload = {
      type: "EMAIL_VERIFIED",
      email,
      at: Date.now(),
    };

    try {
      localStorage.setItem("emailVerifiedPayload", JSON.stringify(payload));
      window.dispatchEvent(new StorageEvent("storage", { key: "emailVerifiedPayload", newValue: JSON.stringify(payload) }));
    } catch (error) {
      console.warn("Không thể lưu trạng thái xác thực email:", error);
    }

    let channel;
    try {
      channel = new BroadcastChannel("auth-flow");
      channel.postMessage(payload);
    } catch (_error) {
      channel = null;
    }

    return () => {
      if (channel) channel.close();
    };
  }, [email]);

  const continueRegister = () => {
    navigate(registerPath, { replace: true });
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900">Email đã xác thực</h2>
      <p className="mt-2 text-sm font-medium text-gray-600">
        {email ? `Bạn có thể tiếp tục đăng ký với ${email}.` : "Bạn có thể tiếp tục đăng ký tài khoản."}
      </p>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm text-blue-800">
        Nếu tab đăng ký cũ vẫn đang mở, hệ thống đã tự chuyển tab đó sang bước tạo tài khoản. Bạn có thể đóng tab này để đỡ rối.
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={continueRegister}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Tiếp tục đăng ký
        </button>
        <button
          type="button"
          onClick={closeTab}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Đóng tab này
        </button>
      </div>
    </div>
  );
};

export default EmailVerified;
