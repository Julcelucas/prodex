
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from 'lucide-react';

const GestorOverview = ({ orders, employees }) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Recebida').length;
  const processingOrders = orders.filter(o => o.status === 'Em Processamento').length;
  const completedOrders = orders.filter(o => o.status === 'Completa').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const unassignedOrders = orders.filter(o => !o.employee).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-blue-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Mês</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalOrders}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Em Processamento</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{processingOrders}</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-full text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completas</p>
              <h3 className="text-3xl font-extrabold text-green-600 mt-1">{completedOrders}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-purple-100 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Taxa Conclusão</p>
              <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{completionRate}%</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="font-medium text-red-800">Encomendas Não Atribuídas</span>
                <Badge variant="destructive" className="text-sm">{unassignedOrders}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="font-medium text-orange-800">Encomendas Urgentes (Pendentes)</span>
                <Badge className="bg-orange-500 text-white text-sm">
                  {orders.filter(o => o.priority === 'High' && o.status === 'Recebida').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Resumo da Equipa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="font-medium text-blue-800">Total Funcionários Ativos</span>
                <span className="font-bold text-blue-900 text-lg">{employees?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-700">Média Encomendas / Funcionário</span>
                <span className="font-bold text-gray-900 text-lg">
                  {employees?.length ? Math.round(totalOrders / employees.length) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestorOverview;
