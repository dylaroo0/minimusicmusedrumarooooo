
import React, { useState, useCallback } from 'react';
import type { DrumControls, Status } from '../types';
import { DRUM_STYLE_PRESETS } from '../constants';
import { Button } from './Button';
import { SliderControl } from './SliderControl';
import { AnalyzeIcon, GenerateIcon, LoadingIcon, DownloadIcon } from './icons';

interface ControlsPanelProps {
  drumControls: DrumControls;
  onControlsChange: (controls: DrumControls) => void;
  onAnalyze: () => void;
  onGenerate: () => void;
  onExportMidi: () => void;
  isLoading: boolean;
  isAnalyzed: boolean;
  status: Status;
  hasAudio: boolean;
  hasPattern: boolean;
}

type Tab = 'quick' | 'fine-tune';

const statusColors = {
  info: 'text-blue-300',
  success: 'text-green-300',
  error: 'text-red-300',
  loading: 'text-yellow-300',
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  drumControls,
  onControlsChange,
  onAnalyze,
  onGenerate,
  onExportMidi,
  isLoading,
  isAnalyzed,
  status,
  hasAudio,
  hasPattern,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('quick');

  const handlePresetClick = (presetKey: string) => {
    const preset = DRUM_STYLE_PRESETS[presetKey];
    if (preset) {
      onControlsChange(preset);
    }
  };

  const handleSliderChange = useCallback((field: keyof DrumControls, value: number) => {
      onControlsChange({ ...drumControls, [field]: value });
  }, [drumControls, onControlsChange]);

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tabName
          ? 'bg-accent text-white shadow-md'
          : 'bg-slate-700/50 text-text-secondary hover:bg-slate-600/50'
      }`}
    >
      {label}
    </button>
  );
  
  return (
    <div className="p-4 sm:p-6 bg-panel-bg rounded-xl border border-panel-border shadow-lg backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <TabButton tabName="quick" label="Quick Generate" />
            <TabButton tabName="fine-tune" label="Fine-Tune" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onAnalyze} disabled={!hasAudio || isLoading}>
                <AnalyzeIcon className="w-5 h-5" />
                {isAnalyzed ? 'Re-Analyze' : 'Analyze'}
            </Button>
            <Button onClick={onGenerate} disabled={!isAnalyzed || isLoading}>
                <GenerateIcon className="w-5 h-5" />
                Generate
            </Button>
            <Button onClick={onExportMidi} disabled={!hasPattern || isLoading}>
                <DownloadIcon className="w-5 h-5" />
                Export
            </Button>
        </div>
      </div>
      
      {activeTab === 'quick' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 pt-2">
            {Object.entries(DRUM_STYLE_PRESETS).map(([key, preset]) => (
                <button
                    key={key}
                    onClick={() => handlePresetClick(key)}
                    disabled={isLoading}
                    className="p-3 bg-slate-800 rounded-lg text-text-primary font-medium hover:bg-accent hover:text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-sm text-center"
                >
                    {preset.style}
                </button>
            ))}
        </div>
      )}

      {activeTab === 'fine-tune' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 pt-4">
            <SliderControl label="Complexity" value={drumControls.complexity} onChange={(v) => handleSliderChange('complexity', v)} />
            <SliderControl label="Intensity" value={drumControls.intensity} onChange={(v) => handleSliderChange('intensity', v)} />
            <SliderControl label="Fill Frequency" value={drumControls.fillFrequency} onChange={(v) => handleSliderChange('fillFrequency', v)} />
            <SliderControl label="Syncopation" value={drumControls.syncopation} onChange={(v) => handleSliderChange('syncopation', v)} />
            <SliderControl label="Swing" value={drumControls.swing} onChange={(v) => handleSliderChange('swing', v)} />
            <div className="flex items-center justify-center p-2 rounded-lg">
                <label htmlFor="intro-fill" className="flex items-center justify-between cursor-pointer w-full">
                    <span className="font-medium text-text-secondary">Intro Fill</span>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="intro-fill" 
                            className="sr-only peer" 
                            checked={drumControls.introFill}
                            onChange={(e) => onControlsChange({ ...drumControls, introFill: e.target.checked })}
                        />
                        <div className="block bg-slate-700 w-12 h-7 rounded-full peer-checked:bg-accent transition"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                </label>
            </div>
        </div>
      )}
      
      {status.message && (
        <div className="pt-4 mt-4 border-t border-panel-border">
          <div className="flex items-center gap-3">
             {status.type === 'loading' && <LoadingIcon className="w-4 h-4 animate-spin text-yellow-300" />}
             <p className={`text-sm ${statusColors[status.type]}`}>{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};