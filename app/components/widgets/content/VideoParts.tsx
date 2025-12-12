'use client';
import React from 'react';
import { ContentDescriptor } from '@/lib/types/workspace';
import { BaseWidgetProps } from '@/lib/types/workspace';

// 1. 播放控制器
export const PlaybackController = ({ content }: BaseWidgetProps) => (
  <div className="h-full w-full bg-zinc-900 text-white flex items-center justify-around p-2">
    <button className="p-2 hover:text-green-400">⏮</button>
    <button className="p-4 bg-green-600 rounded-full hover:bg-green-500 shadow-lg shadow-green-900/50">▶</button>
    <button className="p-2 hover:text-green-400">⏭</button>
    <div className="text-xs font-mono text-green-500">00:00 / 03:45</div>
  </div>
);

// 2. 視覺化視圖 (Visualiser)
export const Visualiser = ({ content }: BaseWidgetProps) => (
  <div className="h-full w-full bg-black flex items-end justify-center gap-1 p-4">
    {/* 模擬頻譜跳動 */}
    {[40, 60, 30, 80, 50, 90, 20, 60].map((h, i) => (
      <div 
        key={i} 
        className="w-4 bg-gradient-to-t from-green-900 to-green-400 rounded-t"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

// 3. 混音器 (EQ Mixer)
export const EQMixer = ({ content }: BaseWidgetProps) => (
  <div className="h-full w-full bg-zinc-800 p-4 flex justify-around">
    {['BASS', 'MID', 'TREBLE'].map((label) => (
      <div key={label} className="flex flex-col items-center h-full">
        <div className="flex-grow w-2 bg-zinc-600 rounded relative group cursor-pointer">
            <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-300 rounded-full shadow border-2 border-zinc-500 group-hover:bg-white"></div>
        </div>
        <span className="text-[10px] text-zinc-400 mt-2 font-bold">{label}</span>
      </div>
    ))}
  </div>
);