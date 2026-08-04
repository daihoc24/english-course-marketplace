import { FaBook, FaChartLine, FaUndo, FaWallet } from "react-icons/fa";
import { FiAlertCircle, FiMessageSquare, FiUser } from "react-icons/fi";

export const sellerTabs = [
  { id: "courses", label: "Quản lý khóa học", icon: <FaBook /> },
  { id: "qna", label: "Hỏi đáp", icon: <FiMessageSquare /> },
  { id: "revenue", label: "Doanh thu", icon: <FaChartLine /> },
  { id: "withdraw", label: "Rút tiền", icon: <FaWallet /> },
  { id: "refund", label: "Hoàn tiền", icon: <FaUndo /> },
  { id: "reports", label: "Khiếu nại", icon: <FiAlertCircle /> },
];

export const sellerDashboardTabIds = sellerTabs.map((tab) => tab.id);

export const sellerTabGroups = [
  { title: "Nội dung", ids: ["courses", "qna"] },
  { title: "Tài chính", ids: ["revenue", "withdraw"] },
  { title: "Sau bán", ids: ["refund", "reports"] },
].map((group) => ({
  ...group,
  items: group.ids.map((id) => sellerTabs.find((tab) => tab.id === id)).filter(Boolean),
}));

export const sellerAccountLinks = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: <FiUser />, path: "/user-info" },
];

export const getSellerDashboardPath = (tabId) =>
  tabId === "courses" ? "/seller/dashboard" : `/seller/dashboard?tab=${tabId}`;
