
import React from 'react';
import { DRUM_INSTRUMENTS, INSTRUMENT_LABELS } from '../constants';
import { PaletteIcon } from './icons';

interface VisualCustomizerPanelProps {
  colors: { [key: string]: string };
  onColorChange: (instrument: string, color: string) => void;
}

export const VisualCustomizerPanel: React.FC<VisualCustomizerPanelProps> = ({ colors, onColorChange }) => {
  return (
    <div className="p-6 bg-panel-bg rounded-xl border border-panel-border shadow-lg backdrop-blur-sm space-y-4 h-full overflow-y-auto">
      <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
        <PaletteIcon className="w-6 h-6" />
        Visual Customizer
      </h3>
      <p className="text-sm text-text-secondary -mt-2 mb-4">
        Customize the colors for each drum instrument. Changes are saved automatically.
      </p>
      <div className="space-y-3">
        {DRUM_INSTRUMENTS.map((instrument) => (
          <div key={instrument} className="flex items-center justify-between">
            <label htmlFor={`color-${instrument}`} className="text-text-primary font-medium">
              {INSTRUMENT_LABELS[instrument]}
            </label>
            <div className="relative">
              <input
                type="color"
                id={`color-${instrument}`}
                value={colors[instrument] || '#ffffff'}
                onChange={(e) => onColorChange(instrument, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-24 h-8 rounded-md border border-panel-border"
                style={{ backgroundColor: colors[instrument] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
