
import React, { useEffect, useState, useCallback } from 'react';
import { Bell, BellOff, AlertTriangle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pt } from '@/lib/translations';
import { setAlertPanelSnapshot, useProdexStore } from '@/lib/prodex-store';

// Simple beep generator using Web Audio API
const playAlertSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'overdue') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
    }
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio might be blocked by browser policy until interaction
  }
};

const AlertSystem = ({ orders = [] }) => {
  const isMuted = useProdexStore((state) => state.alertPanel.muted);
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  const toggleMute = () => {
    setAlertPanelSnapshot({ muted: !isMuted });
  };

  useEffect(() => {
    const now = new Date().getTime();
    const activeAlerts = orders.map(o => {
      if (o.status === 'delivered' || o.status === 'cancelled' || dismissed.has(o.id)) return null;
      
      const deadline = new Date(o.desired_delivery_time).getTime();
      const hoursLeft = (deadline - now) / (1000 * 60 * 60);
      
      if (hoursLeft < 0) return { id: o.id, type: 'overdue', order: o, msg: pt.alerts.overdue };
      if (hoursLeft < 24) return { id: o.id, type: 'nearDeadline', order: o, msg: pt.alerts.nearDeadline };
      if (o.status === 'pending') return { id: o.id, type: 'pending', order: o, msg: pt.alerts.pending };
      return null;
    }).filter(Boolean);

    setAlerts(activeAlerts);

    if (activeAlerts.length > 0 && !isMuted) {
      const hasOverdue = activeAlerts.some(a => a.type === 'overdue');
      playAlertSound(hasOverdue ? 'overdue' : 'standard');
      
      if (Notification.permission === 'granted') {
        new Notification('PRODEX Alertas', { body: `Tem ${activeAlerts.length} alertas ativos.` });
      }
    }
  }, [orders, isMuted, dismissed]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const dismissAlert = (id) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-96">
      <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold">
          <Bell className="h-4 w-4" />
          Alertas Ativos ({alerts.length})
        </div>
        <Button variant="ghost" size="sm" onClick={toggleMute} className="text-gray-300 hover:text-white h-8 w-8 p-0">
          {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </Button>
      </div>
      <div className="overflow-y-auto p-2 space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-3 rounded border text-sm relative ${alert.type === 'overdue' ? 'bg-red-50 border-red-200' : alert.type === 'nearDeadline' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start gap-2 pr-6">
              {alert.type === 'overdue' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
              {alert.type === 'nearDeadline' && <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />}
              {alert.type === 'pending' && <Package className="h-4 w-4 text-blue-500 mt-0.5" />}
              <div>
                <p className="font-semibold text-gray-900">{alert.order.customer_name}</p>
                <p className="text-gray-600 text-xs">{alert.msg}</p>
              </div>
            </div>
            <button onClick={() => dismissAlert(alert.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-800">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertSystem;
