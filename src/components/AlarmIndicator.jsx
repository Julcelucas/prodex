import React from 'react';
import { Bell, BellOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pt } from '@/lib/translations';

const AlarmIndicator = ({ activeAlarms, isMuted, toggleMute }) => {
  const alarmCount = activeAlarms.length;

  if (alarmCount === 0) return null;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow-sm ${isMuted ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 animate-pulse'}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className={`h-5 w-5 ${isMuted ? 'text-gray-500' : 'text-red-600'}`} />
        <span className={`font-semibold ${isMuted ? 'text-gray-700' : 'text-red-700'}`}>
          {alarmCount} {pt.dashboard.activeAlarms}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleMute}
        className={isMuted ? 'text-gray-600' : 'text-red-600 border-red-200 hover:bg-red-100'}
      >
        {isMuted ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
        {isMuted ? pt.dashboard.unmuteAlarms : pt.dashboard.muteAlarms}
      </Button>
    </div>
  );
};

export default AlarmIndicator;