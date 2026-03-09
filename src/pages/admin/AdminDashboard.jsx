import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderActions from '@/components/OrderActions';
import { Shield, LogOut, Clock, AlertTriangle, Truck, CheckCircle, Package, MapPin, User, Phone, Mail } from 'lucide-react';
import { pt } from '@/lib/translations';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getOrders, getEmployees, loading } = useSupabase();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, delayed: 0, in_delivery: 0, delivered: 0 });
  const [prioritizedOrders, setPrioritizedOrders] = useState([]);
  const [employees, setEmployees] = useState([]);

  // === USEEFFECT PARA CARREGAR DADOS ===
  useEffect(() => {
    const companyId = currentUser?.company_id;

    if (!companyId) return;

    // Pegar pedidos
    const fetchedOrders = getOrders(companyId);
    setOrders(fetchedOrders);

    // Pegar funcionários
    const fetchedEmployees = getEmployees(companyId);
    setEmployees(fetchedEmployees);

    // Calcular estatísticas
    const newStats = {
      pending: fetchedOrders.filter(o => o.status === 'pending').length,
      delayed: fetchedOrders.filter(o => o.status === 'pending' && new Date(o.desired_delivery_time) < new Date()).length,
      in_delivery: fetchedOrders.filter(o => o.status === 'in_delivery').length,
      delivered: fetchedOrders.filter(o => o.status === 'delivered').length,
    };
    setStats(newStats);

    // Priorizar pedidos
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const prioritized = fetchedOrders
      .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
      .map(order => {
        const deliveryTime = new Date(order.desired_delivery_time);
        let priority = 'green';
        let priorityScore = 3;

        if (deliveryTime < now) {
          priority = 'red';
          priorityScore = 1;
        } else if (deliveryTime <= twoHoursFromNow) {
          priority = 'yellow';
          priorityScore = 2;
        }

        return { ...order, priority, priorityScore, deliveryTime };
      })
      .sort((a, b) => {
        if (a.priorityScore !== b.priorityScore) return a.priorityScore - b.priorityScore;
        return a.deliveryTime - b.deliveryTime;
      });

    setPrioritizedOrders(prioritized);

  }, [currentUser, getOrders, getEmployees]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      red: { border: 'border-red-500 border-2', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: pt.priority.delayed },
      yellow: { border: 'border-yellow-500 border-2', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: pt.priority.urgent },
      green: { border: 'border-green-500', bg: 'bg-white', badge: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: pt.priority.normal }
    };
    return styles[priority] || styles.green;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: pt.status.pending, className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: pt.status.accepted, className: 'bg-blue-100 text-blue-800' },
      in_delivery: { label: pt.status.in_delivery, className: 'bg-purple-100 text-purple-800' },
      delivered: { label: pt.status.delivered, className: 'bg-green-100 text-green-800' },
      cancelled: { label: pt.status.cancelled, className: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Helmet>
        <title>{pt.adminDashboard.title}</title>
        <meta name="description" content={pt.adminDashboard.descMeta} />
      </Helmet>

      {/* HEADER */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">{pt.adminDashboard.header}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Admin: {currentUser?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-900 border-gray-300 hover:bg-gray-100">
              <LogOut className="h-4 w-4 mr-2" />
              {pt.common.logout}
            </Button>
          </div>
        </div>
      </div>

      {/* STATS CARDS E ORDERS */}
      <div className="container mx-auto px-4 py-8">
        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-md border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{pt.adminDashboard.pendingLabel}</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{pt.adminDashboard.delayedLabel}</p>
                  <p className="text-3xl font-bold text-red-600">{stats.delayed}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{pt.adminDashboard.inDeliveryLabel}</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.in_delivery}</p>
                </div>
                <Truck className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{pt.adminDashboard.deliveredLabel}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">{pt.adminDashboard.loading}</p>
            </div>
          </div>
        ) : prioritizedOrders.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-20 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{pt.adminDashboard.noOrders}</h3>
              <p className="text-gray-600">{pt.adminDashboard.noOrdersDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {prioritizedOrders.map((order) => {
              const priorityStyle = getPriorityStyle(order.priority);
              const PriorityIcon = priorityStyle.icon;
              return (
                <Card key={order.id} className={`shadow-lg ${priorityStyle.border} ${priorityStyle.bg} ${order.priority === 'red' ? 'transform scale-[1.02]' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${priorityStyle.badge} flex items-center gap-1 text-xs font-bold`}>
                            <PriorityIcon className="h-3 w-3" />
                            {priorityStyle.label}
                          </Badge>
                          {getStatusBadge(order.status)}
                          <Badge variant="outline" className="text-gray-900 border-gray-300">{order.order_type}</Badge>
                        </div>
                        <CardTitle className={`text-xl ${order.priority === 'red' ? 'text-red-900 font-extrabold text-2xl' : 'text-gray-900'}`}>
                          {pt.adminDashboard.orderPrefix} #{order.id.slice(0, 8)}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dados do pedido */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Cliente e contato */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2"><User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.customer}</p><p className={`text-sm ${order.priority === 'red' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{order.customer_name}</p></div></div>
                        <div className="flex items-start gap-2"><Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.phone}</p><p className={`text-sm ${order.priority === 'red' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{order.customer_phone}</p></div></div>
                        <div className="flex items-start gap-2"><Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.email}</p><p className={`text-sm ${order.priority === 'red' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{order.customer_email}</p></div></div>
                      </div>

                      {/* Endereço e descrição */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2"><MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.address}</p><p className={`text-sm ${order.priority === 'red' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{order.customer_address}</p></div></div>
                        <div className="flex items-start gap-2"><Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.desiredDelivery}</p><p className={`text-sm ${order.priority === 'red' ? 'font-bold text-red-700 text-base' : 'text-gray-600'}`}>{formatDateTime(order.desired_delivery_time)}</p></div></div>
                        <div className="flex items-start gap-2"><Package className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-gray-700">{pt.common.description}</p><p className={`text-sm ${order.priority === 'red' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{order.description}</p></div></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <OrderActions order={order} onUpdate={() => {
                        const updatedOrders = getOrders(currentUser?.company_id);
                        setOrders(updatedOrders);
                      }} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;