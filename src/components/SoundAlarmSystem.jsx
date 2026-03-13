
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { getSoundSettingsSnapshot, setSoundSettingsSnapshot, useProdexStore } from '@/lib/prodex-store';

export const playSound = (type, customVolume = null) => {
  const soundSettings = getSoundSettingsSnapshot();
  if (soundSettings.muted) return;
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const freq = type === 'CRITICAL' ? 800 : type === 'WARNING' ? 1000 : 600;
    const duration = type === 'CRITICAL' ? 2 : type === 'WARNING' ? 1.5 : 1;
    
    const vol = customVolume !== null ? customVolume : soundSettings.volume;
    if (vol <= 0) return;
    
    for(let i = 0; i < 3; i++) {
      const start = ctx.currentTime + (i * (duration + 0.3));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type === 'CRITICAL' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      if (type === 'CRITICAL') {
        osc.frequency.exponentialRampToValueAtTime(1200, start + duration/2);
      }
      
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const SoundAlarmSystem = () => {
  const soundSettings = useProdexStore((state) => state.sound);
  const [isPlaying, setIsPlaying] = useState(false);
  const volume = Math.round(soundSettings.volume * 100);
  const isMuted = soundSettings.muted;

  const handleTest = () => {
    setIsPlaying(true);
    playSound('CRITICAL', volume / 100);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={isPlaying ? 'destructive' : 'outline'} 
          size="sm" 
          className={`text-xs gap-2 transition-colors ${isPlaying ? 'animate-flash' : ''}`}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span className="hidden sm:inline">Alertas Sonoros</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Configuração de Áudio</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => setSoundSettingsSnapshot({ ...soundSettings, muted: !isMuted })}
            >
              {isMuted ? 'Desmutar' : 'Silenciar'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Volume ({volume}%)</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={(vals) => {
                setSoundSettingsSnapshot({
                  ...soundSettings,
                  volume: vals[0] / 100,
                  muted: false,
                });
              }}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full mt-2" 
            onClick={handleTest}
            disabled={isMuted}
          >
            Testar Som Crítico
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SoundAlarmSystem;
