'use client';
import { useBootSequence } from '@/hooks/useBootSequence';
import { Desktop } from '@/components/workspace/Desktop'; // [修正] 引入 Desktop
import '@/styles/classicy/main.scss';

export default function Home() {
  const { isLoading } = useBootSequence();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-500 flex items-center justify-center">
        <p className="text-white font-mono">BOOTING...</p>
      </div>
    );
  }

  // [修正] 不再手寫 Layout，直接渲染 Desktop
  // Desktop 內部已經包含了 RetroOSLayout > Finder > WindowManager > MenuBar > Launcher
  return <Desktop />;
}