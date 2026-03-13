
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, BarChart2, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { useProdexDataStore } from '@/hooks/useProdexDataStore';
import { useAlarmSystem } from '@/hooks/useAlarmSystem';
import { useSupabase } from '@/hooks/useSupabase';

import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DeliveriesManagement from '@/components/dashboard/DeliveriesManagement';
import EmployeesManagement from '@/components/dashboard/EmployeesManagement';
import ReportsAnalytics from '@/components/dashboard/ReportsAnalytics';
import AlertBanner from '@/components/AlertBanner';
import SoundAlarmSystem from '@/components/SoundAlarmSystem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const companyId = currentUser?.company_id;
  
  const { getDeliveries, saveDeliveries, getEmployees, saveEmployees } = useProdexDataStore();
  const [fallbackDeliveries, setFallbackDeliveries] = useState([]);
  const [fallbackEmployees, setFallbackEmployees] = useState([]);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const {
    loading,
    orders: supabaseOrders,
    employees: supabaseEmployees,
    loadOrders,
    loadEmployees,
    createOrder,
    updateOrder,
    deleteOrder,
    createEmployeeAccount,
    updateEmployee,
    deleteEmployee,
  } = useSupabase();

  const mapOrderStatusToView = useCallback((status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'pending' || value === 'recebido' || value === 'recebida') return 'Recebido';
    if (value === 'in_progress' || value === 'in_delivery' || value === 'em andamento' || value === 'em processamento') return 'Em Processamento';
    if (value === 'delivered' || value === 'entregue' || value === 'concluído' || value === 'concluido') return 'Concluído';
    if (value === 'cancelled' || value === 'cancelado' || value === 'cancelada') return 'Cancelado';
    return status || 'Recebido';
  }, []);

  const mapOrderStatusToDatabase = useCallback((status) => {
    if (status === 'Recebido' || status === 'Recebida' || status === 'Pendente') return 'pending';
    if (status === 'Em Processamento' || status === 'Em Andamento') return 'in_delivery';
    if (status === 'Concluído' || status === 'Entregue') return 'delivered';
    if (status === 'Cancelado' || status === 'Cancelada') return 'cancelled';
    return status || 'pending';
  }, []);

  const mapPriorityToView = useCallback((priority) => {
    const value = String(priority || '').toLowerCase();
    if (value === 'low' || value === 'baixa') return 'Low';
    if (value === 'high' || value === 'alta') return 'High';
    return 'Medium';
  }, []);

  const mapPriorityToDatabase = useCallback((priority) => {
    if (priority === 'Low' || priority === 'Baixa') return 'Low';
    if (priority === 'High' || priority === 'Alta') return 'High';
    return 'Normal';
  }, []);

  const normalizeDelivery = useCallback((delivery) => ({
    ...delivery,
    customerName: delivery.customerName || delivery.customer_name || 'Sem cliente',
    phone: delivery.phone || delivery.customer_phone || '',
    address: delivery.address || delivery.delivery_address || delivery.customer_address || '',
    type: delivery.type || delivery.order_type || 'Standard',
    priority: mapPriorityToView(delivery.priority),
    status: mapOrderStatusToView(delivery.status),
    expectedDate: delivery.expectedDate || delivery.desired_delivery_time || delivery.expected || delivery.created_at || new Date().toISOString(),
    createdDate: delivery.createdDate || delivery.created_at || new Date().toISOString(),
    employee: delivery.employee || delivery.assigned_to || null,
    notes: delivery.notes || delivery.description || delivery.special_instructions || '',
    company_id: delivery.company_id || companyId,
  }), [companyId, mapOrderStatusToView, mapPriorityToView]);

  const normalizeEmployee = useCallback((employee) => ({
    ...employee,
    name: employee.name || employee.full_name || 'Sem nome',
    email: employee.email || '',
    phone: employee.phone || '',
    status: String(employee?.status || '').toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
    company_id: employee.company_id || companyId,
  }), [companyId]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!companyId) {
        return;
      }

      try {
        await Promise.all([loadOrders(companyId), loadEmployees(companyId)]);
        setUseFallbackData(false);
      } catch (error) {
        console.error('[AdminDashboard] Failed to load Supabase data, using local fallback.', error);
        setUseFallbackData(true);
        setFallbackDeliveries(getDeliveries() || []);
        setFallbackEmployees(getEmployees() || []);
      }
    };

    bootstrap();
    
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [companyId, getDeliveries, getEmployees, loadEmployees, loadOrders]);

  const deliveries = useMemo(() => {
    const source = useFallbackData ? fallbackDeliveries : supabaseOrders;
    return source
      .filter((delivery) => !companyId || delivery.company_id === companyId)
      .map(normalizeDelivery);
  }, [companyId, fallbackDeliveries, normalizeDelivery, supabaseOrders, useFallbackData]);

  const employees = useMemo(() => {
    const source = useFallbackData ? fallbackEmployees : supabaseEmployees;
    return source
      .filter((employee) => !companyId || employee.company_id === companyId)
      .map(normalizeEmployee);
  }, [companyId, fallbackEmployees, normalizeEmployee, supabaseEmployees, useFallbackData]);

  const reloadSupabaseData = useCallback(async () => {
    if (!companyId || useFallbackData) {
      return;
    }

    await Promise.all([loadOrders(companyId), loadEmployees(companyId)]);
  }, [companyId, loadEmployees, loadOrders, useFallbackData]);

  const handleCreateDelivery = useCallback(async (delivery) => {
    if (useFallbackData) {
      const nextDelivery = {
        ...delivery,
        id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
        createdDate: new Date().toISOString(),
        company_id: companyId,
      };
      const nextDeliveries = [nextDelivery, ...fallbackDeliveries];
      setFallbackDeliveries(nextDeliveries);
      saveDeliveries(nextDeliveries);
      return { success: true, data: nextDelivery };
    }

    return createOrder({
      customer_name: delivery.customerName,
      phone: delivery.phone || null,
      address: delivery.address,
      type: delivery.type || 'Standard',
      priority: mapPriorityToDatabase(delivery.priority),
      assigned_to: delivery.employee || null,
      description: delivery.notes || null,
      special_instructions: delivery.notes || null,
      status: mapOrderStatusToDatabase(delivery.status),
      desired_delivery_time: delivery.expectedDate,
      company_id: companyId,
    });
  }, [companyId, createOrder, fallbackDeliveries, mapOrderStatusToDatabase, mapPriorityToDatabase, saveDeliveries, useFallbackData]);

  const handleUpdateDelivery = useCallback(async (delivery) => {
    if (useFallbackData) {
      const nextDeliveries = fallbackDeliveries.map((item) => item.id === delivery.id ? delivery : item);
      setFallbackDeliveries(nextDeliveries);
      saveDeliveries(nextDeliveries);
      return { success: true, data: delivery };
    }

    return updateOrder(delivery.id, {
      customer_name: delivery.customerName,
      phone: delivery.phone || null,
      address: delivery.address,
      type: delivery.type || 'Standard',
      priority: mapPriorityToDatabase(delivery.priority),
      assigned_to: delivery.employee || null,
      description: delivery.notes || null,
      special_instructions: delivery.notes || null,
      status: mapOrderStatusToDatabase(delivery.status),
      desired_delivery_time: delivery.expectedDate,
    }, currentUser?.id);
  }, [currentUser?.id, fallbackDeliveries, mapOrderStatusToDatabase, mapPriorityToDatabase, saveDeliveries, updateOrder, useFallbackData]);

  const handleDeleteDelivery = useCallback(async (deliveryId) => {
    if (useFallbackData) {
      const nextDeliveries = fallbackDeliveries.filter((delivery) => delivery.id !== deliveryId);
      setFallbackDeliveries(nextDeliveries);
      saveDeliveries(nextDeliveries);
      return { success: true };
    }

    return deleteOrder(deliveryId);
  }, [deleteOrder, fallbackDeliveries, saveDeliveries, useFallbackData]);

  const handleCreateEmployee = useCallback(async (employee) => {
    if (useFallbackData) {
      const password = employee.password || Math.random().toString(36).slice(-12);
      const nextEmployee = {
        ...employee,
        id: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
        company_id: companyId,
      };
      const nextEmployees = [...fallbackEmployees, nextEmployee];
      setFallbackEmployees(nextEmployees);
      saveEmployees(nextEmployees);
      return { success: true, data: nextEmployee, credentials: { email: nextEmployee.email, password, id: nextEmployee.id } };
    }

    return createEmployeeAccount({
      email: employee.email,
      password: employee.password,
      name: employee.name,
      phone: employee.phone,
      companyId,
    });
  }, [companyId, createEmployeeAccount, fallbackEmployees, saveEmployees, useFallbackData]);

  const handleUpdateEmployee = useCallback(async (employee) => {
    if (useFallbackData) {
      const nextEmployees = fallbackEmployees.map((item) => item.id === employee.id ? employee : item);
      setFallbackEmployees(nextEmployees);
      saveEmployees(nextEmployees);
      return { success: true, data: employee };
    }

    return updateEmployee(employee.id, {
      name: employee.name,
      phone: employee.phone,
    });
  }, [fallbackEmployees, saveEmployees, updateEmployee, useFallbackData]);

  const handleDeleteEmployee = useCallback(async (employeeId) => {
    if (useFallbackData) {
      const nextEmployees = fallbackEmployees.filter((employee) => employee.id !== employeeId);
      const nextDeliveries = fallbackDeliveries.map((delivery) =>
        delivery.employee === employeeId ? { ...delivery, employee: null } : delivery
      );
      setFallbackEmployees(nextEmployees);
      setFallbackDeliveries(nextDeliveries);
      saveEmployees(nextEmployees);
      saveDeliveries(nextDeliveries);
      return { success: true };
    }

    return deleteEmployee(employeeId);
  }, [deleteEmployee, fallbackDeliveries, fallbackEmployees, saveDeliveries, saveEmployees, useFallbackData]);

  const companyDeliveries = useMemo(() => {
    return deliveries.filter(d => d.company_id === currentUser?.company_id);
  }, [deliveries, currentUser?.company_id]);
  
  const companyEmployees = useMemo(() => {
    return employees.filter(e => e.company_id === currentUser?.company_id);
  }, [employees, currentUser?.company_id]);

  const { alerts, mutedAlerts, muteAlert, unmuteAlert, muteAll, unmuteAll } = useAlarmSystem(companyDeliveries);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col w-full min-h-screen">
      <div className="bg-primary border-b border-primary-foreground/20 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <img src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" alt="PRODEX Logo" className="h-8 object-contain brightness-0 invert" />
          <div className="h-6 w-px bg-white/20 mx-2 hidden md:block"></div>
          <h1 className="text-xl font-bold text-white hidden md:block">Gestão Global</h1>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2 animate-pulse bg-red-500 text-white border-none">
              {alerts.length} Alertas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            <Building2 className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-mono text-white tracking-wider">{currentUser?.company_id}</span>
          </div>
          <div className="bg-white/10 rounded-full">
            <SoundAlarmSystem />
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:text-red-300 hover:bg-white/10 transition-colors font-semibold">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:block">Sair</span>
          </Button>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <AlertBanner 
          alerts={alerts} 
          mutedAlerts={mutedAlerts} 
          muteAlert={muteAlert} 
          unmuteAlert={unmuteAlert} 
          muteAll={muteAll} 
          unmuteAll={unmuteAll} 
        />

        <DashboardOverview deliveries={companyDeliveries} employees={companyEmployees} />

        <Tabs defaultValue="deliveries" className="w-full mt-8">
          <TabsList className="mb-6 flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm w-full md:w-auto overflow-x-auto justify-start h-auto">
            <TabsTrigger value="deliveries" className="py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg flex items-center whitespace-nowrap font-semibold transition-all">
              <Package className="h-4 w-4 mr-2" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="employees" className="py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg flex items-center whitespace-nowrap font-semibold transition-all">
              <Users className="h-4 w-4 mr-2" /> Funcionários
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg flex items-center whitespace-nowrap font-semibold transition-all">
              <BarChart2 className="h-4 w-4 mr-2" /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DeliveriesManagement
              deliveries={companyDeliveries}
              employees={companyEmployees}
              loading={loading}
              onCreateDelivery={handleCreateDelivery}
              onUpdateDelivery={handleUpdateDelivery}
              onDeleteDelivery={handleDeleteDelivery}
            />
          </TabsContent>

          <TabsContent value="employees" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <EmployeesManagement
              employees={companyEmployees}
              deliveries={companyDeliveries}
              loading={loading}
              onCreateEmployee={handleCreateEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ReportsAnalytics deliveries={companyDeliveries} employees={companyEmployees} onRefresh={reloadSupabaseData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
