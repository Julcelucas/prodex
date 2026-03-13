
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Memoize navigation state to prevent infinite re-renders in Navigate
  const navState = useMemo(() => ({ from: location }), [location]);
  
  const loginPath = useMemo(() => {
    if (role === 'admin') return '/site-admin/login';
    if (role === 'gestor') return '/admin/login';
    return '/login';
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 font-medium">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={loginPath} state={navState} replace />;
  }

  const hasRoleAccess = role === 'admin'
    ? currentUser.user_type === 'admin'
    : role === 'gestor'
      ? currentUser.user_type === 'gestor'
      : currentUser.user_type === role;

  if (role && !hasRoleAccess) {
    return <Navigate to="/" replace />;
  }

  if (!currentUser.company_id || !/^PRODEX-[A-Z0-9]{5}$/.test(currentUser.company_id)) {
    console.error("Unauthorized: Missing or invalid Company ID");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Bloqueado</h1>
          <p className="text-gray-600 mb-6">A sua conta não possui um identificador de empresa válido. Contacte o suporte.</p>
          <button onClick={() => window.location.href = '/'} className="bg-primary text-white px-4 py-2 rounded-md font-medium">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
