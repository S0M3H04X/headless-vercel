'use client';
import { useBootSequence } from '@/hooks/useBootSequence';
import { Desktop } from '@/components/workspace/Desktop'; // [修正] 引入 Desktop
import '@/styles/classicy/main.scss';

import { ProgressBar } from '@/components/ui/primitives';

export default function Home() {
  const { isLoading } = useBootSequence();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-500 flex flex-col items-center justify-center gap-4">
        <p className="text-white font-mono text-xl">BOOTING SYSTEM...</p>
        <div className="w-64">
          <ProgressBar height="24px" />
        </div>
      </div>
    );
  }

  // [修正] 不再手寫 Layout，直接渲染 Desktop
  // Desktop 內部已經包含了 RetroOSLayout > Finder > WindowManager > MenuBar > Launcher
  return <Desktop />;
}