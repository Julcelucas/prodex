
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { pt } from '@/lib/translations';

const PricingPage = () => {
  const navigate = useNavigate();

  const handleSubscribe = (plan) => {
    navigate(`/checkout?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1623295080944-9ba74d587748" alt="Logistics Pricing" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{pt.pricing.title}</h1>
          <p className="text-xl">{pt.pricing.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-gray-400">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-700">{pt.pricing.basic}</CardTitle>
              <div className="mt-4"><span className="text-4xl font-bold">€29</span><span className="text-gray-500">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Até 10 Funcionários</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> 500 Encomendas/mês</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Suporte Email</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubscribe('basic')} className="w-full" variant="outline">{pt.pricing.subscribe}</Button>
            </CardFooter>
          </Card>

          {/* Pro */}
          <Card className="shadow-xl transform scale-105 border-blue-500 border-2 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">Recomendado</div>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl text-blue-600">{pt.pricing.pro}</CardTitle>
              <div className="mt-4"><span className="text-4xl font-bold">€79</span><span className="text-gray-500">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Funcionários Ilimitados</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Encomendas Ilimitadas</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Alarmes e Notificações</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Suporte Prioritário 24/7</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubscribe('pro')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{pt.pricing.subscribe}</Button>
            </CardFooter>
          </Card>

          {/* Enterprise */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-purple-600">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-purple-700">{pt.pricing.enterprise}</CardTitle>
              <div className="mt-4"><span className="text-4xl font-bold">€199</span><span className="text-gray-500">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Tudo no plano Pro</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> API Access</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Gestor de Conta Dedicado</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubscribe('enterprise')} className="w-full" variant="outline">{pt.pricing.subscribe}</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default PricingPage;
