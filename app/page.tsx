'use client';
import { useBootSequence } from '@/hooks/useBootSequence'; // (需確認是否已實作)
import { RetroOSLayout } from '@/components/layout/RetroOSLayout'; // (需確認)
import { MenuBar } from '@/components/system/MenuBar';
import { Launcher } from '@/components/system/Launcher'; // 稍後重構為 Dock
import { WindowManager } from '@/components/system/WindowManager';

// 確保引入 SCSS
import '@/styles/classicy/main.scss';

export default function Home() {
  // 若 useBootSequence 尚未準備好，可暫時註解
  const { isLoading } = useBootSequence();

  if (isLoading) {
    return <div className="h-screen w-screen bg-gray-500 flex items-center justify-center">
        <p className="text-white font-mono">BOOTING...</p>
    </div>;
  }

  return (
    // Layer 1: Layout Container (Handling Viewport)
    <div className="relative h-screen w-screen overflow-hidden bg-[#008080]">
      
      {/* Layer 2: Wallpaper & Desktop Icons (The Finder) - 待實作 */}
      {/* Layer 4: System Shell */}
      <MenuBar />
      
      {/* Layer 3: Windows */}
      <WindowManager />

      {/* 暫時強制 Launcher 顯示在底部，確保能看見 */}
      <div className="absolute bottom-0 w-full z-50">
        <Launcher /> 
      </div>

    </div>
  );
}