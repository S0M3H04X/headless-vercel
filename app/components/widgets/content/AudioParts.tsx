import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useAudioStudioStore } from '@/store/audioStudioStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { WindowLayout, WindowToolbar, WindowContent } from '@/components/system/window/WindowLayout';
import playlistData from '@/../public/assets/json/playlist.json';

// --- Schemas ---
const VisualiserStateSchema = z.object({
  showOverlay: z.boolean().default(true),
});

// --- 1. Visualiser (Deprecated/Removed) ---
// Logic moved to PlaybackController
export const Visualiser = () => null;

// --- 2. Playback Controller ---
// --- 2. Playback Controller ---
export const PlaybackController = ({ id }: BaseWidgetProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { updateWindowTitle } = useWorkspaceStore();

  // Use a stable selector or separate hooks to avoid re-renders loop
  const isPlaying = useAudioStudioStore(s => s.isPlaying);
  const progress = useAudioStudioStore(s => s.progress);
  const currentTime = useAudioStudioStore(s => s.currentTime);
  const duration = useAudioStudioStore(s => s.duration);
  const volume = useAudioStudioStore(s => s.volume);
  const currentTrack = useAudioStudioStore(s => s.playlist[s.currentIndex]);
  const storedTime = useAudioStudioStore(s => s.currentTime);

  const setPlaying = useAudioStudioStore(s => s.setPlaying);
  const setProgress = useAudioStudioStore(s => s.setProgress);
  const nextTrack = useAudioStudioStore(s => s.nextTrack);
  const prevTrack = useAudioStudioStore(s => s.prevTrack);
  const registerAudio = useAudioStudioStore(s => s.registerAudio);
  const setDuration = useAudioStudioStore(s => s.setDuration);
  const setPlaylist = useAudioStudioStore(s => s.setPlaylist);
  const setVisualiserActive = useAudioStudioStore(s => s.setVisualiserActive);

  // Initialize Playlist
  useEffect(() => {
    setPlaylist(playlistData);
  }, [setPlaylist]);

  // Sync Window Title
  useEffect(() => {
    if (currentTrack) {
      updateWindowTitle(id, `🎵 ${currentTrack.artist} - ${currentTrack.title}`);
    } else {
      updateWindowTitle(id, "Audio Player");
    }
  }, [currentTrack, id, updateWindowTitle]);

  // Register Audio Element
  useEffect(() => {
    if (audioRef.current) registerAudio(audioRef.current);
    return () => registerAudio(null);
  }, [registerAudio]);

  // Visualiser Active State (Active while Controller is open)
  useEffect(() => {
    setVisualiserActive(true);
    return () => setVisualiserActive(false);
  }, [setVisualiserActive]);

  // Sync Volume & Playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Autoplay prevented or failed:", error);
            setPlaying(false);
          });
        }
      } else if (!isPlaying && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      audioRef.current.volume = volume;
    }
  }, [isPlaying, volume, setPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration > 0) {
      useAudioStudioStore.setState({
        progress: (currentTime / duration) * 100,
        currentTime
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      setDuration(audio.duration);
      // Only restore if significant difference (avoid loops at 0)
      if (Math.abs(audio.currentTime - storedTime) > 0.5) {
        audio.currentTime = storedTime;
      }
    }
  };

  const handleEnded = () => {
    nextTrack();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync Title & Portal Target Removed



  return (
    <WindowLayout className="h-full w-full bg-gray-900 border-t-4 border-green-500 font-mono text-white">
      {/* Toolbar with Transport Controls */}
      <WindowToolbar className="flex items-center justify-center gap-2 border-b border-gray-700 bg-gray-800/50 p-1">
        <button onClick={prevTrack} className="hover:bg-gray-700 p-1 rounded transition-colors text-lg" title="Previous">
          ⏮
        </button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`p-1 rounded font-bold flex items-center justify-center transition-all min-w-[60px] ${isPlaying ? 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_10px_rgba(0,255,0,0.5)]' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button onClick={nextTrack} className="hover:bg-gray-700 p-1 rounded transition-colors text-lg" title="Next">
          ⏭
        </button>
      </WindowToolbar>

      <WindowContent className="p-4 flex flex-col gap-2">
        {/* Hidden Audio Element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}



        {/* Time Display */}
        <div className="flex justify-between text-xs font-digital text-green-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Progress Bar */}
        <input
          type="range"
          min="0" max="100"
          value={progress || 0}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </WindowContent>
    </WindowLayout>
  );
};

// --- 3. EQ Mixer (Volume) ---
export const EQMixer = () => {
  const { volume, setVolume } = useAudioStudioStore();

  return (
    <div className="h-full w-full bg-gray-800 p-4 flex flex-col items-center gap-2 text-white border-t-4 border-blue-500">
      <span className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">MAIN VOL</span>
      <div className="relative h-full w-12 bg-black rounded-lg overflow-hidden border border-gray-700 group">
        {/* Volume Level Visualization */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 via-cyan-400 to-white transition-all duration-75 ease-out opacity-80 group-hover:opacity-100"
          style={{ height: `${volume * 100}%` }}
        >
          <div className="w-full h-px bg-white/50 absolute top-0"></div>
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-1 pointer-events-none opacity-30">
          {[...Array(10)].map((_, i) => <div key={i} className="w-full h-px bg-gray-500"></div>)}
        </div>

        {/* Slider Overlay */}
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
          style={{ appearance: 'slider-vertical' } as any} // Webkit hack, though overlay div works better usually
        />
        {/* Standard Range Input Hack for verticality if above doesn't work well */}
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-[500%] h-[200%] opacity-0 cursor-pointer -rotate-90 origin-top-left translate-y-[100%]"
          style={{ width: '100vh', height: '100px' }} // Large hit area
        />

      </div>
      <span className="font-mono text-xs text-cyan-300 mt-2">{Math.round(volume * 100)}%</span>
    </div>
  );
};
