import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children, userType: requiredUserType }) => {
  const { currentUser, userType, loading } = useAuth();

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

  if (!currentUser) {
    // Redirect to appropriate login page based on required user type
    if (requiredUserType === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/customer/login" replace />;
  }

  if (userType !== requiredUserType) {
    // User is logged in but doesn't have the required user type
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;