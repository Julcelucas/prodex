
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Check, Truck, XCircle, CheckCircle } from 'lucide-react';
import { pt } from '@/lib/translations';

const OrderActions = ({ order, onUpdate }) => {
  const { updateOrderStatus } = useSupabase();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus, statusLabel) => {
    setUpdating(true);
    
    const result = await updateOrderStatus(order.id, newStatus);
    
    if (result.success) {
      toast({
        title: pt.orderActions?.statusUpdated || 'Status Atualizado',
        description: `${pt.orderActions?.statusChangedTo || 'O status mudou para'} ${statusLabel}`,
      });
      if (onUpdate) {
        onUpdate();
      }
    } else {
      toast({
        title: pt.common.error,
        description: result.error || 'Failed to update order status',
        variant: 'destructive',
      });
    }
    
    setUpdating(false);
  };

  const getAvailableActions = () => {
    const actions = [];

    if (order.status === 'pending') {
      actions.push(
        <Button
          key="accept"
          onClick={() => handleStatusUpdate('accepted', pt.status.accepted || 'Aceite')}
          disabled={updating}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-1" />
          {pt.orderActions?.accept || 'Aceitar'}
        </Button>
      );
    }

    if (order.status === 'accepted' || order.status === 'pending') {
      actions.push(
        <Button
          key="in_delivery"
          onClick={() => handleStatusUpdate('in_delivery', pt.status.in_progress || 'Em processamento')}
          disabled={updating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Truck className="h-4 w-4 mr-1" />
          {pt.orderActions?.inDelivery || 'Processar'}
        </Button>
      );
    }

    if (order.status === 'in_delivery' || order.status === 'accepted') {
      actions.push(
        <Button
          key="delivered"
          onClick={() => handleStatusUpdate('delivered', pt.status.delivered || 'Concluído')}
          disabled={updating}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {pt.orderActions?.delivered || 'Concluir'}
        </Button>
      );
    }

    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      actions.push(
        <Button
          key="cancel"
          onClick={() => handleStatusUpdate('cancelled', pt.status.cancelled || 'Cancelado')}
          disabled={updating}
          size="sm"
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <XCircle className="h-4 w-4 mr-1" />
          {pt.orderActions?.cancel || 'Cancelar'}
        </Button>
      );
    }

    return actions;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {getAvailableActions()}
    </div>
  );
};

export default OrderActions;
