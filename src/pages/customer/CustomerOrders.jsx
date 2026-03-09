import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, LogOut, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { orders, loadOrders, loading } = useSupabase();
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        label: pt.status.pending,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      accepted: {
        icon: CheckCircle,
        label: pt.status.accepted,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      in_delivery: {
        icon: Truck,
        label: pt.status.in_delivery,
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      delivered: {
        icon: CheckCircle,
        label: pt.status.delivered,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        icon: XCircle,
        label: pt.status.cancelled,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1 w-fit`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-PT', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedOrders = [...localOrders].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Helmet>
        <title>{pt.customerOrders.title}</title>
        <meta name="description" content={pt.customerOrders.descMeta} />
      </Helmet>

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{pt.customerOrders.appTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{pt.common.welcome}, {currentUser?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-gray-900 border-gray-300 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {pt.common.logout}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{pt.customerOrders.myOrders}</h2>
          <Button
            onClick={() => navigate('/customer/create-order')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            {pt.customerOrders.createNewOrder}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{pt.customerOrders.loading}</p>
            </div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-20 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{pt.customerOrders.noOrders}</h3>
              <p className="text-gray-600 mb-6">{pt.customerOrders.createFirst}</p>
              <Button
                onClick={() => navigate('/customer/create-order')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                {pt.createOrder.createBtn}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="shadow-md hover:shadow-lg transition-shadow border-blue-100">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900">{order.order_type}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{pt.common.description}</p>
                    <p className="text-sm text-gray-600">{order.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{pt.common.address}</p>
                    <p className="text-sm text-gray-600">{order.customer_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{pt.common.desiredDelivery}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(order.desired_delivery_time)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      {pt.customerOrders.orderPlaced} {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;