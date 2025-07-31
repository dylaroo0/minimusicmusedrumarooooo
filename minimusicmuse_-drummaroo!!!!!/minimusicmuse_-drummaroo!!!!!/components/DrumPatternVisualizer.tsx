
import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import type { DrumPattern, MusicAnalysis, DrumHit, DrumInstrument } from '../types';
import { DRUM_INSTRUMENTS, INSTRUMENT_LABELS, DEFAULT_INSTRUMENT_COLORS } from '../constants';
import { Button } from './Button';
import { DownloadIcon, NoteIcon } from './icons';

interface DrumPatternVisualizerProps {
  generatedResult: { pattern: DrumPattern } | null;
  analysis: MusicAnalysis | null;
  audioDuration: number;
  onExportMidi: () => void;
  isLoading: boolean;
  currentTime: number;
  isPlaying: boolean;
}

const Lane: React.FC<{
  instrument: DrumInstrument;
  hits: DrumHit[];
  duration: number;
  color: string;
}> = React.memo(({ instrument, hits, duration, color }) => (
  <div className="relative h-8 border-b border-slate-700/50">
    {hits.map(hit => (
      <div
        key={`${instrument}-${hit.time}`}
        title={`${instrument} at ${hit.time.toFixed(2)}s, velocity: ${hit.velocity.toFixed(2)}`}
        className="absolute top-0 h-full rounded-sm"
        style={{
          left: `${(hit.time / duration) * 100}%`,
          width: '0.5%',
          minWidth: '2px',
          backgroundColor: color,
          opacity: 0.5 + hit.velocity * 0.5,
        }}
      />
    ))}
  </div>
));

const TimeRuler: React.FC<{ duration: number, containerWidth: number }> = React.memo(({ duration, containerWidth }) => {
    if (duration === 0 || containerWidth === 0) return null;
    const tickInterval = containerWidth > 500 ? 60 : 100;
    const numTicks = Math.max(1, Math.floor(containerWidth / tickInterval));
    const ticks = Array.from({ length: numTicks + 1 }, (_, i) => {
        const time = (i / numTicks) * duration;
        return {
            time: time,
            label: `${Math.round(time)}s`,
            left: `${(i / numTicks) * 100}%`
        };
    });

    return (
        <div className="relative h-6 border-b-2 border-slate-600">
            {ticks.map(tick => (
                <div key={tick.time} className="absolute top-0 h-full text-xs text-text-secondary" style={{ left: tick.left }}>
                    <span className="absolute -top-0.5">{tick.label}</span>
                    <div className="h-full w-px bg-slate-600/50"></div>
                </div>
            ))}
        </div>
    );
});

export const DrumPatternVisualizer: React.FC<DrumPatternVisualizerProps> = ({
  generatedResult,
  analysis,
  audioDuration,
  onExportMidi,
  isLoading,
  currentTime,
  isPlaying,
}) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
        if(entries[0]) {
            setContainerWidth(entries[0].contentRect.width);
        }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const hitsByInstrument = useMemo(() => {
    const grouped: { [key: string]: DrumHit[] } = {};
    if (!generatedResult) return grouped;
    for (const hit of generatedResult.pattern.pattern) {
      if (!grouped[hit.instrument]) {
        grouped[hit.instrument] = [];
      }
      grouped[hit.instrument].push(hit);
    }
    return grouped;
  }, [generatedResult]);

  const playheadPosition = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 bg-panel-bg rounded-xl border border-panel-border shadow-lg backdrop-blur-sm space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <h3 className="text-xl font-bold text-accent flex items-center gap-2">
          <NoteIcon className="w-6 h-6" />
          Drum Pattern
        </h3>
        <Button onClick={onExportMidi} disabled={!generatedResult || isLoading}>
          <DownloadIcon className="w-5 h-5 mr-2" />
          Export MIDI
        </Button>
      </div>

      <div className="flex-grow flex bg-slate-900/50 rounded-lg p-2 overflow-hidden border border-panel-border relative">
          <div className="w-28 flex-shrink-0">
             <div className="h-6"></div> {/* Spacer for ruler */}
             {DRUM_INSTRUMENTS.map(instrument => (
                 <div key={instrument} className="h-8 flex items-center pr-2 text-sm text-text-secondary font-medium truncate border-b border-transparent">
                     {INSTRUMENT_LABELS[instrument]}
                 </div>
             ))}
          </div>
          <div ref={containerRef} className="flex-grow overflow-x-auto relative">
             <TimeRuler duration={audioDuration} containerWidth={containerWidth} />
             {DRUM_INSTRUMENTS.map(instrument => (
                 <Lane
                    key={instrument}
                    instrument={instrument as DrumInstrument}
                    hits={hitsByInstrument[instrument] || []}
                    duration={audioDuration}
                    color={DEFAULT_INSTRUMENT_COLORS[instrument]}
                 />
             ))}
             {isPlaying && (
                <div className="absolute top-6 bottom-0 w-0.5 bg-accent/80 shadow-glow pointer-events-none"
                    style={{ left: `${playheadPosition}%` }}>
                </div>
             )}
          </div>
          {!generatedResult && !isLoading && (
            <div className="absolute inset-0 bg-panel-bg/80 flex items-center justify-center rounded-xl pointer-events-none">
                <p className="text-text-secondary text-lg">Your generated drum pattern will appear here.</p>
            </div>
          )}
           {isLoading && !generatedResult && (
            <div className="absolute inset-0 bg-panel-bg/80 flex items-center justify-center rounded-xl pointer-events-none">
                <p className="text-text-secondary text-lg">Generating drums...</p>
            </div>
          )}
      </div>
    </div>
  );
};
