
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon, PauseIcon, LoadingIcon } from './icons';
import { DEFAULT_INSTRUMENT_COLORS } from '../constants';
import type { DrumPattern, DrumHit } from '../types';

interface CircularVisualizerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  drumPattern: DrumPattern | null;
  isLoading: boolean;
}

interface Pulse {
  id: number;
  instrument: string;
  color: string;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

export const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  drumPattern,
  isLoading
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const lastCheckedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!drumPattern || currentTime < lastCheckedTimeRef.current) {
        lastCheckedTimeRef.current = 0; // Reset on seek backwards or new pattern
    }
    
    if (drumPattern?.pattern) {
        const newHits = drumPattern.pattern.filter(
            hit => hit.time >= lastCheckedTimeRef.current && hit.time < currentTime
        );
        
        if (newHits.length > 0) {
            const newPulses = newHits.map(hit => ({
                id: Math.random(),
                instrument: hit.instrument,
                color: DEFAULT_INSTRUMENT_COLORS[hit.instrument] || '#ffffff'
            }));
            setPulses(prev => [...prev, ...newPulses]);
            
            // Cleanup pulses after animation
            newPulses.forEach(pulse => {
                setTimeout(() => {
                    setPulses(currentPulses => currentPulses.filter(p => p.id !== pulse.id));
                }, 1000);
            });
        }
    }
    lastCheckedTimeRef.current = currentTime;
  }, [currentTime, drumPattern]);

  const handleSeek = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || duration === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
    const normalizedAngle = (angle + 360) % 360;
    
    const newTime = (normalizedAngle / 360) * duration;
    onSeek(newTime);
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 359.99 : 0;
  const progressPath = describeArc(50, 50, 42, 0, progress);

  const handlePos = polarToCartesian(50, 50, 42, progress);

  return (
    <div className="relative w-full max-w-sm aspect-square">
        <style>{`
            .pulse-anim {
                animation: pulse 1s ease-out forwards;
            }
            @keyframes pulse {
                0% { r: 5; opacity: 0.7; }
                100% { r: 40; opacity: 0; }
            }
        `}</style>
        <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full cursor-pointer">
            {/* Background track */}
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
            
            {/* Progress track */}
            <path d={progressPath} stroke="var(--color-accent)" strokeWidth="4" fill="none" strokeLinecap="round" />
            
            {/* Seek handle */}
            <circle cx={handlePos.x} cy={handlePos.y} r="5" fill="var(--color-accent)" />

            {/* Pulses */}
            {pulses.map(pulse => (
                <circle
                    key={pulse.id}
                    cx="50"
                    cy="50"
                    r="5"
                    fill={pulse.color}
                    className="pulse-anim pointer-events-none"
                />
            ))}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isLoading ? (
                <LoadingIcon className="w-16 h-16 text-accent animate-spin" />
            ) : (
                <button
                    onClick={onPlayPause}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-accent/20 backdrop-blur-sm text-accent flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 shadow-lg hover:shadow-glow"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <PauseIcon className="w-12 h-12" /> : <PlayIcon className="w-12 h-12 pl-2" />}
                </button>
            )}
        </div>
    </div>
  );
};
