
import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { pt, formatCurrency } from '@/lib/translations';
import PaymentSystem from '@/components/PaymentSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePageSEO, StructuredData } from '@/hooks/useSEO';
import { seoConfig } from '@/lib/seoConfig';

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, registerManager, currentUser, companyInfo } = useAuth();
  const { toast } = useToast();
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const pendingManagerRegistration = location.state?.pendingManagerRegistration || null;
  const checkoutDefaults = useMemo(() => ({
    email: pendingManagerRegistration?.email || location.state?.registeredEmail || '',
    password: pendingManagerRegistration?.password || '',
  }), [location.state, pendingManagerRegistration]);
  const shouldRequestCredentials = !currentUser && !pendingManagerRegistration;

  // Implement SEO
  usePageSEO({
    title: seoConfig.pages.pricing.title,
    description: seoConfig.pages.pricing.description,
    keywords: seoConfig.pages.pricing.keywords,
    ogImage: seoConfig.OG_IMAGE,
    ogUrl: `${seoConfig.SITE_URL}/pricing`,
    ogType: 'website'
  });

  const plans = [
    {
      id: 'basic',
      name: pt.pricing?.plans?.basic || 'Básico',
      price: 15000,
      desc: 'Para pequenas empresas',
      features: ['Até 5 Funcionários', '100 Pedidos/mês', 'Suporte por Email']
    },
    {
      id: 'pro',
      name: pt.pricing?.plans?.pro || 'Profissional',
      price: 35000,
      desc: 'Para empresas em crescimento',
      features: ['Até 20 Funcionários', '500 Pedidos/mês', 'Alertas Sonoros', 'Suporte Prioritário'],
      highlight: true
    },
    {
      id: 'enterprise',
      name: pt.pricing?.plans?.enterprise || 'Empresarial',
      price: 85000,
      desc: 'Para grandes operações',
      features: ['Funcionários Ilimitados', 'Pedidos Ilimitados', 'Relatórios Avançados', 'Administrador de Conta'],
    }
  ];

  // Product/Service Schema
  const pricingSchemas = plans.map(plan => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Plano ${plan.name} - PRODEX`,
    "description": plan.desc,
    "offers": {
      "@type": "Offer",
      "price": plan.price,
      "priceCurrency": "AOA",
      "availability": "https://schema.org/InStock"
    }
  }));

  if (checkoutPlan) {
    return (
      <div className="flex-1 bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Finalizar Subscrição</h1>
          <p className="text-gray-600">Conclua esta etapa para ativar a sua conta e aceder ao painel de gestão.</p>
        </div>
        <PaymentSystem 
          planId={checkoutPlan.name} 
          amount={checkoutPlan.price}
          defaultEmail={checkoutDefaults.email}
          defaultPassword={checkoutDefaults.password}
          requireCredentials={shouldRequestCredentials}
          onSuccess={async ({ email, password }) => {
            if (!currentUser && !pendingManagerRegistration) {
              console.error('[PricingPage:onSuccess] Missing registration context on pricing checkout', {
                currentUser,
                hasPendingManagerRegistration: Boolean(pendingManagerRegistration),
              });
              toast({
                title: 'Sessão de registo expirada',
                description: 'Volte ao registo de administrador para concluir a criação da conta.',
                variant: 'destructive',
              });
              navigate('/gestor-register', { replace: true });
              return { success: false };
            }

            let authEmail = email;
            let authPassword = password;
            let managerRegisteredNow = false;

            if (pendingManagerRegistration) {
              const registrationResult = await registerManager(
                pendingManagerRegistration.email,
                pendingManagerRegistration.password,
                pendingManagerRegistration.name,
                pendingManagerRegistration.phone,
                pendingManagerRegistration.companyName,
              );

              if (!registrationResult.success) {
                console.error('[PricingPage:onSuccess] Manager registration failed during payment', {
                  error: registrationResult.error,
                  pendingManagerRegistration: {
                    companyName: pendingManagerRegistration.companyName,
                    email: pendingManagerRegistration.email,
                    name: pendingManagerRegistration.name,
                    phone: pendingManagerRegistration.phone,
                  },
                });
                toast({
                  title: 'Falha ao guardar no Supabase',
                  description: registrationResult.error || 'O registo do administrador não foi enviado ao Supabase.',
                  variant: 'destructive',
                });
                return { success: false };
              }

              console.info('[PricingPage:onSuccess] Manager registration completed', {
                companyId: registrationResult.companyId,
                email: pendingManagerRegistration.email,
              });
              managerRegisteredNow = true;
              authEmail = pendingManagerRegistration.email;
              authPassword = pendingManagerRegistration.password;
            }

            if (managerRegisteredNow) {
              toast({
                title: 'Registo concluído',
                description: 'Conta de administrador criada com sucesso.',
              });
              navigate('/empresa/dashboard');
              return { success: true };
            }

            if (currentUser?.user_type === 'gestor') {
              toast({
                title: 'Registo concluído',
                description: 'Conta criada com sucesso.',
              });
              navigate('/empresa/dashboard');
              return { success: true };
            }

            const result = await login(authEmail, authPassword, 'gestor');
            if (result.success) {
              toast({
                title: 'Registo e Login concluídos',
                description: 'Bem-vindo ao painel de administrador!',
              });
              navigate('/empresa/dashboard');
              return { success: true };
            }

            toast({
              title: 'Falha após registo',
              description: result.error || 'Os dados foram enviados, mas o login não foi concluído.',
              variant: 'destructive',
            });
            console.error('[PricingPage:onSuccess] Login after payment failed', {
              email: authEmail,
              error: result.error,
            });
            return { success: false };
          }}
          onCancel={() => setCheckoutPlan(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-20 px-4">
      {pricingSchemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planos de Preços Flexíveis</h1>
          <h2 className="text-xl text-gray-600">{pt.pricing?.subtitle || 'Escolha o plano ideal para o seu negócio'}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(plan => (
            <Card key={plan.id} className={`flex flex-col relative rounded-2xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.highlight ? 'border-2 border-primary shadow-xl scale-105 z-10' : 'border border-gray-200'}`}>
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  Mais Popular
                </div>
              )}
              <CardHeader className="text-center pb-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">{plan.name}</h3>
                <CardDescription>{plan.desc}</CardDescription>
                <div className="mt-6 flex justify-center items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-500 ml-1">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full h-12 text-lg font-bold rounded-xl ${plan.highlight ? 'bg-primary hover:bg-primary/90' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  onClick={() => {
                    if (!currentUser && !pendingManagerRegistration) {
                      toast({
                        title: 'Inicie o registo primeiro',
                        description: 'Preencha o registo de administrador antes de continuar para o checkout.',
                        variant: 'destructive',
                      });
                      navigate('/gestor-register');
                      return;
                    }

                    setCheckoutPlan(plan);
                  }}
                  aria-label={`Selecionar Plano ${plan.name}`}
                >
                  {pt.pricing?.selectPlan || 'Selecionar Plano'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/" className="text-primary hover:underline font-medium">
            &larr; Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
