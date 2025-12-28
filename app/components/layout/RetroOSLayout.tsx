import React from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthWidget from '@/components/desktop/AuthWidget';

// import 'winbox/dist/css/winbox.min.css';
// import '@/styles/winbox-retro.css'; // 這裡引入我們定義的 system.css 覆寫

interface RetroOSLayoutProps {
  children: React.ReactNode;
  wallpaper?: string;
}

export const RetroOSLayout: React.FC<RetroOSLayoutProps> = ({ children, wallpaper }) => {
  const isAuthOpen = useAuthStore((state) => state.isAuthOpen);
  const closeAuth = useAuthStore((state) => state.closeAuth);
  return (
    // Layer 1: Viewport
    <div className="relative h-screen w-screen overflow-hidden font-mono text-black select-none">
      
      {/* Layer 2: Wallpaper */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${wallpaper || '/assets/wallpaper/default.jpg'})` }} 
      />
      
      {/* Layer 3, 4, 5: Injected Content */}
      <div className="relative z-10 w-full h-full">
        {children}
        {isAuthOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
           {/* 這裡可以是 Winbox 或是簡單的 Modal */}
           <div className="relative">
             <button onClick={closeAuth} className="absolute top-0 right-0 p-2 text-white">X</button>
             <AuthWidget />
           </div>
        </div>
      )}
      </div>
    </div>
  );
};