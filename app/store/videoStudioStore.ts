// app/store/videoStudioStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // [新增] 引入中間件

interface VideoStudioState {
  isPlaying: boolean;
  progress: number;
  volume: number;
  currentTime: number;
  duration: number;
  
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  
  videoElement: HTMLVideoElement | null;
  registerVideo: (el: HTMLVideoElement | null) => void;
}

export const useVideoStudioStore = create<VideoStudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      progress: 0,
      volume: 1,
      currentTime: 0,
      duration: 0,
      videoElement: null, // DOM 引用初始為 null

      setPlaying: (isPlaying) => {
        const { videoElement } = get();
        if (videoElement) {
          isPlaying ? videoElement.play().catch(e => console.warn('Autoplay prevented', e)) : videoElement.pause();
        }
        set({ isPlaying });
      },

      setVolume: (volume) => {
        const { videoElement } = get();
        if (videoElement) {
          videoElement.volume = volume;
        }
        set({ volume });
      },

      setProgress: (progress) => {
        const { videoElement, duration } = get();
        if (videoElement && duration) {
          const newTime = (progress / 100) * duration;
          videoElement.currentTime = newTime;
          set({ currentTime: newTime, progress }); // 立即更新 store 以獲得流暢 UI
        }
      },

      setDuration: (duration) => set({ duration }),

      registerVideo: (el) => {
          set({ videoElement: el });
          // [關鍵修復] 當 Video 元素註冊進來時，立即將 Store 裡的狀態同步給它
          if (el) {
              const state = get();
              // 恢復音量
              el.volume = state.volume;
              // 恢復時間 (如果有記憶的時間且大於 1 秒)
              if (state.currentTime > 1) {
                  el.currentTime = state.currentTime;
              }
          }
      },
    }),
    {
      name: 'video-studio-storage', // LocalStorage 的 Key 名稱
      // [關鍵] 過濾掉不能儲存的 DOM 物件，只存數據
      partialize: (state) => ({
        currentTime: state.currentTime,
        volume: state.volume,
        progress: state.progress,
        duration: state.duration,
        // 注意：通常不建議持久化 isPlaying，因為瀏覽器會阻擋自動播放
      }),
    }
  )
);