// app/store/audioStudioStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  artist: string;
  year: string;
  url: string;
  cover?: string;
}

interface AudioStudioState {
  // Playback State
  isPlaying: boolean;
  progress: number;
  volume: number;
  currentTime: number;
  duration: number;

  // Playlist State
  playlist: Track[];
  currentIndex: number;

  // Visualiser State
  isVisualiserActive: boolean;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;

  // Elements
  audioElement: HTMLAudioElement | null;

  // Actions
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;

  setPlaylist: (playlist: Track[]) => void;
  setCurrentIndex: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;

  setVisualiserActive: (active: boolean) => void;
  registerAudio: (el: HTMLAudioElement | null) => void;
  initAudioContext: () => void;
}

export const useAudioStudioStore = create<AudioStudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      progress: 0,
      volume: 1,
      currentTime: 0,
      duration: 0,

      playlist: [],
      currentIndex: 0,

      isVisualiserActive: false,
      analyser: null,
      audioContext: null,
      audioElement: null,

      setPlaying: (isPlaying) => {
        const { audioElement, audioContext } = get();
        if (audioElement) {
          if (isPlaying) {
            // Resume AudioContext if suspended (browser autoplay policy)
            if (audioContext && audioContext.state === 'suspended') {
              audioContext.resume();
            }
            audioElement.play().catch(e => console.warn('Autoplay prevented', e));
          } else {
            audioElement.pause();
          }
        }
        set({ isPlaying });
      },

      setVolume: (volume) => {
        const { audioElement } = get();
        if (audioElement) {
          audioElement.volume = volume;
        }
        set({ volume });
      },

      setProgress: (progress) => {
        const { audioElement, duration } = get();
        if (audioElement && duration) {
          const newTime = (progress / 100) * duration;
          audioElement.currentTime = newTime;
          set({ currentTime: newTime, progress });
        }
      },

      setDuration: (duration) => set({ duration }),

      setPlaylist: (playlist) => set({ playlist }),

      setCurrentIndex: (index) => {
        const { playlist } = get();
        if (index >= 0 && index < playlist.length) {
          set({ currentIndex: index, isPlaying: true }); // Auto-play on track change
          // Audio element source update is handled in the component via effect
        }
      },

      nextTrack: () => {
        const { currentIndex, playlist } = get();
        const next = (currentIndex + 1) % playlist.length;
        get().setCurrentIndex(next);
      },

      prevTrack: () => {
        const { currentIndex, playlist } = get();
        const prev = (currentIndex - 1 + playlist.length) % playlist.length;
        get().setCurrentIndex(prev);
      },

      setVisualiserActive: (active) => set({ isVisualiserActive: active }),

      registerAudio: (el) => {
        set({ audioElement: el });
        if (el) {
          const state = get();
          el.volume = state.volume;
          // If we have an audio context, connect it now if not already connected
          // (Logic for connecting source to analyser will be in initAudioContext or component)
          if (!state.audioContext) {
            get().initAudioContext();
          }
        }
      },

      initAudioContext: () => {
        const { audioElement, audioContext } = get();
        if (audioContext) return; // Already initialized

        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;

        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; // Configurable

        set({ audioContext: ctx, analyser });

        // Connect audio element if available
        if (audioElement) {
          // Verify if source node already created to avoid error?
          // We assume one-time initialization. 
          // Note: createMediaElementSource can only be called once per element.
          // We need to be careful. A better pattern might be to do this in the component 
          // or store the sourceNode in the store to check.
          try {
            // For now, let's wrap in try-catch or handle in component.
            // Actually, doing this in store is tricky because we can't easily check if source exists.
            // Let's expose analyser and let component handle connection OR
            // define a cleaner setup. 
            // We'll trust the component to call this ONCE or store sourceNode.

            const source = ctx.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(ctx.destination);
          } catch (e) {
            console.warn("MediaElementSource connection failed (already connected?)", e);
          }
        }
      }
    }),
    {
      name: 'audio-studio-storage',
      partialize: (state) => ({
        volume: state.volume,
        currentIndex: state.currentIndex,
        // Persist playlist? Maybe.
        playlist: state.playlist,
      }),
    }
  )
);
