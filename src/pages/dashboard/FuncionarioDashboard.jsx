
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { useAlarmSystem, getOrderPriority } from '@/hooks/useAlarmSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AlarmIndicator from '@/components/AlarmIndicator';
import { LogOut, MapPin, Clock, Phone, User, CheckCircle, Truck } from 'lucide-react';
import { pt } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';

const FuncionarioDashboard = () => {
  const { currentUser, companyInfo, logout } = useAuth();
  const { getOrders, updateOrderStatus } = useSupabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  
  // Audio alarms only for orders assigned to this employee
  const myOrders = orders.filter(o => o.assigned_to === currentUser?.id || o.assigned_to === null); // Included null for visibility, but typically alarm for assigned only. Let's alarm for all pendentes.
  const { activeAlarms, isMuted, toggleMute } = useAlarmSystem(myOrders);

  const loadData = () => {
    if (currentUser?.company_id) {
      setOrders(getOrders(currentUser.company_id));
    }
  };

  useEffect(() => {
  const fetchOrders = async () => {
    if (currentUser?.company_id) {
      const ordersData = await getOrders(currentUser.company_id);
      setOrders(ordersData);
    }
  };
  fetchOrders();
}, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus, currentUser.id);
    if (res.success) {
      toast({ title: pt.common.success, description: `Estado atualizado para ${pt.status[newStatus] || newStatus}` });
      loadData();
    } else {
      toast({ title: pt.common.error, variant: 'destructive' });
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'red') return 'bg-red-100 text-red-800 border-red-300 shadow-sm border-2';
    if (priority === 'yellow') return 'bg-yellow-100 text-yellow-800 border-yellow-300 border-2';
    if (priority === 'green') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800';
  };

  if (!currentUser) return null;

  const assignedOrders = orders.filter(o => o.assigned_to === currentUser.id);
  const unassignedOrders = orders.filter(o => !o.assigned_to && o.status === 'pendente');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{pt.dashboard.employeeTitle}</h1>
            <p className="text-xs text-green-100">{companyInfo?.name} | {currentUser.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-green-700">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <AlarmIndicator activeAlarms={activeAlarms} isMuted={isMuted} toggleMute={toggleMute} />
      </div>

      <main className="max-w-4xl mx-auto px-4 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Minhas Entregas ({assignedOrders.length})
          </h2>
          <div className="space-y-4">
            {assignedOrders.length === 0 && (
              <Card className="bg-white/50 border-dashed"><CardContent className="py-8 text-center text-gray-500">Nenhuma entrega atribuída a si.</CardContent></Card>
            )}
            {assignedOrders.sort((a,b) => new Date(a.desired_delivery_time) - new Date(b.desired_delivery_time)).map(o => {
              const prio = getOrderPriority(o.desired_delivery_time, o.status);
              return (
                <Card key={o.id} className={`overflow-hidden ${getPriorityColor(prio).split(' ').filter(c => c.startsWith('border-')).join(' ')}`}>
                  <div className={`h-1.5 w-full ${prio === 'red' ? 'bg-red-500' : prio === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{o.customer_name}</h3>
                      <Badge variant="outline">{pt.status[o.status] || o.status}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {o.customer_address}</p>
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4"/> {o.customer_phone}</p>
                      <p className={`flex items-center gap-2 font-semibold ${prio === 'red' ? 'text-red-600' : ''}`}>
                        <Clock className="h-4 w-4"/> {new Date(o.desired_delivery_time).toLocaleString()}
                      </p>
                    </div>

                    {o.status !== 'entregue' && o.status !== 'cancelado' && (
                      <div className="flex gap-2 border-t pt-4">
                        {o.status === 'pendente' && (
                          <Button onClick={() => handleStatusUpdate(o.id, 'em_entrega')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            <Truck className="h-4 w-4 mr-2"/> Iniciar Entrega
                          </Button>
                        )}
                        {o.status === 'em_entrega' && (
                          <Button onClick={() => handleStatusUpdate(o.id, 'entregue')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-4 w-4 mr-2"/> Marcar Entregue
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="pt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-opacity-50">Entregas Pendentes Não Atribuídas ({unassignedOrders.length})</h2>
          <div className="space-y-3 opacity-70">
            {unassignedOrders.map(o => (
              <Card key={o.id} className="bg-gray-50">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{o.customer_name}</p>
                    <p className="text-xs text-gray-500">{o.customer_address}</p>
                  </div>
                  <Badge variant="secondary">Não Atribuído</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FuncionarioDashboard;
