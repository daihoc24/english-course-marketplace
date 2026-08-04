import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthField from "./AuthField";

const AuthPasswordField = ({ visible, onToggle, ...props }) => (
  <AuthField
    type={visible ? "text" : "password"}
    trailing={
      <button
        type="button"
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        onClick={onToggle}
      >
        {visible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
      </button>
    }
    {...props}
  />
);

export default AuthPasswordField;
