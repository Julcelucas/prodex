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

import {
  Package,
  Users,
  Settings,
  BarChart2,
  LogOut,
  Download,
  AlertTriangle,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react';

import { pt } from '@/lib/translations';

const GestorDashboard = () => {

  const { currentUser, companyInfo, logout } = useAuth();

  const {
    getOrders,
    getEmployees,
    updateEmployee,
    deleteEmployee,
    updateCompany,
    assignEmployeeToOrder
  } = useSupabase();

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);

  const { activeAlarms, isMuted, toggleMute } = useAlarmSystem(orders);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingCompany, setEditingCompany] = useState(false);

  const [companyName, setCompanyName] = useState('');

  /* ---------------- LOAD DASHBOARD DATA ---------------- */

  const loadDashboardData = async () => {

    const companyId = currentUser?.company_id || companyInfo?.id;
    if (!companyId) return;

    try {
      // Busca TODOS os pedidos (não filtra por company_id)
      const allOrdersData = await getOrders(undefined);
      const employeesData = await getEmployees(companyId);

      console.log("TODOS os pedidos:", allOrdersData?.length || 0);
      console.log("Funcionários dessa empresa:", employeesData?.length || 0);

      // IDs dos funcionários dessa empresa
      const employeeIds = new Set((employeesData || []).map(e => e.id));
      
      // Filtra pedidos que têm assigned_to de um funcionário dessa empresa
      // OU pedidos que não têm ninguém atribuído (podem ser novos e sem empresa setada)
      const filteredOrders = (allOrdersData || []).filter(order => {
        return !order.assigned_to || employeeIds.has(order.assigned_to);
      });

      console.log("Pedidos filtrados para esse gestor:", filteredOrders.length);
      filteredOrders.forEach((order, i) => {
        console.log(`  Pedido ${i + 1}: assigned_to = ${order.assigned_to}`);
      });

      setOrders(filteredOrders);
      setEmployees(employeesData || []);

      if (companyInfo?.name) {
        setCompanyName(companyInfo.name);
      }
    } catch (err) {
      console.error("Erro carregando dados do dashboard:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser, companyInfo]);

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {

    logout();
    navigate('/');

  };

  /* ---------------- PRIORITY COLOR ---------------- */

  const getPriorityColor = (priority) => {

    if (priority === 'red') return 'bg-red-100 text-red-800 border-red-300';
    if (priority === 'yellow') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (priority === 'green') return 'bg-green-100 text-green-800 border-green-300';

    return 'bg-gray-100 text-gray-800';

  };

  /* ---------------- UPDATE COMPANY ---------------- */

  const handleUpdateCompany = async () => {

    await updateCompany(companyInfo.id, { name: companyName });

    setEditingCompany(false);

  };

  /* ---------------- UPDATE EMPLOYEE ---------------- */

  const handleUpdateEmployee = async () => {

    await updateEmployee(editingEmployee.id, editingEmployee);

    setEditingEmployee(null);

    loadDashboardData();

  };

  /* ---------------- DELETE EMPLOYEE ---------------- */

  const handleDeleteEmployee = async (id) => {

    if (!confirm("Remover funcionário?")) return;

    await deleteEmployee(id);

    loadDashboardData();

  };

  /* ---------------- ASSIGN EMPLOYEE ---------------- */

  const handleAssignEmployee = async (orderId, employeeId) => {

    await assignEmployeeToOrder(orderId, employeeId);

    loadDashboardData();

  };

  if (!currentUser || !companyInfo) return <div>Carregando...</div>;

  /* ---------------- METRICS ---------------- */

  const totalOrders = orders.length;

  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const criticalOrders = orders.filter(o =>
    getOrderPriority(o.desired_delivery_date, o.status) === 'red'
  ).length;

  return (

    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white border-b shadow-sm sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

          <div className="flex items-center gap-4">

            {editingCompany ? (

              <div className="flex gap-2">

                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border rounded px-2 py-1"
                />

                <Button size="sm" onClick={handleUpdateCompany}>
                  Guardar
                </Button>

              </div>

            ) : (

              <>

                <h1 className="text-xl font-bold">{companyInfo.name}</h1>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingCompany(true)}
                >
                  <Pencil className="h-4 w-4"/>
                </Button>

              </>

            )}

            <Badge variant={companyInfo.subscription_status === 'active' ? 'default' : 'secondary'}>
              {companyInfo.subscription_status}
            </Badge>

          </div>

          <div className="flex items-center gap-4">

            <AlarmIndicator
              activeAlarms={activeAlarms}
              isMuted={isMuted}
              toggleMute={toggleMute}
            />

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2"/>
              {pt.common.logout}
            </Button>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-4 py-8">

        <Tabs defaultValue="metrics">

          <TabsList className="grid grid-cols-4 mb-8">

            <TabsTrigger value="metrics">
              <BarChart2 className="h-4 w-4 mr-2"/>
              Métricas
            </TabsTrigger>

            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2"/>
              Pedidos
            </TabsTrigger>

            <TabsTrigger value="employees">
              <Users className="h-4 w-4 mr-2"/>
              Funcionários
            </TabsTrigger>

            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2"/>
              Definições
            </TabsTrigger>

          </TabsList>

          {/* METRICS */}

          <TabsContent value="metrics">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                Nenhum pedido encontrado para esta empresa.
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">

                <Card>
                  <CardHeader>
                    <CardTitle>Total Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalOrders}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Entregues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {deliveredOrders}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex gap-2">
                      <AlertTriangle className="h-5 w-5"/>
                      Críticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">
                      {criticalOrders}
                    </p>
                  </CardContent>
                </Card>

              </div>
            )}
          </TabsContent>

          {/* ORDERS */}

          <TabsContent value="orders">

            <Card>

              <CardHeader className="flex justify-between items-center">

                <CardTitle>Pedidos</CardTitle>

                <div className="flex gap-2">

                  <Button onClick={() => navigate('/create-order')}>
                    <Plus className="h-4 w-4 mr-2"/>
                    Novo Pedido
                  </Button>

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2"/>
                    Exportar
                  </Button>

                </div>

              </CardHeader>

                  <CardContent>
                {orders.length === 0 ? (
                  <p className="py-8 text-center text-gray-600">
                    Ainda não há nenhum pedido registrado.
                  </p>
                ) : (
                  <table className="w-full">

                    <thead>

                      <tr>
                        <th>Cliente</th>
                        <th>Prioridade</th>
                        <th>Estado</th>
                        <th>Entrega</th>
                        <th>Funcionário</th>
                      </tr>

                    </thead>

                    <tbody>

                      {orders.map(order => {

                        const prio = getOrderPriority(order.desired_delivery_date, order.status);

                        return (

                          <tr key={order.id}>

                            <td>{order.customer_name}</td>

                            <td>
                              <Badge className={getPriorityColor(prio)}>
                                {prio}
                              </Badge>
                            </td>

                            <td>{order.status}</td>

                            <td>
                              {order.desired_delivery_date
                                ? new Date(order.desired_delivery_date).toLocaleString()
                                : "Sem data"}
                            </td>

                            <td>

                              <select
                                value={order.assigned_to || ""}
                                onChange={(e) =>
                                  handleAssignEmployee(order.id, e.target.value)
                                }
                              >

                                <option value="">Não atribuído</option>

                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                  </option>
                                ))}

                              </select>

                            </td>

                          </tr>

                        );

                      })}

                    </tbody>

                  </table>
                )}
              </CardContent>

            </Card>

          </TabsContent>

          {/* EMPLOYEES */}

          <TabsContent value="employees">

            <Card>

              <CardHeader>
                <CardTitle>Funcionários ({employees.length})</CardTitle>
              </CardHeader>

              <CardContent>

                <ul className="divide-y">

                  {employees.map(emp => (

                    <li key={emp.id} className="py-4 flex justify-between">

                      <div>

                        <p className="font-semibold">{emp.name}</p>

                        <p className="text-sm text-gray-500">
                          {emp.email} | {emp.phone}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditingEmployee(emp)}
                        >
                          <Pencil className="h-4 w-4"/>
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteEmployee(emp.id)}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>

                      </div>

                    </li>

                  ))}

                </ul>

              </CardContent>

            </Card>

          </TabsContent>

          {/* SETTINGS */}

          <TabsContent value="settings">

            <Card>

              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>

              <CardContent>

                <p>Plano: {companyInfo.subscription_status}</p>

                <Button
                  className="mt-4"
                  onClick={() => navigate('/pricing')}
                >
                  Atualizar Plano
                </Button>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </main>

    </div>

  );

};

export default GestorDashboard;