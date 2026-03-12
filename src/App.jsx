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

// Auth
import GestorRegister from './pages/auth/GestorRegister';
import FuncionarioRegister from './pages/auth/FuncionarioRegister';
import Login from './pages/auth/Login';
import AdminLogin from './pages/admin/AdminLogin';

// Dashboards
import GestorDashboard from './pages/dashboard/GestorDashboard';
import FuncionarioDashboard from './pages/dashboard/FuncionarioDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Orders
import CreateOrder from './pages/customer/CreateOrder'; // ✅ IMPORTANTE

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />

        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Register */}
          <Route path="/gestor-register" element={<GestorRegister />} />
          <Route path="/funcionario-register" element={<FuncionarioRegister />} />

          {/* ========================= */}
          {/* DASHBOARDS PROTEGIDOS */}
          {/* ========================= */}

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

          {/* ========================= */}
          {/* CRIAR PEDIDO */}
          {/* ========================= */}

          <Route
            path="/create-order"
            element={
              <ProtectedRoute userType="gestor">
                <CreateOrder />
              </ProtectedRoute>
            }
          />

          {/* ========================= */}
          {/* 404 */}
          {/* ========================= */}

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                  <a
                    href="/"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
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