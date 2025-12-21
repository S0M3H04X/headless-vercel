'use client';
import React from 'react';
// 備註：若 Pixel Icon Library 是以 CSS Class 或其他方式運作，請在此調整
// 這裡假設我們使用它作為 SVG 或 Font 的封裝，目前先提供 SVG Fallback 確保能看
// 您可以查閱 node_modules/@hackernoon/pixel-icon-library 的文件來精確對接

interface PixelIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, className = '', size = 24 }) => {
  // 這裡提供一套 "內建" 的像素 SVG 作為基礎，確保即便 Library 尚未設定好也能顯示
  // 未來可將此 switch 替換為 Library 的真實 Component
  
  const getPath = (iconName: string) => {
    switch (iconName) {
      case 'product_browser': // Tee / Shop
        return <path d="M4 6h16v2h-2v12h-12v-12h-2z M8 8v4h2v-4h-2z M14 8v4h2v-4h-2z" />;
      case 'video_studio': // Studio / Camera
        return <path d="M2 6h14v10h-14z M16 9h4v4h-4z M6 10h2v2h-2z" />;
      case 'cart': // Shopping Cart
        return <path d="M2 4h4l2 10h10v2h-12z M16 16h2v2h-2z M8 16h2v2h-2z M6 6h14v8h-10z" />;
      case 'profile': // User / Account
        return <path d="M8 4h8v8h-8z M4 16h16v4h-16z" />;
      case 'pdf_viewer': // Document
        return <path d="M6 2h8l4 4v14h-12z M13 3v4h4 M8 10h8 M8 13h8 M8 16h6" />;
      case 'launcher': // Start / Grid
        return <path d="M4 4h6v6h-6z M14 4h6v6h-6z M4 14h6v6h-6z M14 14h6v6h-6z" />;
      default: // Generic Box
        return <path d="M4 4h16v16h-16z" />;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={`fill-current ${className}`}
      shapeRendering="crispEdges" // 關鍵：確保像素邊緣銳利不模糊
    >
      {getPath(name)}
    </svg>
  );
};