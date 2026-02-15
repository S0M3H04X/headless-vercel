import './polyfills';
import './global.css';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';
import { Pixelify_Sans, VT323 } from "next/font/google";
import localFont from 'next/font/local';
// import 'winbox/dist/css/winbox.min.css';
// import "@sakun/system.css";
import { Analytics } from '@vercel/analytics/next';

import type { Metadata, Viewport } from "next";

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixelify',
  display: 'swap',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
  display: 'swap',
});

const chicagoKare = localFont({
  src: [
    {
      path: '../public/assets/fonts/ChicagoKare-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/ChicagoKare-Regular.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-chicago',
  display: 'swap',
});

const ishmeria = localFont({
  src: '../public/assets/fonts/Ishmeria.woff',
  variable: '--font-ishmeria',
  display: 'swap',
});

const arcade = localFont({
  src: [
    {
      path: '../public/assets/fonts/ARCADE.woff',
      weight: '400',
      style: 'normal',
    },
    // Adding TTF as backup if needed, but woff is usually sufficient for modern browsers
    // { path: '../public/assets/fonts/ARCADE.TTF', weight: '400', style: 'normal' }
  ],
  variable: '--font-arcade',
  display: 'swap',
});

const llPixel3 = localFont({
  src: [
    {
      path: '../public/assets/fonts/LLPIXEL3.woff',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-llpixel3',
  display: 'swap',
});

const appleGaramond = localFont({
  src: '../public/assets/fonts/AppleGaramondLight.woff2',
  variable: '--font-apple-garamond',
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://one-credit.1313heart.com'),
  title: {
    default: 'ONE CREDIT, One Chance.',
    template: '%s | ONE CREDIT'
  },
  description: 'by 1313<3',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "One Credit",
  },
  openGraph: {
    title: 'ONE CREDIT, One Chance.',
    description: 'by 1313<3',
    url: 'https://one-credit.1313heart.com',
    siteName: 'ONE CREDIT',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/img/og-image.jpg', // Using an existing image as placeholder/default
        width: 1200,
        height: 630,
        alt: 'ONE CREDIT, One Chance.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ONE CREDIT, One Chance.',
    description: 'by 1313<3',
    images: ['/assets/img/og-image.jpg'], // Using an existing image
  },
}

export const viewport: Viewport = {
  themeColor: "#a1e0fff0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${pixelifySans.variable} ${vt323.variable} ${chicagoKare.variable} ${ishmeria.variable} ${arcade.variable} ${llPixel3.variable} ${appleGaramond.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
