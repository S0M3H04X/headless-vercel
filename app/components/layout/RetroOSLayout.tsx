import React from 'react';
// import 'winbox/dist/css/winbox.min.css';
// import '@/styles/winbox-retro.css'; // 這裡引入我們定義的 system.css 覆寫

interface RetroOSLayoutProps {
  children: React.ReactNode;
  wallpaper?: string;
}

export const RetroOSLayout: React.FC<RetroOSLayoutProps> = ({ children, wallpaper }) => {
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
      </div>
    </div>
  );
};