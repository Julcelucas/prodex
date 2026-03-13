
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, LogOut, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const EmployeeOrders = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [localOrders, setLocalOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('prodex_db') || '{"orders":[]}');
    if (currentUser) {
      setLocalOrders(db.orders.filter(o => o.assigned_to === currentUser.id));
    }
    setLoading(false);
  }, [currentUser]);

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
      in_progress: {
        icon: Truck,
        label: pt.status.in_progress || 'Em Andamento',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-AO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedOrders = [...localOrders].sort((a, b) => {
    return new Date(a.desired_delivery_time) - new Date(b.desired_delivery_time);
  });

  return (
    <div className="flex-1 bg-gradient-to-br from-green-50 via-white to-green-50 w-full mb-12">
      <Helmet>
        <title>{pt.employeeOrders?.title || 'Painel de Funcionário | PRODEX'}</title>
        <meta name="description" content={pt.employeeOrders?.descMeta} />
      </Helmet>

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://horizons-cdn.hostinger.com/09c56e09-52d4-418e-a931-c90b615a7eec/c5d6ad514ca5b4c520fa8222cf1b75cb.png" 
              alt="PRODEX Logo" 
              className="logo-md" 
            />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{pt.employeeOrders?.appTitle || 'Portal do Funcionário'}</h1>
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
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{pt.employeeOrders?.myOrders || 'As Minhas Entregas'}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">{pt.employeeOrders?.loading || 'A carregar...'}</p>
            </div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-20 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{pt.employeeOrders?.noOrders || 'Sem entregas atribuídas.'}</h3>
              <p className="text-gray-600 mb-6">Aguarde por novas atribuições do administrador.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedOrders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow border-primary/20 border-t-4 border-t-primary">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900">{order.customer_name}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{pt.common.description}</p>
                    <p className="text-sm text-gray-900">{order.description || 'Nenhuma descrição'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{pt.common.address}</p>
                    <p className="text-sm text-gray-900 font-medium">{order.customer_address}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Clock className="h-3 w-3"/> Data Limite</p>
                    <p className="text-sm text-red-600 font-bold">{formatDateTime(order.desired_delivery_time)}</p>
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

export default EmployeeOrders;
