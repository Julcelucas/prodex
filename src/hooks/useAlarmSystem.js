
import { useState, useEffect, useCallback, useRef } from 'react';
import { playSound } from '@/components/SoundAlarmSystem';
import { getAlertsSnapshot, setAlertsSnapshot } from '@/lib/prodex-store';
import { assertSupabaseConfigured, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Hook to manage the PRODEX alarm system.
 * Monitors deliveries for critical time thresholds and unassigned status.
 */
export const useAlarmSystem = (deliveries) => {
  const [alerts, setAlerts] = useState([]);
  const [mutedAlerts, setMutedAlerts] = useState([]);
  const lastSyncedSignatureRef = useRef('');

  const syncAlertsToSupabase = useCallback(async (activeAlerts) => {
    if (!isSupabaseConfigured || !Array.isArray(activeAlerts)) return;

    const signature = JSON.stringify(activeAlerts.map((a) => a.id).sort());
    if (lastSyncedSignatureRef.current === signature) {
      return;
    }

    try {
      const client = assertSupabaseConfigured();

      if (activeAlerts.length === 0) {
        lastSyncedSignatureRef.current = signature;
        return;
      }

      const rows = activeAlerts.map((alert) => ({
        order_id: alert.deliveryId,
        company_id: alert.companyId || null,
        type: alert.type,
        message: alert.reason,
        created_at: alert.timestamp || new Date().toISOString(),
      }));

      const { error } = await client.from('alerts').insert(rows);

      if (!error) {
        lastSyncedSignatureRef.current = signature;
        console.log('[useAlarmSystem] Alertas sincronizados com sucesso!');
      } else {
        console.error('[useAlarmSystem] Falha ao sincronizar. Erro do Supabase:', error);
      }
    } catch (error) {
      console.error('[useAlarmSystem] Exceção no código ao tentar sincronizar', error);
    }
  }, []);

  const checkAlerts = useCallback(() => {
    if (!deliveries || !Array.isArray(deliveries)) return;
    
    const now = new Date().getTime();
    const stored = getAlertsSnapshot();
    const muted = stored.muted || [];
    setMutedAlerts(muted);

    const newAlerts = [];
    let shouldPlaySound = false;
    let highestSeverity = null;

    deliveries.forEach(d => {
      // Skip completed or cancelled deliveries
      if (d.status === 'Entregue' || d.status === 'Cancelada' || d.status === 'entregue' || d.status === 'cancelado') return;

      // Normalize date field (handles both expectedDate and desired_delivery_time)
      const targetDate = d.expectedDate || d.desired_delivery_time;
      if (!targetDate) return;

      const expected = new Date(targetDate).getTime();
      const hoursLeft = (expected - now) / (1000 * 60 * 60);

      let type = null;
      let reason = '';

      if (hoursLeft < 0) {
        type = 'CRITICAL';
        reason = 'Entrega em Atraso!';
      } else if (hoursLeft <= 24) {
        type = 'WARNING';
        reason = 'Entrega Próxima (<24h)';
      } else if ((d.status === 'Pendente' || d.status === 'pendente') && !d.employee && !d.assigned_to) {
        type = 'INFO';
        reason = 'Pendente e Sem Funcionário Atribuído';
      }

      if (type) {
        const alertId = `alert-${d.id}-${type}`;
        newAlerts.push({
          id: alertId,
          type,
          deliveryId: d.id,
          companyId: d.company_id || null,
          customerName: d.customerName || d.customer_name,
          phone: d.phone || d.customer_phone,
          address: d.address || d.customer_address,
          reason,
          timestamp: new Date().toISOString()
        });

        // Trigger sound if this specific alert is not muted
        if (!muted.includes(alertId)) {
          shouldPlaySound = true;
          if (type === 'CRITICAL') highestSeverity = 'CRITICAL';
          else if (type === 'WARNING' && highestSeverity !== 'CRITICAL') highestSeverity = 'WARNING';
          else if (type === 'INFO' && !highestSeverity) highestSeverity = 'INFO';
        }
      }
    });

    setAlerts(newAlerts);
    setAlertsSnapshot({ ...stored, active: newAlerts, muted });
    syncAlertsToSupabase(newAlerts);

    if (shouldPlaySound && highestSeverity) {
      playSound(highestSeverity);
      if (Notification.permission === 'granted') {
        new Notification('PRODEX Alertas', { body: `Existem novos alertas de entrega críticos.` });
      }
    }
  }, [deliveries, syncAlertsToSupabase]);

  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkAlerts]);

  const muteAlert = (id) => {
    const newMuted = [...mutedAlerts, id];
    setMutedAlerts(newMuted);
    const stored = getAlertsSnapshot();
    setAlertsSnapshot({ ...stored, muted: newMuted });
  };

  const unmuteAlert = (id) => {
    const newMuted = mutedAlerts.filter(m => m !== id);
    setMutedAlerts(newMuted);
    const stored = getAlertsSnapshot();
    setAlertsSnapshot({ ...stored, muted: newMuted });
  };

  const muteAll = () => {
    const newMuted = alerts.map(a => a.id);
    setMutedAlerts(newMuted);
    const stored = getAlertsSnapshot();
    setAlertsSnapshot({ ...stored, muted: newMuted });
  };

  const unmuteAll = () => {
    setMutedAlerts([]);
    const stored = getAlertsSnapshot();
    setAlertsSnapshot({ ...stored, muted: [] });
  };

  return {
    alerts,
    mutedAlerts,
    muteAlert,
    unmuteAlert,
    muteAll,
    unmuteAll
  };
};

/**
 * Utility to determine the priority/color code of an order based on its deadline.
 */
export const getOrderPriority = (deliveryTime, status) => {
  if (status === 'entregue' || status === 'cancelado' || status === 'Entregue' || status === 'Cancelada') return 'gray';
  
  const now = new Date().getTime();
  const target = new Date(deliveryTime).getTime();
  const hoursLeft = (target - now) / (1000 * 60 * 60);

  if (hoursLeft < 0) return 'red';
  if (hoursLeft < 24) return 'yellow';
  return 'green';
};
