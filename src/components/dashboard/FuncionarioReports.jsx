
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FuncionarioReports = ({ myOrders }) => {
  const completedOrders = myOrders.filter(o => o.status === 'Completa');
  const completionRate = myOrders.length > 0 ? Math.round((completedOrders.length / myOrders.length) * 100) : 0;

  // Mock data for trends (since we don't have deep historical data in the sample dataset)
  const chartData = [
    { name: 'Seg', valor: 4 },
    { name: 'Ter', valor: 6 },
    { name: 'Qua', valor: 5 },
    { name: 'Qui', valor: 8 },
    { name: 'Sex', valor: completedOrders.length }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Classificação</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className={`text-5xl font-black ${completionRate >= 80 ? 'text-green-500' : completionRate >= 50 ? 'text-amber-500' : 'text-red-500'} mb-2`}>
              {completionRate >= 80 ? 'A' : completionRate >= 50 ? 'B' : 'C'}
            </div>
            <p className="text-sm text-gray-500 text-center">Sua performance está {completionRate >= 80 ? 'excelente' : 'na média'}. Continue o bom trabalho!</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas Vitais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Taxa de Conclusão</span>
              <span className="font-bold text-gray-900">{completionRate}%</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Total Processado</span>
              <span className="font-bold text-gray-900">{completedOrders.length} un.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tempo Médio (est.)</span>
              <span className="font-bold text-gray-900">1.5 hrs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="md:col-span-2 border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Processamento Semanal</CardTitle>
          <CardDescription>Volume de encomendas completadas por dia</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuncionarioReports;
