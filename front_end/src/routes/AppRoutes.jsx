import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "../component/ProtectedRoute";
import OAuth2Callback from "../component/OAuth2Callback";

const Home = React.lazy(() => import("../Pages/HomePage"));
const Store = React.lazy(() => import("../Pages/Store"));
const NotFound = React.lazy(() => import("../Pages/NotFound"));
const AuthPage = React.lazy(() => import("../Pages/Authentication"));
const Detail = React.lazy(() => import("../Pages/Detail"));
const UserInfo = React.lazy(() => import("../Pages/UserInfo"));
const CourseVideo = React.lazy(() => import("../Pages/CourseVideo"));
const SellerDashboard = React.lazy(() => import("../Pages/SellerDashboard"));
const SellerWalletTopUp = React.lazy(() => import("../Pages/SellerWalletTopUp"));
const CourseForm = React.lazy(() => import("../Pages/CourseForm"));
const Favorite = React.lazy(() => import("../Pages/Favorite"));
const Checkout = React.lazy(() => import("../Pages/Checkout"));
const Login = React.lazy(() => import("../Pages/Login"));
const Register = React.lazy(() => import("../Pages/Register"));
const SellerDetail = React.lazy(() => import("../Pages/SellerDetail"));
const Teachers = React.lazy(() => import("../Pages/Teachers"));
const OrderHistory = React.lazy(() => import("../Pages/Admin/OrderHistory"));
const UserHistory = React.lazy(() => import("../Pages/History"));
const MyReports = React.lazy(() => import("../Pages/MyReports"));
const MyRefunds = React.lazy(() => import("../Pages/MyRefunds"));
const Notifications = React.lazy(() => import("../Pages/Notifications"));

const Analytics = React.lazy(() => import("../Pages/Admin/AdminDashboard"));
const UserManagement = React.lazy(() => import("../Pages/Admin/UserManagement"));
const CourseAnalytics = React.lazy(() => import("../Pages/Admin/CourseAnalytics"));
const ComplaintManagement = React.lazy(() => import("../Pages/Admin/ComplaintManagement"));
const AdminCourseApproval = React.lazy(() => import("../Pages/Admin/AdminCourseApproval"));
const RefundManagement = React.lazy(() => import("../Pages/Admin/RefundManagement"));
const WithdrawalManagement = React.lazy(() => import("../Pages/Admin/WithdrawalManagement"));
const PaymentResult = React.lazy(() => import("../Pages/PaymentResult"));

const RouteFallback = () => (
  <div className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-4 text-slate-600">
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
      Đang tải trang...
    </div>
  </div>
);

const SellerReportsRedirect = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  searchParams.set("tab", "reports");
  return <Navigate to={`/seller/dashboard?${searchParams.toString()}`} replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Store />} />

        <Route path="/favorites" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><Favorite /></ProtectedRoute>} />

        <Route path="/payment" element={<Navigate to="/shop" replace />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/user-info" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><UserInfo /></ProtectedRoute>} />
        <Route path="/course-video/:id" element={<CourseVideo />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><UserHistory /></ProtectedRoute>} />
        <Route path="/UserHistory" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><UserHistory /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><MyReports /></ProtectedRoute>} />
        <Route path="/my-refunds" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><MyRefunds /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["USER", "SELLER", "ADMIN"]}><Notifications /></ProtectedRoute>} />

        <Route path="/teachers" element={<Teachers />} />
        <Route path="/seller/:id" element={<SellerDetail />} />

        <Route path="/auth/oauth2/callback" element={<OAuth2Callback />} />

        {/* Seller Routes - Only SELLER and ADMIN can access */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reports"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <SellerReportsRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/wallet/top-up"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <SellerWalletTopUp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/course/new"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <CourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/course/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["SELLER", "ADMIN"]}>
              <CourseForm />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Only ADMIN can access */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/UserManagement"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/CourseAnalytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CourseAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ComplaintManagement"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ComplaintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/course-approval"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCourseApproval />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/refunds" element={<ProtectedRoute allowedRoles={["ADMIN"]}><RefundManagement /></ProtectedRoute>} />
        <Route path="/admin/withdrawals" element={<ProtectedRoute allowedRoles={["ADMIN"]}><WithdrawalManagement /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["ADMIN"]}><OrderHistory /></ProtectedRoute>} />

        {/* Catch-all route for 404 Not Found */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
