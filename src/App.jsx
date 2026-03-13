
import React from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';

// Layout Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import LandingPage from '@/pages/LandingPage';
import PricingPage from '@/pages/PricingPage';
import AdminLogin from '@/pages/auth/AdminLogin';
import EmployeeLogin from '@/pages/auth/EmployeeLogin';
import GestorRegister from '@/pages/auth/GestorRegister';
import FuncionarioRegister from '@/pages/auth/FuncionarioRegister';
import CompanyDashboard from '@/pages/dashboard/AdminDashboard';
import EmployeeDashboard from '@/pages/dashboard/EmployeeDashboard';
import SiteAdminLogin from '@/pages/admin/AdminLogin';
import SiteAdminDashboard from '@/pages/admin/AdminDashboard';

import { StructuredData } from '@/hooks/useSEO';
import { seoConfig } from '@/lib/seoConfig';
import ProtectedRoute from '@/components/ProtectedRoute';

// Global BreadcrumbList Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Página Inicial",
      "item": seoConfig.SITE_URL
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Preços",
      "item": `${seoConfig.SITE_URL}/pricing`
    }
  ]
};

// Global Organization Schema
const globalOrgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": seoConfig.COMPANY_NAME,
  "url": seoConfig.SITE_URL,
  "logo": seoConfig.OG_IMAGE,
  "sameAs": [
    seoConfig.SOCIAL_MEDIA.facebook,
    seoConfig.SOCIAL_MEDIA.instagram,
    seoConfig.SOCIAL_MEDIA.linkedin,
    seoConfig.SOCIAL_MEDIA.twitter
  ]
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <StructuredData data={breadcrumbSchema} />
        <StructuredData data={globalOrgSchema} />
        
        <div className="min-h-screen flex flex-col bg-background">
          <Routes>
            {/* The Dashboard handles its own header/footer layout now for full app immersion */}
            <Route
              path="/admin/dashboard"
              element={
                <Navigate to="/empresa/dashboard" replace />
              }
            />
            <Route
              path="/site-admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <SiteAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/site-admin/dashboard/*"
              element={
                <ProtectedRoute role="admin">
                  <SiteAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Navigate to="/empresa/dashboard" replace />
              }
            />
            <Route
              path="/empresa/dashboard"
              element={
                <ProtectedRoute role="gestor">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresa/dashboard/*"
              element={
                <ProtectedRoute role="gestor">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/gestor-dashboard" element={<Navigate to="/empresa/dashboard" replace />} />
            <Route path="/funcionario-dashboard" element={<Navigate to="/funcionario/dashboard" replace />} />
            
            <Route
              path="/funcionario/dashboard"
              element={
                <ProtectedRoute role="funcionario">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funcionario/dashboard/*"
              element={
                <ProtectedRoute role="funcionario">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Standard Pages Wrap with Header and Footer */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <main className="flex-1 flex flex-col w-full h-full">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/home" element={<LandingPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/site-admin/login" element={<SiteAdminLogin />} />
                      <Route path="/login" element={<EmployeeLogin />} />
                      <Route path="/gestor-register" element={<GestorRegister />} />
                      <Route path="/funcionario-register" element={<FuncionarioRegister />} />
                      <Route path="/employee/register" element={<FuncionarioRegister />} />

                      {/* Catch-all 404 Route */}
                      <Route
                        path="*"
                        element={
                          <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-[60vh]">
                            <div className="text-center">
                              <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
                              <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                              <a href="/" className="text-primary hover:underline font-bold bg-white px-6 py-3 rounded-md shadow-sm border border-gray-200">
                                Voltar ao Início
                              </a>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
