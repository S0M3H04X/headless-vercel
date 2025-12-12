import './polyfills';

import type { Metadata } from "next";
import { Inter } from "next/font/google";

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
