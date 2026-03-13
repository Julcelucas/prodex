
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { currentUser, companyInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    if (currentUser.user_type === 'gestor') return '/empresa/dashboard';
    if (currentUser.user_type === 'funcionario') return '/funcionario/dashboard';
    return '/';
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
          <img 
            src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
            alt="PRODEX Logo" 
            className="h-8 w-auto brightness-0 invert" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <Link to="/" className="text-sm font-semibold hover:text-green-200 transition-colors uppercase tracking-tight">Início</Link>
          <Link to="/pricing" className="text-sm font-semibold hover:text-green-200 transition-colors uppercase tracking-tight">Preços</Link>
          
          {currentUser ? (
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/20">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold leading-none opacity-80 uppercase mb-1">Logado como</span>
                <span className="text-sm font-bold leading-tight flex items-center justify-end gap-1 text-white">
                  {currentUser.name}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary transition-all font-bold text-xs uppercase"
                onClick={() => navigate(getDashboardPath())}
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Painel
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="h-9 w-9 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-6">
              <Button 
                variant="ghost" 
                className="text-sm font-bold text-white hover:bg-white/10 hover:text-white uppercase" 
                onClick={() => navigate('/admin/login')}
              >
                Acesso Administrador
              </Button>
              <Button 
                className="bg-white text-primary hover:bg-green-50 font-bold text-sm px-6 shadow-sm uppercase tracking-tight" 
                onClick={() => navigate('/pricing')}
              >
                Registar Agora
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors text-white" 
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white text-gray-900 border-t border-gray-100 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="px-6 py-6 flex flex-col gap-5">
            <Link to="/" className="text-lg font-bold hover:text-primary" onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link to="/pricing" className="text-lg font-bold hover:text-primary" onClick={() => setIsMenuOpen(false)}>Preços</Link>
            
            <div className="h-px bg-gray-100 my-1"></div>
            
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{companyInfo?.name || 'PRODEX Business'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    className="w-full font-bold border-red-100 text-red-600 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </Button>
                  <Button 
                    className="w-full font-bold bg-primary hover:bg-primary/90 text-white" 
                    onClick={() => {
                      navigate(getDashboardPath());
                      setIsMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Painel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full font-bold py-6 text-primary border-primary/20 hover:bg-green-50" 
                  onClick={() => { navigate('/admin/login'); setIsMenuOpen(false); }}
                >
                  Acesso Administrador
                </Button>
                <Button 
                  className="w-full font-bold py-6 shadow-md bg-primary hover:bg-primary/90 text-white" 
                  onClick={() => { navigate('/pricing'); setIsMenuOpen(false); }}
                >
                  Criar Conta Grátis
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
