
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { useAlarmSystem, getOrderPriority } from '@/hooks/useAlarmSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlarmIndicator from '@/components/AlarmIndicator';
import { Package, Users, Settings, BarChart2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const GestorDashboard = () => {
  const { currentUser, companyInfo } = useAuth();
  const { getOrders, getEmployees } = useSupabase();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const { alerts } = useAlarmSystem(orders);

  useEffect(() => {
    if (currentUser?.company_id) {
      setOrders(getOrders(currentUser.company_id));
      setEmployees(getEmployees(currentUser.company_id));
    }
  }, [currentUser, getOrders, getEmployees]);

  const getPriorityColor = (priority) => {
    if (priority === 'red') return 'bg-red-100 text-red-800 border-red-300';
    if (priority === 'yellow') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (priority === 'green') return 'bg-primary/10 text-primary border-primary/30';
    return 'bg-gray-100 text-gray-800';
  };

  if (!currentUser || !companyInfo) return <div className="flex-1 flex items-center justify-center">A carregar...</div>;

  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Gestão</h1>
            <p className="text-sm text-gray-500">Monitorização global da operação</p>
          </div>
          <AlarmIndicator activeAlarms={alerts} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-8 grid grid-cols-4 bg-white border rounded-xl h-auto p-1 shadow-sm">
            <TabsTrigger value="metrics" className="py-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
              <BarChart2 className="h-5 w-5 mr-2" /> Métricas
            </TabsTrigger>
            <TabsTrigger value="orders" className="py-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
              <Package className="h-5 w-5 mr-2" /> Encomendas
            </TabsTrigger>
            <TabsTrigger value="employees" className="py-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
              <Users className="h-5 w-5 mr-2" /> Motoristas
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-medium">
              <Settings className="h-5 w-5 mr-2" /> Definições
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total em Sistema</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-extrabold text-gray-900">{orders.length}</p></CardContent>
              </Card>
              <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Entregues</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-extrabold text-primary">{orders.filter(o => o.status === 'entregue').length}</p></CardContent>
              </Card>
              <Card className="shadow-sm border-red-200 bg-red-50">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600 uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Críticas / Atrasadas</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-extrabold text-red-600">{orders.filter(o => getOrderPriority(o.desired_delivery_time, o.status) === 'red').length}</p></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-white flex flex-row justify-between items-center border-b">
                <CardTitle>Todas as Encomendas</CardTitle>
                <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5"><Download className="h-4 w-4 mr-2"/> Exportar CSV</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                      <tr>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Cliente</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Prioridade</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Data Limite</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Motorista</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(o => {
                        const prio = getOrderPriority(o.desired_delivery_time, o.status);
                        const emp = employees.find(e => e.id === o.assigned_to);
                        return (
                          <tr key={o.id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{o.customer_name}</td>
                            <td className="px-6 py-4">
                              <Badge className={getPriorityColor(prio)}>{prio.toUpperCase()}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={o.status === 'entregue' ? 'bg-primary/10 text-primary border-primary/30' : ''}>
                                {o.status === 'entregue' && <CheckCircle className="h-3 w-3 mr-1 inline" />}
                                {pt.status[o.status] || o.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{new Date(o.desired_delivery_time).toLocaleString()}</td>
                            <td className="px-6 py-4">{emp ? <span className="font-medium text-gray-800">{emp.name}</span> : <span className="text-gray-400 italic">Por atribuir</span>}</td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-12 text-gray-500 bg-white">Sem encomendas no sistema.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
             <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex justify-between items-center">
                  <span>Equipa de Motoristas ({employees.length})</span>
                  <div className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md border">
                    Código de Convite: <strong className="text-primary font-mono tracking-wider ml-1">{companyInfo.company_code}</strong>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <ul className="divide-y divide-gray-100">
                   {employees.map(e => (
                     <li key={e.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors gap-4">
                       <div className="flex items-center gap-4">
                         <div className="bg-primary/10 p-3 rounded-full">
                           <Users className="h-6 w-6 text-primary" />
                         </div>
                         <div>
                           <p className="font-bold text-gray-900 text-lg">{e.name}</p>
                           <p className="text-sm text-gray-500">{e.email} <span className="mx-2">•</span> {e.phone}</p>
                         </div>
                       </div>
                       <Badge variant="secondary" className="bg-primary text-white hover:bg-primary/90 px-3 py-1 text-sm">
                         {orders.filter(o => o.assigned_to === e.id).length} Entregas Atribuídas
                       </Badge>
                     </li>
                   ))}
                   {employees.length === 0 && <p className="text-gray-500 p-8 text-center bg-white">Ainda não existem motoristas registados na sua frota.</p>}
                 </ul>
              </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="settings">
             <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-white"><CardTitle>Definições da Conta</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Plano de Assinatura PRODEX</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <Badge className={companyInfo.subscription_status === 'active' ? 'bg-primary text-white hover:bg-primary' : 'bg-red-500 text-white'}>
                      ESTADO: {companyInfo.subscription_status.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">Válido até: {new Date(companyInfo.subscription_end_date).toLocaleDateString()}</span>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="shadow-sm">Gerir Assinatura</Button>
                </div>
              </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default GestorDashboard;
