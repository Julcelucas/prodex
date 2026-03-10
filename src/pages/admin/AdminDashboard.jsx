import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderActions from '@/components/OrderActions';

import {
  Shield,
  LogOut,
  Clock,
  AlertTriangle,
  Truck,
  CheckCircle,
  Package,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react';

import { pt } from '@/lib/translations';

const AdminDashboard = () => {

  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getOrders, getEmployees, loading } = useSupabase();

  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [prioritizedOrders, setPrioritizedOrders] = useState([]);

  const [stats, setStats] = useState({
    pending: 0,
    delayed: 0,
    in_delivery: 0,
    delivered: 0
  });

  // =============================
  // CARREGAR DADOS
  // =============================

  useEffect(() => {

    const loadData = async () => {

      if (!currentUser) return;

      try {

        // determine which company to load data for
        // admin users should not filter by company, so we pass undefined
        let companyId = currentUser.company_id;
        if (currentUser.user_type === "admin") {
          companyId = undefined;
        }

        const fetchedOrders = await getOrders(companyId);
        const fetchedEmployees = await getEmployees(companyId);

        const ordersData = fetchedOrders || [];
        const employeesData = fetchedEmployees || [];

        setOrders(ordersData);
        setEmployees(employeesData);

        // =============================
        // ESTATÍSTICAS
        // =============================

        const newStats = {
          pending: ordersData.filter(o => o.status === 'pending').length,
          delayed: ordersData.filter(o =>
            o.status === 'pending' &&
            new Date(o.desired_delivery_time) < new Date()
          ).length,
          in_delivery: ordersData.filter(o => o.status === 'in_delivery').length,
          delivered: ordersData.filter(o => o.status === 'delivered').length,
        };

        setStats(newStats);

        // =============================
        // PRIORIDADE DE PEDIDOS
        // =============================

        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const prioritized = ordersData
          .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
          .map(order => {

            const deliveryTime = new Date(order.desired_delivery_time);

            let priority = 'green';
            let priorityScore = 3;

            if (deliveryTime < now) {
              priority = 'red';
              priorityScore = 1;
            }
            else if (deliveryTime <= twoHoursFromNow) {
              priority = 'yellow';
              priorityScore = 2;
            }

            return {
              ...order,
              priority,
              priorityScore,
              deliveryTime
            };

          })
          .sort((a, b) => {

            if (a.priorityScore !== b.priorityScore) {
              return a.priorityScore - b.priorityScore;
            }

            return a.deliveryTime - b.deliveryTime;

          });

        setPrioritizedOrders(prioritized);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }

    };

    loadData();

  }, [currentUser]);

  // =============================
  // LOGOUT
  // =============================

  const handleLogout = async () => {

    await logout();
    navigate('/');

  };

  // =============================
  // PRIORIDADE
  // =============================

  const getPriorityStyle = (priority) => {

    const styles = {

      red: {
        border: 'border-red-500 border-2',
        bg: 'bg-red-50',
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        label: pt.priority.delayed
      },

      yellow: {
        border: 'border-yellow-500 border-2',
        bg: 'bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: pt.priority.urgent
      },

      green: {
        border: 'border-green-500',
        bg: 'bg-white',
        badge: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: pt.priority.normal
      }

    };

    return styles[priority] || styles.green;

  };

  // =============================
  // STATUS BADGE
  // =============================

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

    return date.toLocaleString('pt-PT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  };

  if (!currentUser) {
    return null;
  }

  // =============================
  // UI
  // =============================

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      <Helmet>
        <title>{pt.adminDashboard.title}</title>
      </Helmet>

      {/* HEADER */}

      <div className="bg-white shadow-sm border-b sticky top-0 z-10">

        <div className="container mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">
              {pt.adminDashboard.header}
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <span className="text-sm text-gray-600 hidden sm:inline">
              Admin: {currentUser?.name}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {pt.common.logout}
            </Button>

          </div>

        </div>

      </div>

      {/* CONTEÚDO */}

      <div className="container mx-auto px-4 py-8">

        {loading ? (

          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-gray-900 rounded-full"></div>
          </div>

        ) : prioritizedOrders.length === 0 ? (

          <Card>
            <CardContent className="py-20 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p>{pt.adminDashboard.noOrders}</p>
            </CardContent>
          </Card>

        ) : (

          <div className="space-y-4">

            {prioritizedOrders.map(order => {

              const priorityStyle = getPriorityStyle(order.priority);
              const PriorityIcon = priorityStyle.icon;

              return (

                <Card
                  key={order.id}
                  className={`${priorityStyle.border} ${priorityStyle.bg}`}
                >

                  <CardHeader>

                    <div className="flex items-center gap-3">

                      <Badge className={priorityStyle.badge}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {priorityStyle.label}
                      </Badge>

                      {getStatusBadge(order.status)}

                    </div>

                    <CardTitle>
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="grid md:grid-cols-2 gap-4">

                      <div>

                        <p><User className="inline h-4 w-4 mr-1" /> {order.customer_name}</p>
                        <p><Phone className="inline h-4 w-4 mr-1" /> {order.customer_phone}</p>
                        <p><Mail className="inline h-4 w-4 mr-1" /> {order.customer_email}</p>

                      </div>

                      <div>

                        <p><MapPin className="inline h-4 w-4 mr-1" /> {order.customer_address}</p>
                        <p><Clock className="inline h-4 w-4 mr-1" /> {formatDateTime(order.desired_delivery_time)}</p>
                        <p><Package className="inline h-4 w-4 mr-1" /> {order.description}</p>

                      </div>

                    </div>

                    <div className="pt-4 border-t mt-4">

                      <OrderActions
                        order={order}
                        onUpdate={async () => {

                          const updated = await getOrders(
                            currentUser?.user_type === 'admin'
                              ? undefined
                              : currentUser?.company_id
                          );
                          setOrders(updated);

                        }}
                      />

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