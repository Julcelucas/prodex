import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import GestorRegister from './pages/auth/GestorRegister';
import FuncionarioRegister from './pages/auth/FuncionarioRegister';
import Login from './pages/auth/Login';
import AdminLogin from './pages/admin/AdminLogin';
import GestorDashboard from './pages/dashboard/GestorDashboard';
import FuncionarioDashboard from './pages/dashboard/FuncionarioDashboard';
import AdminDashboard from './pages/admin/AdminDashboard'; // ✅ CORRIGIDO

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Login Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/gestor-register" element={<GestorRegister />} />
          <Route path="/funcionario-register" element={<FuncionarioRegister />} />

          {/* Protected Dashboards */}
          <Route
            path="/gestor-dashboard"
            element={
              <ProtectedRoute userType="gestor">
                <GestorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/funcionario-dashboard"
            element={
              <ProtectedRoute userType="funcionario">
                <FuncionarioDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch All - 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                  <a href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Voltar ao Início
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;