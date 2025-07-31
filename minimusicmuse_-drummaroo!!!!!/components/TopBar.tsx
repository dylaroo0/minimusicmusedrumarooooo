
import React from 'react';
import { LogoIcon, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon, UploadIcon } from './icons';
import type { MusicAnalysis } from '../types';

interface TopBarProps {
  audioFile: File | null;
  onFileChange: (file: File) => void;
  isLoading: boolean;
  drumVolume: number;
  onVolumeChange: (volume: number) => void;
  analysis: MusicAnalysis | null;
}

const VolumeControl: React.FC<{ volume: number, onVolumeChange: (v: number) => void }> = ({ volume, onVolumeChange }) => {
    const VolumeIcon = volume === 0 ? VolumeOffIcon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;
    return (
        <div className="flex items-center gap-2 group">
            <VolumeIcon className="w-6 h-6 text-text-secondary transition-colors group-hover:text-text-primary" />
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-24 accent-accent cursor-pointer"
            />
        </div>
    );
};

export const TopBar: React.FC<TopBarProps> = ({
  audioFile, onFileChange, isLoading, drumVolume, onVolumeChange, analysis
}) => {
  const hasAudio = !!audioFile;

  return (
    <header className="w-full max-w-7xl mx-auto bg-panel-bg p-3 sm:p-4 rounded-xl border border-panel-border shadow-lg backdrop-blur-sm flex items-center justify-between gap-4">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <LogoIcon className="w-8 h-8 text-accent" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-accent to-blue-300 text-transparent bg-clip-text">
          DrummAroo
        </h1>
      </div>

      {/* Right: Info, Volume, Upload */}
      <div className="flex items-center gap-4 sm:gap-6">
        {analysis && (
            <div className="hidden sm:flex gap-4 text-center">
                <div>
                    <div className="text-xs text-text-secondary">BPM</div>
                    <div className="font-bold text-text-primary">{analysis.bpm}</div>
                </div>
                <div>
                    <div className="text-xs text-text-secondary">Key</div>
                    <div className="font-bold text-text-primary">{analysis.key}</div>
                </div>
            </div>
        )}
        
        {hasAudio && <VolumeControl volume={drumVolume} onVolumeChange={onVolumeChange} />}
        
        <label htmlFor="audio-upload" className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${isLoading ? 'bg-gray-600' : 'bg-accent hover:bg-accent-dark'}`}>
            <UploadIcon className="w-5 h-5" />
            <span className="text-white font-medium text-sm sm:text-base">{audioFile ? 'New File' : 'Upload'}</span>
            <input
                id="audio-upload"
                type="file"
                className="hidden"
                accept="audio/mp3, audio/wav, audio/flac, audio/m4a"
                onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
                disabled={isLoading}
            />
        </label>
      </div>
    </header>
  );
};
