
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { ControlsPanel } from './components/ControlsPanel';
import { HarmonyWheel } from './components/HarmonyWheel';
import type { MusicAnalysis, DrumControls, DrumPattern, Status, DrumSamples } from './types';
import { analyzeMusic, generateDrums } from './services/geminiService';
import { exportToMidi } from './services/midiExporter';
import { audioPlayerService } from './services/audioPlayerService';
import { DRUM_STYLE_PRESETS } from './constants';
import { DRUM_SAMPLES } from './samples';


const App: React.FC = () => {
  const [status, setStatus] = useState<Status>({ message: 'Welcome! Please upload an audio file to begin.', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MusicAnalysis | null>(null);
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioB64, setAudioB64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const [drumControls, setDrumControls] = useState<DrumControls>(DRUM_STYLE_PRESETS.acoustic);
  const [drumPattern, setDrumPattern] = useState<DrumPattern | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [drumVolume, setDrumVolume] = useState(0.8);
  
  const playerRef = useRef(audioPlayerService);

  useEffect(() => {
    const player = playerRef.current;
    player.onTimeUpdate = setCurrentTime;
    player.onEnded = () => setIsPlaying(false);
    player.loadSamples(DRUM_SAMPLES as DrumSamples).catch(err => {
        console.error("Sample loading failed:", err);
        setStatus({message: "Error loading drum sounds. Playback may not work.", type: 'error'});
    });

    return () => {
      player.cleanup();
    };
  }, []);

  const resetStateForNewFile = () => {
      setStatus({ message: 'Ready to analyze new file.', type: 'info' });
      setAnalysis(null);
      setDrumPattern(null);
      setAudioDuration(0);
      setCurrentTime(0);
      setIsPlaying(false);
      playerRef.current.stop();
  };

  const handleFileChange = useCallback((file: File) => {
    setIsLoading(true);
    resetStateForNewFile();
    setAudioFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = (e.target?.result as string).split(',')[1];
      setAudioB64(b64);
      setAudioMimeType(file.type);
      
      const duration = await playerRef.current.loadAudio(e.target?.result as string);
      setAudioDuration(duration);
      
      setStatus({ message: `Loaded '${file.name}'. Ready to analyze.`, type: 'info' });
      setIsLoading(false);
    };
    reader.onerror = () => {
      setStatus({ message: 'Error reading file.', type: 'error' });
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!audioB64 || !audioMimeType) {
      setStatus({ message: 'No audio file loaded.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatus({ message: 'Analyzing music...', type: 'loading' });
    try {
      const analysisResult = await analyzeMusic(audioB64, audioMimeType);
      setAnalysis(analysisResult);
      setStatus({ message: 'Analysis complete. Ready to generate drums.', type: 'success' });
    } catch (error) {
      console.error(error);
      setStatus({ message: 'Failed to analyze music. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [audioB64, audioMimeType]);

  const handleGenerate = useCallback(async () => {
    if (!analysis || !audioDuration) {
      setStatus({ message: 'Please analyze the music first.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatus({ message: 'Generating drum pattern...', type: 'loading' });
    try {
      const patternResult = await generateDrums(analysis, drumControls, audioDuration);
      setDrumPattern(patternResult);
      playerRef.current.setDrumPattern(patternResult);
      setStatus({ message: 'Drum pattern generated successfully!', type: 'success' });
    } catch (error) {
      console.error(error);
      setStatus({ message: 'Failed to generate drums. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [analysis, drumControls, audioDuration]);
  

  const handleExportMidi = useCallback(() => {
    if (!drumPattern || !analysis) {
      setStatus({ message: 'No drum pattern to export.', type: 'error' });
      return;
    }
    try {
        const midiData = exportToMidi(drumPattern, analysis.bpm);
        const blob = new Blob([midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${audioFile?.name.split('.')[0]}_drums.mid` || 'drums.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus({ message: 'MIDI file exported.', type: 'success' });
    } catch (error) {
        console.error("MIDI Export Error:", error);
        setStatus({ message: 'Failed to export MIDI.', type: 'error' });
    }
  }, [drumPattern, analysis, audioFile]);

  const handlePlayPause = useCallback(() => {
    if (!audioFile) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, audioFile]);

  const handleSeek = useCallback((time: number) => {
    if (!audioFile) return;
    playerRef.current.seek(time);
    setCurrentTime(time);
  }, [audioFile]);
  
  const handleVolumeChange = useCallback((volume: number) => {
    playerRef.current.setDrumVolume(volume);
    setDrumVolume(volume);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8">
      <TopBar
        audioFile={audioFile}
        onFileChange={handleFileChange}
        isLoading={isLoading}
        drumVolume={drumVolume}
        onVolumeChange={handleVolumeChange}
        analysis={analysis}
      />
      
      <main className="flex-grow flex flex-col items-center justify-center gap-6 w-full max-w-7xl mx-auto">
        <HarmonyWheel
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          currentTime={currentTime}
          duration={audioDuration}
          onSeek={handleSeek}
          analysis={analysis}
          isLoading={isLoading}
          hasAudio={!!audioFile}
        />
        
        <ControlsPanel
            drumControls={drumControls}
            onControlsChange={setDrumControls}
            onAnalyze={handleAnalyze}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isAnalyzed={!!analysis}
            status={status}
            hasAudio={!!audioFile}
            onExportMidi={handleExportMidi}
            hasPattern={!!drumPattern}
        />
      </main>
    </div>
  );
};

export default App;
