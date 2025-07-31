
import React from 'react';
import type { MusicAnalysis } from '../types';
import { AnalysisIcon } from './icons';

interface AnalysisPanelProps {
  analysis: MusicAnalysis | null;
  isLoading: boolean;
  audioDuration: number;
}

const AnalysisCard: React.FC<{ title: string; value: React.ReactNode; unit?: string }> = ({ title, value, unit }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg text-center border border-transparent hover:border-accent/50 transition-all duration-300">
    <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
    <p className="text-2xl font-bold text-text-primary">{value ?? '...'}</p>
    {unit && <p className="text-xs text-text-secondary">{unit}</p>}
  </div>
);


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, audioDuration }) => {
  return (
    <div className="p-6 bg-panel-bg rounded-xl border border-panel-border shadow-lg backdrop-blur-sm space-y-6 h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <AnalysisIcon className="w-6 h-6" />
          Analysis Results
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <AnalysisCard title="Tempo" value={analysis?.bpm} unit="BPM" />
            <AnalysisCard title="Key" value={analysis?.key} />
            <AnalysisCard title="Time Sig" value={analysis?.timeSignature} />
            <AnalysisCard title="Start Time" value={analysis?.startTime?.toFixed(2)} unit="seconds" />
            <AnalysisCard title="Duration" value={audioDuration > 0 ? audioDuration.toFixed(1) : '--'} unit="seconds" />
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center text-text-secondary text-center p-4">
        {isLoading && !analysis && (
          <p>Analyzing musical properties...</p>
        )}
        {!analysis && !isLoading && (
          <p>Analysis results will appear here after processing.</p>
        )}
        {analysis && (
          <div className="space-y-2">
             <h4 className="font-semibold text-text-primary text-lg">Musical Context</h4>
             <p><span className="font-medium text-text-secondary">Mood:</span> {analysis.mood}</p>
             <p><span className="font-medium text-text-secondary">Rhythmic Feel:</span> {analysis.rhythmicFeel}</p>
             <p><span className="font-medium text-text-secondary">Main Instruments:</span> {analysis.mainInstruments.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
