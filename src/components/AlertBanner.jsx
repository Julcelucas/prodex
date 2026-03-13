
import React from 'react';
import { AlertTriangle, Clock, Info, BellOff, Bell, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AlertBanner = ({ alerts, mutedAlerts, muteAlert, unmuteAlert, muteAll, unmuteAll }) => {
  if (!alerts || alerts.length === 0) return null;

  const getAlertStyle = (type) => {
    switch(type) {
      case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-900';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'INFO': return 'bg-blue-50 border-blue-200 text-blue-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse-fast" />;
      case 'WARNING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'INFO': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const allMuted = alerts.every(a => mutedAlerts.includes(a.id));

  return (
    <div className="mb-6 rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-white">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          Alertas do Sistema
          <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {allMuted ? (
            <Button variant="ghost" size="sm" onClick={unmuteAll} className="text-gray-300 hover:text-white h-8">
              <Bell className="h-4 w-4 mr-2" /> Ativar Todos
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={muteAll} className="text-gray-300 hover:text-white h-8">
              <BellOff className="h-4 w-4 mr-2" /> Silenciar Todos
            </Button>
          )}
        </div>
      </div>
      <div className="p-2 max-h-60 overflow-y-auto space-y-2">
        {alerts.map(alert => {
          const isMuted = mutedAlerts.includes(alert.id);
          return (
            <div key={alert.id} className={`flex items-center justify-between p-3 rounded border text-sm ${getAlertStyle(alert.type)}`}>
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.type)}
                <div>
                  <span className="font-bold mr-2">{alert.deliveryId}</span>
                  <span className="font-medium mr-2">{alert.customerName}</span>
                  <span className="text-opacity-80">— {alert.reason}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => isMuted ? unmuteAlert(alert.id) : muteAlert(alert.id)}
              >
                {isMuted ? <BellOff className="h-4 w-4 opacity-50" /> : <Bell className="h-4 w-4" />}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertBanner;
