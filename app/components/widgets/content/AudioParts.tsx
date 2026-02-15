import React, { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useAudioStudioStore } from '@/store/audioStudioStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { WindowLayout, WindowToolbar, WindowContent } from '@/components/system/window/WindowLayout';
import playlistData from '@/../public/assets/json/playlist.json';

import styles from './AudioParts.module.scss';

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
  const [titlePhase, setTitlePhase] = useState(0); // 0: Now Playing, 1: Title, 2: Artist, 3: Time

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
  const setVolume = useAudioStudioStore(s => s.setVolume);
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

  // Rotate Title Phase
  useEffect(() => {
    if (!currentTrack) return;
    const interval = setInterval(() => {
      setTitlePhase((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTrack]);

  // Sync Window Title
  useEffect(() => {
    if (currentTrack) {
      let titleText = "";
      switch (titlePhase) {
        case 0: titleText = "▶ NOW PLAYING"; break;
        case 1: titleText = `🎵 ${currentTrack.title}`; break;
        case 2: titleText = `by ${currentTrack.artist}`; break;
        case 3: titleText = `${formatTime(currentTime)} / ${formatTime(duration)}`; break;
        default: titleText = "Audio Player";
      }
      updateWindowTitle(id, titleText);
    } else {
      updateWindowTitle(id, "Audio Player");
    }
  }, [currentTrack, id, updateWindowTitle, titlePhase, currentTime, duration]);

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
  }, [isPlaying, volume, setPlaying, currentTrack]);

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
    <WindowLayout className={`h-full w-full`}>
      {/* Toolbar with Transport Controls */}
      <WindowToolbar className="flex items-center justify-center gap-2 border-b border-gray-700 bg-gray-800/50 p-1">
        <button onClick={prevTrack} className="p-1 rounded transition-colors text-lg" title="Previous">
          ⏮
        </button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`${styles.playButton} p-1 rounded flex items-center justify-center transition-all min-w-[30px] ${isPlaying ? 'text-black' : 'border shadow-[0_0_2px_rgba(0,0,0,0.5)]'}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={nextTrack} className="p-1 rounded transition-colors text-lg" title="Next">
          ⏭
        </button>

        {/* Volume Control */}
        <div className={`flex items-center gap-2 ml-4 border-l border-gray-700 pl-4 ${styles.volumeControl}`}>
          <span className="text-xs">VOL</span>
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={`w-20 h-1 bg-gray-600 rounded-md appearance-none cursor-pointer accent-black ${styles.sliderInput}`}
          />
        </div>
      </WindowToolbar>

      <WindowContent padding="medium" className="flex flex-col gap-2">
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
        <div className={`flex justify-between text-xs ${styles.timeDisplay}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Progress Bar */}
        <input
          type="range"
          min="0" max="100"
          value={progress || 0}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full h-1 appearance-none cursor-pointer"
        />
      </WindowContent>
    </WindowLayout>
  );
};

// --- 3. EQ Mixer (Deprecated/Removed) ---
// Logic moved to Toolbar
export const EQMixer = () => null;
