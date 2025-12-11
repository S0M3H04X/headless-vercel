'use client';
import React from 'react';
import { ContentDescriptor } from '@/lib/types/workspace';

export default function MediaPlayerWidget({ content }: { content: ContentDescriptor }) {
  return (
    <div className="h-full w-full bg-black text-white flex flex-col items-center justify-center">
      <div className="text-4xl mb-4">▶️</div>
      <h3 className="text-lg font-medium">Now Playing</h3>
      <p className="text-gray-400 text-sm">{content.sourceId}</p>
    </div>
  );
}