import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import SendEmail from "./SendEmail";
import ResetPassword from "./ResetPassword";
import EmailVerified from "./EmailVerified";

const AuthPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sendEmail" element={<SendEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verified" element={<EmailVerified />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
