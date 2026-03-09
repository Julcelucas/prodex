
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
import { Package, Users, Settings, BarChart2, LogOut, Download, AlertTriangle } from 'lucide-react';
import { pt } from '@/lib/translations';

const GestorDashboard = () => {
  const { currentUser, companyInfo, logout } = useAuth();
  const { getOrders, getEmployees } = useSupabase();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const { activeAlarms, isMuted, toggleMute } = useAlarmSystem(orders);

  useEffect(() => {
    if (currentUser?.company_id) {
      const fetchData = async () => {
        const ordersData = await getOrders(currentUser.company_id);
        setOrders(ordersData);

        const employeesData = await getEmployees(currentUser.company_id);
        setEmployees(employeesData);
      };
      fetchData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPriorityColor = (priority) => {
    if (priority === 'red') return 'bg-red-100 text-red-800 border-red-300';
    if (priority === 'yellow') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (priority === 'green') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800';
  };

  if (!currentUser || !companyInfo) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">{companyInfo.name}</h1>
            <Badge variant={companyInfo.subscription_status === 'active' ? 'default' : 'secondary'}>
              {companyInfo.subscription_status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <AlarmIndicator activeAlarms={activeAlarms} isMuted={isMuted} toggleMute={toggleMute} />
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />{pt.common.logout}</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-8 grid grid-cols-4 bg-white border rounded-lg h-auto p-1 shadow-sm">
            <TabsTrigger value="metrics" className="py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <BarChart2 className="h-5 w-5 mr-2" /> {pt.dashboard.metrics}
            </TabsTrigger>
            <TabsTrigger value="orders" className="py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Package className="h-5 w-5 mr-2" /> {pt.dashboard.orders}
            </TabsTrigger>
            <TabsTrigger value="employees" className="py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Users className="h-5 w-5 mr-2" /> {pt.dashboard.employees}
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Settings className="h-5 w-5 mr-2" /> {pt.dashboard.settings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg text-gray-600">{pt.dashboard.totalOrders}</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-gray-900">{orders.length}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg text-gray-600">Entregues</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-green-600">{orders.filter(o => o.status === 'entregue').length}</p></CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader><CardTitle className="text-lg text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> Atrasadas / Críticas</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-red-600">{orders.filter(o => getOrderPriority(o.desired_delivery_time, o.status) === 'red').length}</p></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{pt.dashboard.allOrders}</CardTitle>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2"/> {pt.dashboard.exportCsv}</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 border-b">
                      <tr>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Prioridade</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Data Desejada</th>
                        <th className="px-4 py-3">Funcionário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const prio = getOrderPriority(o.desired_delivery_time, o.status);
                        const emp = employees.find(e => e.id === o.assigned_to);
                        return (
                          <tr key={o.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{o.customer_name}</td>
                            <td className="px-4 py-3">
                              <Badge className={getPriorityColor(prio)}>{prio.toUpperCase()}</Badge>
                            </td>
                            <td className="px-4 py-3"><Badge variant="outline">{pt.status[o.status] || o.status}</Badge></td>
                            <td className="px-4 py-3">{new Date(o.desired_delivery_time).toLocaleString()}</td>
                            <td className="px-4 py-3">{emp ? emp.name : <span className="text-gray-400">Não atribuído</span>}</td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">Sem encomendas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
             <Card>
              <CardHeader>
                <CardTitle>Equipa ({employees.length})</CardTitle>
                <p className="text-sm text-gray-500">Código de convite: <strong className="text-black bg-gray-100 px-2 py-1 rounded">{companyInfo.company_code}</strong></p>
              </CardHeader>
              <CardContent>
                 <ul className="divide-y">
                   {employees.map(e => (
                     <li key={e.id} className="py-4 flex justify-between items-center">
                       <div>
                         <p className="font-semibold">{e.name}</p>
                         <p className="text-sm text-gray-500">{e.email} | {e.phone}</p>
                       </div>
                       <Badge variant="secondary">{orders.filter(o => o.assigned_to === e.id).length} Entregas</Badge>
                     </li>
                   ))}
                   {employees.length === 0 && <p className="text-gray-500 py-4">Sem funcionários registados.</p>}
                 </ul>
              </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="settings">
             <Card>
              <CardHeader><CardTitle>{pt.dashboard.companySettings}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Plano de Assinatura</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={companyInfo.subscription_status === 'active' ? 'default' : 'destructive'}>{companyInfo.subscription_status}</Badge>
                    <span className="text-sm text-gray-500">Válido até: {new Date(companyInfo.subscription_end_date).toLocaleDateString()}</span>
                  </div>
                  <Button className="mt-4" onClick={() => navigate('/pricing')} variant="outline">Atualizar Plano</Button>
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
