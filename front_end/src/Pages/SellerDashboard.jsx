import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SellerDashboardLayout from "../features/seller/SellerDashboardLayout";
import {
  getSellerDashboardPath,
  sellerDashboardTabIds,
} from "../features/seller/sellerDashboardNavigation";
import { SellerLoadingState } from "../features/seller/SellerStates";

const SellerCoursesTab = React.lazy(() => import("../features/seller/SellerCoursesTab"));
const SellerRevenueTab = React.lazy(() => import("../features/seller/SellerRevenueTab"));
const SellerWithdrawTab = React.lazy(() => import("../features/seller/SellerWithdrawTab"));
const SellerRefundTab = React.lazy(() => import("../features/seller/SellerRefundTab"));
const SellerQnaTab = React.lazy(() => import("../features/seller/SellerQnaTab"));
const SellerReports = React.lazy(() => import("./SellerReports"));

const renderSellerTab = (loadingText, tab) => (
  <React.Suspense fallback={<SellerLoadingState text={loadingText} />}>
    {tab}
  </React.Suspense>
);

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (sellerDashboardTabIds.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(getSellerDashboardPath(tabId), { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "courses":
        return renderSellerTab("Đang tải tab khóa học...", <SellerCoursesTab />);
      case "revenue":
        return renderSellerTab("Đang tải tab doanh thu...", <SellerRevenueTab />);
      case "withdraw":
        return renderSellerTab("Đang tải tab rút tiền...", <SellerWithdrawTab />);
      case "refund":
        return renderSellerTab("Đang tải tab hoàn tiền...", <SellerRefundTab />);
      case "reports":
        return renderSellerTab("Đang tải tab khiếu nại...", <SellerReports embedded />);
      case "qna":
        return renderSellerTab("Đang tải tab hỏi đáp...", <SellerQnaTab />);
      default:
        return renderSellerTab("Đang tải tab khóa học...", <SellerCoursesTab />);
    }
  };

  return (
    <SellerDashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </SellerDashboardLayout>
  );
};


export default SellerDashboard;
