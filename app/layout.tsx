import './polyfills';
import './global.css';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';
import { Inter } from "next/font/google";
// import 'winbox/dist/css/winbox.min.css';
// import "@sakun/system.css";

import type { Metadata } from "next";

export const metadata = {
  title: 'ONE CREDIT by 1313<3',
  description: 'by S0M3H04X',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
