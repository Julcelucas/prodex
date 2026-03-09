
import { useState, useEffect, useCallback } from 'react';

// A simple beep using Web Audio API
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 880; // High beep
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Low volume
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
  } catch (e) {
    console.log('Audio playback failed or not allowed yet', e);
  }
};

export const useAlarmSystem = (orders) => {
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlarms, setActiveAlarms] = useState([]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const now = new Date().getTime();
    
    // RED: Overdue or < 24h
    // YELLOW: < 48h
    // Active if status is 'pendente'
    
    const triggeringOrders = orders.filter(o => {
      if (o.status !== 'pendente') return false;
      const deliveryTime = new Date(o.desired_delivery_time).getTime();
      const hoursLeft = (deliveryTime - now) / (1000 * 60 * 60);
      return hoursLeft < 48; // Any order under 48h or overdue triggers alarm
    });

    setActiveAlarms(triggeringOrders);

    if (triggeringOrders.length > 0 && !isMuted) {
      // Play sound every 10 seconds if there are alarms
      playBeep();
      const interval = setInterval(playBeep, 10000);
      return () => clearInterval(interval);
    }
  }, [orders, isMuted]);

  return { activeAlarms, isMuted, toggleMute };
};

export const getOrderPriority = (desiredDeliveryTime, status) => {
  if (status === 'entregue' || status === 'cancelado') return 'gray';
  
  const now = new Date().getTime();
  const deliveryTime = new Date(desiredDeliveryTime).getTime();
  const hoursLeft = (deliveryTime - now) / (1000 * 60 * 60);

  if (hoursLeft < 24) return 'red';
  if (hoursLeft < 48) return 'yellow';
  return 'green';
};
