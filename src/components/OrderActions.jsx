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

  // segurança caso order venha undefined
  if (!order) {
    return null;
  }

  const status = order.status || 'pending';

  const handleStatusUpdate = async (newStatus, statusLabel) => {

    if (updating) return;

    setUpdating(true);

    try {

      const result = await updateOrderStatus(order.id, newStatus);

      if (result?.success) {

        toast({
          title: pt?.orderActions?.statusUpdated || "Status atualizado",
          description: `${pt?.orderActions?.statusChangedTo || "Status alterado para"} ${statusLabel}`,
        });

        if (onUpdate) {
          onUpdate();
        }

      } else {

        toast({
          title: pt?.common?.error || "Erro",
          description: result?.error || "Falha ao atualizar status",
          variant: 'destructive',
        });

      }

    } catch (error) {

      toast({
        title: "Erro inesperado",
        description: error.message,
        variant: 'destructive',
      });

    }

    setUpdating(false);

  };

  const getAvailableActions = () => {

    const actions = [];

    // aceitar pedido
    if (status === 'pending') {
      actions.push(
        <Button
          key="accept"
          onClick={() => handleStatusUpdate('accepted', pt?.status?.accepted || "Aceite")}
          disabled={updating}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-4 w-4 mr-1" />
          {pt?.orderActions?.accept || "Aceitar"}
        </Button>
      );
    }

    // sair para entrega
    if (status === 'accepted' || status === 'pending') {
      actions.push(
        <Button
          key="in_delivery"
          onClick={() => handleStatusUpdate('in_delivery', pt?.status?.in_delivery || "Em entrega")}
          disabled={updating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Truck className="h-4 w-4 mr-1" />
          {pt?.orderActions?.inDelivery || "Em entrega"}
        </Button>
      );
    }

    // marcar entregue
    if (status === 'in_delivery' || status === 'accepted') {
      actions.push(
        <Button
          key="delivered"
          onClick={() => handleStatusUpdate('delivered', pt?.status?.delivered || "Entregue")}
          disabled={updating}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {pt?.orderActions?.delivered || "Entregue"}
        </Button>
      );
    }

    // cancelar pedido
    if (status !== 'delivered' && status !== 'cancelled') {
      actions.push(
        <Button
          key="cancel"
          onClick={() => handleStatusUpdate('cancelled', pt?.status?.cancelled || "Cancelado")}
          disabled={updating}
          size="sm"
          variant="destructive"
        >
          <XCircle className="h-4 w-4 mr-1" />
          {pt?.orderActions?.cancel || "Cancelar"}
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