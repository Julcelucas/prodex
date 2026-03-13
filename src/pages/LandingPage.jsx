
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { pt } from '@/lib/translations';
import { Package, Users, BellRing, BarChart3, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-green-700">
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-12 flex flex-col items-center">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-sm">
              <img 
                src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
                alt="PRODEX Logo - Solução de Pedidos" 
                className="max-w-[150px] h-auto brightness-0 invert" 
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            PRODEX - Solução Completa para Gestão de <span className="text-green-200">Pedidos</span>
          </h1>
          
          <h2 className="text-lg md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto font-medium drop-shadow-sm">
            {pt.landing.subtitle}
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-primary font-bold h-14 px-8 text-lg rounded-full shadow-lg transition-transform hover:scale-105" onClick={() => navigate('/login')}>
              Acesso Funcionário <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white h-14 px-8 text-lg rounded-full font-bold" onClick={() => navigate('/admin/login')}>
              Acesso Administrador
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo o que precisa num só lugar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Plataforma robusta desenhada para as necessidades específicas do mercado.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{pt.landing.features.orders}</h3>
              <p className="text-gray-600 leading-relaxed">Controle todo o ciclo de vida dos seus pedidos desde a criação até à conclusão final.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{pt.landing.features.employees}</h3>
              <p className="text-gray-600 leading-relaxed">Atribua tarefas rapidamente e monitorize a performance individual de cada funcionário.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BellRing className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{pt.landing.features.alerts}</h3>
              <p className="text-gray-600 leading-relaxed">Receba notificações sonoras para pedidos urgentes ou em risco de atraso.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{pt.landing.features.reports}</h3>
              <p className="text-gray-600 leading-relaxed">Exporte dados em CSV/PDF e analise as métricas vitais da sua operação logística.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 text-lg">
              Conheça as nossas opções e escolha a melhor para a sua empresa na página de <Link to="/pricing" className="text-primary font-bold hover:underline">Planos de Preços</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
