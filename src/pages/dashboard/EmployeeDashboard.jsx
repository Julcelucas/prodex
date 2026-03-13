
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { LayoutDashboard, List, BarChart, LogOut, PackageSearch, PlusCircle } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import FuncionarioOverview from '@/components/dashboard/FuncionarioOverview';
import MyOrders from '@/components/dashboard/MyOrders';
import FuncionarioReports from '@/components/dashboard/FuncionarioReports';
import CreateOrderForm from '@/components/dashboard/CreateOrderForm';

const FuncionarioDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const {
    orders: supabaseOrders,
    employees: supabaseEmployees,
    loadOrders,
    loadEmployees,
    createOrder,
    updateOrderStatus: updateSupabaseOrderStatus,
  } = useSupabase();
  
  const [localOrders, setLocalOrders] = useState([]);
  const [localEmployees, setLocalEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const companyId = currentUser?.company_id;

  const normalizeStatusForView = useCallback((status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'pending' || value === 'recebida') return 'Recebida';
    if (value === 'in_progress' || value === 'in_delivery' || value === 'em processamento') return 'Em Processamento';
    if (value === 'delivered' || value === 'entregue' || value === 'completa') return 'Completa';
    if (value === 'cancelled' || value === 'cancelada') return 'Cancelada';
    return status || 'Recebida';
  }, []);

  const mapPriorityForView = useCallback((priority) => {
    const value = String(priority || '').toLowerCase();
    if (value === 'high' || value === 'alta') return 'High';
    if (value === 'low' || value === 'baixa') return 'Low';
    return 'Normal';
  }, []);

  const normalizeOrderForView = useCallback((order) => ({
    ...order,
    customerName: order.customerName || order.customer_name || 'Sem cliente',
    address: order.address || order.customer_address || order.delivery_address || 'Sem morada',
    type: order.type || order.order_type || 'Outro',
    createdDate: order.createdDate || order.created_at || new Date().toISOString(),
    status: normalizeStatusForView(order.status),
    priority: mapPriorityForView(order.priority),
    employee: order.employee || order.assigned_to || null,
    company_id: order.company_id || companyId,
  }), [companyId, mapPriorityForView, normalizeStatusForView]);

  const normalizeEmployeeForView = useCallback((employee) => ({
    ...employee,
    name: employee.name || employee.full_name || 'Sem nome',
  }), []);

  // Fetch orders and employees from localStorage safely
  useEffect(() => {
    const fetchData = () => {
      const storedOrders = JSON.parse(localStorage.getItem('prodex_orders') || '[]');
      setLocalOrders(storedOrders);
      
      const db = JSON.parse(localStorage.getItem('prodex_db') || '{"users":[]}');
      const companyEmployees = (db.users || []).filter(u => u.user_type === 'funcionario' && u.company_id === companyId);
      setLocalEmployees(companyEmployees);
    };
    
    fetchData();
    if (companyId) {
      loadOrders(companyId);
      loadEmployees(companyId);
    }
    window.addEventListener('prodex_orders_updated', fetchData);
    return () => window.removeEventListener('prodex_orders_updated', fetchData);
  }, [companyId, loadEmployees, loadOrders]);

  const employees = useMemo(() => {
    const source = supabaseEmployees.length > 0 ? supabaseEmployees : localEmployees;
    return source.map(normalizeEmployeeForView);
  }, [localEmployees, normalizeEmployeeForView, supabaseEmployees]);

  const orders = useMemo(() => {
    const source = supabaseOrders.length > 0 ? supabaseOrders : localOrders;
    return source.map(normalizeOrderForView);
  }, [localOrders, normalizeOrderForView, supabaseOrders]);

  // Filter orders assigned to this employee
  const myOrders = useMemo(() => {
    return orders.filter((order) =>
      order.company_id === companyId && (order.employee === currentUser?.id || order.assigned_to === currentUser?.id)
    );
  }, [orders, companyId, currentUser?.id]);

  const updateOrderStatus = useCallback((id, newStatus) => {
    const normalizedStatus = newStatus === 'Recebida'
      ? 'pending'
      : newStatus === 'Em Processamento'
        ? 'in_delivery'
        : newStatus === 'Completa'
          ? 'delivered'
          : newStatus;

    if (supabaseOrders.length > 0) {
      updateSupabaseOrderStatus(id, normalizedStatus, currentUser?.id).then((result) => {
        if (result?.success) {
          toast({ title: 'Status Atualizado', description: `Encomenda marcada como ${newStatus}` });
          loadOrders(companyId);
        }
      });
      return;
    }

    const storedOrders = JSON.parse(localStorage.getItem('prodex_orders') || '[]');
    const updatedOrders = storedOrders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('prodex_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('prodex_orders_updated'));
    toast({ title: 'Status Atualizado', description: `Encomenda marcada como ${newStatus}` });
  }, [companyId, currentUser?.id, loadOrders, supabaseOrders.length, toast, updateSupabaseOrderStatus]);

  const handleCreateOrder = useCallback(async (payload) => {
    const result = await createOrder(payload);
    if (result?.success) {
      await loadOrders(companyId);
    }
    return result;
  }, [companyId, createOrder, loadOrders]);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/';
  }, [logout]);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-h-screen font-sans">
      <Helmet>
        <title>Área de Processamento | PRODEX</title>
        <meta name="description" content="Dashboard de processamento de encomendas para funcionários." />
      </Helmet>

      {/* Header */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-40 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <PackageSearch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Área de Processamento</h1>
              <p className="text-xs text-green-100 uppercase tracking-wider">{companyId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-bold leading-none">{currentUser?.name}</p>
              <p className="text-xs text-green-100">Operador</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-white hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap bg-white border border-gray-200 rounded-xl h-auto p-1.5 shadow-sm max-w-3xl justify-start">
            <TabsTrigger value="overview" className="py-2.5 px-4 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 min-w-[120px]">
              <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:inline-block" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="my-orders" className="py-2.5 px-4 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 min-w-[120px]">
              <List className="h-4 w-4 mr-2 hidden sm:inline-block" /> Fila de Trabalho
            </TabsTrigger>
            <TabsTrigger value="new-order" className="py-2.5 px-4 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 min-w-[120px]">
              <PlusCircle className="h-4 w-4 mr-2 hidden sm:inline-block" /> Nova Encomenda
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-2.5 px-4 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex-1 min-w-[120px]">
              <BarChart className="h-4 w-4 mr-2 hidden sm:inline-block" /> Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="focus:outline-none animate-in fade-in duration-300">
            <FuncionarioOverview myOrders={myOrders} />
          </TabsContent>

          <TabsContent value="my-orders" className="focus:outline-none animate-in fade-in duration-300">
            <MyOrders myOrders={myOrders} updateOrderStatus={updateOrderStatus} />
          </TabsContent>

          <TabsContent value="new-order" className="focus:outline-none animate-in fade-in duration-300">
            <CreateOrderForm 
              currentUser={currentUser} 
              employees={employees} 
              onCreateOrder={handleCreateOrder}
              onCancel={() => setActiveTab('my-orders')}
              onSuccess={() => setActiveTab('my-orders')}
            />
          </TabsContent>

          <TabsContent value="reports" className="focus:outline-none animate-in fade-in duration-300">
            <FuncionarioReports myOrders={myOrders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FuncionarioDashboard;
