import './polyfills';
import './global.css';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';
import { Inter } from "next/font/google";
// import 'winbox/dist/css/winbox.min.css';
// import "@sakun/system.css";

import type { Metadata } from "next";

export const metadata = {
  title: 'ONE CREDIT limited edition',
  description: 'by 1313<3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/assets/fonts/Ishmeria.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
