// app/components/widgets/content/MediaPlayerWidget.tsx
'use client';
import React, { useRef, useEffect } from 'react';
import { z } from 'zod';
import { BaseWidgetProps } from '@/lib/types/workspace';
import { useWidgetState } from '@/hooks/useWidgetState';
import { useWorkspaceStore } from '@/store/workspaceStore';

const MediaStateSchema = z.object({
  currentTime: z.number().default(0),
  volume: z.number().default(1),
  isPlaying: z.boolean().default(false),
});

const DEFAULT_MEDIA_STATE = { currentTime: 0, volume: 1, isPlaying: false };

export default function MediaPlayerWidget({ id, content, internalState }: BaseWidgetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateInternalState = useWorkspaceStore(s => s.updateInternalState);

  // 1. 讀取安全狀態
  const state = useWidgetState(internalState, MediaStateSchema, DEFAULT_MEDIA_STATE);

  // 2. 初始化：還原播放進度 (只在掛載時執行一次)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = state.currentTime;
      videoRef.current.volume = state.volume;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency: only restore on mount

  // 3. 事件監聽：更新狀態 (使用 Debounce 或簡單的事件綁定)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    // 這裡為了效能，不要每秒寫入 LocalStorage 60次
    // 實際專案應使用 useDebounce，這裡簡化為 "每隔 1 秒存一次" 的邏輯可由 store 訂閱處理
    // 但為了 Phase 4 演示，我們直接寫入，Zustand 效能通常扛得住
    updateInternalState(id, {
      currentTime: videoRef.current.currentTime
    });
  };

  const handleVolumeChange = () => {
    if (!videoRef.current) return;
    updateInternalState(id, { volume: videoRef.current.volume });
  };

  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={content.sourceId} // 假設 sourceId 是 URL
        className="max-h-full max-w-full"
        controls
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}