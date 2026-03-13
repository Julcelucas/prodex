
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Clock, CheckCircle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const FuncionarioOverview = ({ myOrders = [] }) => {
  // Memoize all calculations to prevent re-renders when parent state changes unrelated to myOrders
  const stats = useMemo(() => {
    const total = myOrders.length;
    const received = myOrders.filter(o => o.status === 'Recebida').length;
    const processing = myOrders.filter(o => o.status === 'Em Processamento').length;
    const completed = myOrders.filter(o => o.status === 'Completa').length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Create a new array before sorting to avoid mutating the prop array
    const pendingOrders = myOrders.filter(o => o.status !== 'Completa');
    const nextOrder = pendingOrders.sort((a,b) => {
      if(a.priority === 'High' && b.priority !== 'High') return -1;
      if(a.priority !== 'High' && b.priority === 'High') return 1;
      return new Date(a.createdDate) - new Date(b.createdDate);
    })[0];

    return { total, received, processing, completed, completionRate, nextOrder };
  }, [myOrders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase">Total Atribuídas</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-extrabold text-primary">{stats.total}</span>
              <Package className="h-5 w-5 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase">Em Processamento</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-extrabold text-amber-600">{stats.processing}</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase">Concluídas</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-extrabold text-green-600">{stats.completed}</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase">Progresso</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-extrabold text-primary">{stats.completionRate}%</span>
              <Target className="h-5 w-5 text-primary/60" />
            </div>
            <Progress value={stats.completionRate} className="h-1.5 mt-3 bg-primary/10" indicatorColor="bg-primary" />
          </CardContent>
        </Card>
      </div>

      {stats.nextOrder && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white p-3 rounded-full">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary uppercase">Próxima Encomenda a Processar</h3>
                <p className="text-xl font-bold text-gray-900 mt-1">{stats.nextOrder.customerName} <span className="text-sm text-gray-500 font-normal ml-2">ID: {stats.nextOrder.id}</span></p>
                <p className="text-sm text-gray-600 mt-1">Tipo: {stats.nextOrder.type} • Prioridade: {stats.nextOrder.priority === 'High' ? 'Alta' : 'Normal'}</p>
              </div>
            </div>
            <div className="text-right">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.nextOrder.status === 'Recebida' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                Status: {stats.nextOrder.status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FuncionarioOverview;
