
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, AlertCircle, ShieldCheck, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DashboardOverview = ({ deliveries = [], employees = [] }) => {
  const { companyInfo, currentUser } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Memoize calculations to prevent heavy re-renders every 30 seconds when 'time' updates
  const stats = useMemo(() => {
    const totalDeliveries = deliveries.length;
    const delivered = deliveries.filter(d => d.status === 'Concluído' || d.status === 'Entregue').length;
    const overdue = deliveries.filter(d => {
      if (d.status === 'Concluído' || d.status === 'Entregue' || d.status === 'Cancelada' || d.status === 'Cancelado') return false;
      return new Date(d.expectedDate) < new Date();
    }).length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const completionRate = totalDeliveries > 0 ? Math.round((delivered / totalDeliveries) * 100) : 0;
    
    return { totalDeliveries, delivered, overdue, activeEmployees, completionRate };
  }, [deliveries, employees]);

  return (
    <div className="space-y-6 mb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral da Operação</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" /> Atualizado em: {time.toLocaleTimeString('pt-AO')}
          </p>
        </div>
        {companyInfo && (
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">ID da Empresa:</span>
            <Badge variant="secondary" className="font-mono tracking-wider bg-gray-100 text-gray-800 border-gray-300">
              {currentUser?.company_id}
            </Badge>
            <Badge className={companyInfo.subscription_status === 'active' ? 'bg-primary text-white hover:bg-primary/80' : 'bg-red-500'}>
              {companyInfo.subscription_plan?.toUpperCase() || 'BÁSICO'}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-500 uppercase">Total de Pedidos</p>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-gray-900">{stats.totalDeliveries}</p>
              <span className="text-xs text-primary font-medium flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Mês Atual</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-500 uppercase">Concluídos</p>
              <div className="p-2 bg-green-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-green-600">{stats.delivered}</p>
              <span className="text-sm text-gray-500 font-medium">({stats.completionRate}%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-500 uppercase">Em Atraso / Críticos</p>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-red-600">{stats.overdue}</p>
              {stats.overdue > 0 && <Badge variant="destructive" className="animate-pulse">Ação Requerida</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-500 uppercase">Funcionários Ativos</p>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-gray-900">{stats.activeEmployees}</p>
              <span className="text-xs text-gray-500 font-medium">de {employees.length} total</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
