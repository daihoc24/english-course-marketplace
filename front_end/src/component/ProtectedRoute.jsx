import React from "react";
import { Navigate } from "react-router-dom";
import { readStoredSession, normalizeSession, getSessionRole, normalizeRoleName } from "../utils/session";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const session = normalizeSession(readStoredSession()) || {};
  const userRole = getSessionRole(session);
  const normalizedAllowedRoles = allowedRoles?.map(normalizeRoleName);

  if (!session.token || !userRole) {
    return <Navigate to="/auth/login" replace />;
  }

  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    switch (userRole) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "SELLER":
        return <Navigate to="/seller/dashboard" replace />;
      case "USER":
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
