'use client';
import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useVideoStudioStore } from '@/store/videoStudioStore';
import { BaseWidgetProps } from '@/lib/types/workspace';

// --- 定義 Schemas ---
// 即使目前是空的，定義出來也能防止未來擴充時忘記
const VisualiserStateSchema = z.object({
  showOverlay: z.boolean().default(true), // 範例：控制是否顯示 "LIVE FEED" 文字
});

const ControllerStateSchema = z.object({}); // 目前無內部狀態
const MixerStateSchema = z.object({});      // 目前無內部狀態

// --- 1. Visualiser (負責播放與畫面) ---
export const Visualiser = ({ content, internalState }: BaseWidgetProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const state = useWidgetState(internalState, VisualiserStateSchema, { showOverlay: true });

  const storedTime = useVideoStudioStore(s => s.currentTime);
  const registerVideo = useVideoStudioStore((s) => s.registerVideo);
  const setPlaying = useVideoStudioStore((s) => s.setPlaying);
  // const setProgress = useVideoStudioStore((s) => s.setProgress);
  const setDuration = useVideoStudioStore((s) => s.setDuration);
  // const syncTime = useVideoStudioStore((s) => s.currentTime);

  // 初始化：註冊 video ref 到 store
  useEffect(() => {
    if (videoRef.current) registerVideo(videoRef.current);
    return () => registerVideo(null);
  }, [registerVideo]);

  // 事件監聽
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      // 這裡使用 setState 避免觸發不必要的 re-render 迴圈
      useVideoStudioStore.setState({
        progress: (currentTime / duration) * 100,
        currentTime
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      setDuration(video.duration);

      // [關鍵修復] 當影片 Meta 下載完畢，強制跳轉到上次記憶的時間
      // 加個微小的閾值避免干擾從頭播放
      if (Math.abs(video.currentTime - storedTime) > 1) {
        console.log(`[Video] Restoring playback position: ${storedTime}`);
        video.currentTime = storedTime;
      }
    }
  };

  const handlePlayPause = () => {
    // 監聽原生播放事件（例如使用者點擊影片畫面）
    if (videoRef.current) {
      setPlaying(!videoRef.current.paused);
    }
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center overflow-hidden relative group">
      {/* 模擬音波視覺效果 (裝飾用) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-full h-1 bg-green-500 animate-pulse"></div>
      </div>

      <video
        ref={videoRef}
        src={content.sourceId} // 接收傳入的影片網址
        className="max-w-full max-h-full z-10"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata} // 確保綁定了這個事件
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        controls={false}
        // [小技巧] 加上這個屬性可以讓跨網域影片支援截圖或 Canvas 操作 (如果以後需要)
        crossOrigin="anonymous"
      />
      {/* [Fix] 使用受保護的 state */}
      {state.showOverlay && (
        <div className="absolute top-2 right-2 text-xs text-green-500 font-mono z-20 bg-black/50 px-2">
          LIVE FEED
        </div>
      )}
    </div>
  );
};

// --- 2. Playback Controller (負責控制) ---
export const PlaybackController = () => {
  const { isPlaying, progress, currentTime, duration, setPlaying, setProgress } = useVideoStudioStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full bg-gray-900 p-4 flex flex-col gap-4 text-white font-mono border-t-4 border-purple-500">
      <div className="flex justify-between items-end">
        <span className="text-xl font-bold tracking-widest">CONTROL DECK</span>
        <span className="text-xs text-gray-400">{isPlaying ? 'RUNNING' : 'STANDBY'}</span>
      </div>

      {/* Time Display */}
      <div className="bg-black p-2 rounded text-center text-2xl text-green-400 font-digital border border-gray-700">
        {formatTime(currentTime)} <span className="text-xs text-gray-600">/ {formatTime(duration)}</span>
      </div>

      {/* Progress Bar */}
      <input
        type="range"
        min="0" max="100"
        value={progress || 0}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-full accent-purple-500 cursor-pointer"
      />

      {/* Transport Controls */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded">⏮</button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`p-2 rounded font-bold ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded">⏭</button>
      </div>
    </div>
  );
};

// --- 3. EQ Mixer (負責音量) ---
export const EQMixer = () => {
  const { volume, setVolume } = useVideoStudioStore();

  return (
    <div className="h-full w-full bg-gray-800 p-4 flex flex-col items-center gap-2 text-white border-t-4 border-blue-500">
      <span className="text-xs font-bold mb-2">MASTER OUT</span>
      <div className="relative h-32 w-8 bg-black rounded-full overflow-hidden border border-gray-600">
        {/* Volume Level Visualization */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-100"
          style={{ height: `${volume * 100}%` }}
        />
        {/* Slider Overlay */}
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ transform: 'rotate(-90deg) translateX(-40%)', transformOrigin: 'center' }} // Hacky vertical slider
        />
      </div>
      <span className="font-mono text-sm">{Math.round(volume * 100)}%</span>
    </div>
  );
};