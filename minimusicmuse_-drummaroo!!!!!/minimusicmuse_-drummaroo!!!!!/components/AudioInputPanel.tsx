
import React, { useCallback } from 'react';
import type { DrumControls } from '../types';
import { DRUM_STYLE_PRESETS } from '../constants';
import { Button } from './Button';
import { SliderControl } from './SliderControl';
import { UploadIcon, AnalyzeIcon, GenerateIcon } from './icons';

interface AudioInputPanelProps {
  audioFile: File | null;
  onFileChange: (file: File) => void;
  drumControls: DrumControls;
  onControlsChange: (controls: DrumControls) => void;
  onAnalyze: () => void;
  onGenerate: () => void;
  isLoading: boolean;
  isAnalyzed: boolean;
}

export const AudioInputPanel: React.FC<AudioInputPanelProps> = ({
  audioFile,
  onFileChange,
  drumControls,
  onControlsChange,
  onAnalyze,
  onGenerate,
  isLoading,
  isAnalyzed,
}) => {

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = DRUM_STYLE_PRESETS[e.target.value];
    if (preset) {
      onControlsChange(preset);
    }
  };

  const handleSliderChange = useCallback((field: keyof DrumControls, value: number) => {
      onControlsChange({ ...drumControls, [field]: value });
  }, [drumControls, onControlsChange]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 bg-panel-bg rounded-xl border border-panel-border shadow-lg backdrop-blur-sm space-y-6 h-full overflow-y-auto">
      <div>
        <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <UploadIcon className="w-6 h-6" />
          Upload &amp; Analyze
        </h3>
        <input
          type="file"
          id="audio-file"
          className="hidden"
          accept="audio/mp3, audio/wav, audio/flac, audio/m4a"
          onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
          disabled={isLoading}
        />
        <label
          htmlFor="audio-file"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isLoading ? 'border-gray-600 bg-gray-800/50' : 'border-accent/50 hover:border-accent hover:bg-accent/10'}`}
        >
          <UploadIcon className="w-10 h-10 text-text-secondary mb-3" />
          <span className="text-center text-text-secondary">
            {audioFile ? audioFile.name : 'Drag & drop or click to upload'}
          </span>
          <span className="text-xs text-gray-400 mt-1">Max 50MB | MP3, WAV, FLAC, M4A</span>
        </label>
      </div>

      <div>
        <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
          <GenerateIcon className="w-6 h-6" />
          Drum Customization
        </h3>
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SliderControl
                    label="Complexity"
                    value={drumControls.complexity}
                    onChange={(val) => handleSliderChange('complexity', val)}
                    min={0} max={100} step={5}
                />
                <SliderControl
                    label="Intensity"
                    value={drumControls.intensity}
                    onChange={(val) => handleSliderChange('intensity', val)}
                    min={0} max={100} step={5}
                />
                <SliderControl
                    label="Fill Frequency"
                    value={drumControls.fillFrequency}
                    onChange={(val) => handleSliderChange('fillFrequency', val)}
                    min={0} max={100} step={5}
                />
                 <SliderControl
                    label="Syncopation"
                    value={drumControls.syncopation}
                    onChange={(val) => handleSliderChange('syncopation', val)}
                    min={0} max={100} step={5}
                />
                <SliderControl
                    label="Swing"
                    value={drumControls.swing}
                    onChange={(val) => handleSliderChange('swing', val)}
                    min={0} max={100} step={5}
                />
                <div className="flex items-center justify-center p-2 rounded-lg">
                   <label htmlFor="intro-fill" className="flex items-center justify-between cursor-pointer w-full">
                        <span className="font-medium text-text-secondary">Intro Drum Fill</span>
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
             <div>
              <label htmlFor="drum-style" className="block text-sm font-medium text-text-secondary mb-1 mt-4">Drum Style</label>
              <select
                id="drum-style"
                value={Object.keys(DRUM_STYLE_PRESETS).find(key => DRUM_STYLE_PRESETS[key].style === drumControls.style) || 'acoustic'}
                onChange={handlePresetChange}
                className="w-full bg-slate-800 border border-panel-border rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
              >
                {Object.entries(DRUM_STYLE_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.style}</option>
                ))}
              </select>
            </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onAnalyze}
          disabled={!audioFile || isLoading}
          className="w-full"
        >
          <AnalyzeIcon className="w-5 h-5" />
          {isAnalyzed ? 'Re-Analyze' : 'Analyze Music'}
        </Button>
        <Button
          onClick={onGenerate}
          disabled={!isAnalyzed || isLoading}
          className="w-full"
        >
          <GenerateIcon className="w-5 h-5" />
          Generate Drums
        </Button>
      </div>
    </div>
  );
};
