import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ children, userType: requiredUserType }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // usuário não logado
  if (!currentUser) {
    if (requiredUserType === "admin") {
      return <Navigate to="/admin-login" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // usuário logado mas tipo errado
  if (requiredUserType && currentUser.user_type !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && currentUser.user_type !== requiredUserType) {
  return <Navigate to="/" replace />;
}

  return children;
};

export default ProtectedRoute;