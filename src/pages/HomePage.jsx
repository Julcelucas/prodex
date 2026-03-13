
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { CheckCircle, Truck, Map, Shield, Clock, Users, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <Helmet>
        <title>PRODEX | Gestão Profissional de Pedidos</title>
        <meta name="description" content="Plataforma líder em gestão de pedidos e logística." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-green-700 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-sm mb-10">
            <img 
              src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
              alt="PRODEX Logo" 
              className="max-w-[150px] h-auto brightness-0 invert" 
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl drop-shadow-lg">
            Plataforma Profissional de Gestão de <span className="text-green-200">Pedidos</span>
          </h1>
          
          <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
            Escale as suas operações com a PRODEX. Controle total em tempo real, gestão inteligente de funcionários e processos otimizados numa única plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 h-14 rounded-full shadow-lg transition-transform hover:scale-105"
              onClick={() => navigate('/login')}
            >
              Acesso Funcionário <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white font-bold text-lg px-8 h-14 rounded-full"
              onClick={() => navigate('/admin/login')}
            >
              Acesso Administrador
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo o que precisa para crescer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Funcionalidades desenhadas para empresas modernas que procuram eficiência e controlo total sobre a sua frota.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Gestão de Pedidos <CheckCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-gray-600 leading-relaxed">Acompanhe todos os seus processos e atribua pedidos de forma inteligente para maximizar a produtividade diária.</p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Tracking Real-time <CheckCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-gray-600 leading-relaxed">Saiba exatamente onde estão os seus pedidos com atualizações de status ao segundo.</p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Gestão de Equipas <CheckCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-gray-600 leading-relaxed">Adicione funcionários facilmente com códigos de acesso únicos e monitorize a performance individual.</p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Alertas Inteligentes <CheckCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-gray-600 leading-relaxed">Sistema de alarmes automático para pedidos urgentes ou em risco de atraso, garantindo a satisfação do cliente.</p>
            </div>

            <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Dados Seguros <CheckCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-gray-600 leading-relaxed">Infraestrutura robusta com níveis de acesso baseados em funções (Administrador/Funcionário) para máxima segurança.</p>
            </div>

            <div className="group p-8 bg-primary rounded-2xl border border-primary text-white hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-3">Pronto para transformar a sua operação?</h3>
                <p className="text-primary-foreground/90 mb-6 leading-relaxed">Junte-se a centenas de empresas que já otimizaram os seus pedidos com a PRODEX.</p>
              </div>
              <Button 
                className="w-full bg-white text-primary hover:bg-gray-100 font-bold"
                onClick={() => navigate('/pricing')}
              >
                Criar Conta Grátis
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
