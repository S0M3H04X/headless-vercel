'use client';
import { useBootSequence } from '@/hooks/useBootSequence';
import { Desktop } from '@/components/workspace/Desktop'; // [修正] 引入 Desktop
import '@/styles/classicy/main.scss';
import styles from './Page.module.scss';


import { NameGame } from '@/components/widgets/NameGame';
import { ProgressBar } from '@/components/ui/primitives';

export default function Home() {
  const { isLoading } = useBootSequence();

  if (isLoading) {
    return (
      <div className={`${styles.bootScreen} relative h-screen w-screen overflow-hidden`}>
        {/* Background Animation */}
        <div className={`absolute inset-0 z-0 overflow-hidden ${styles.backgroundAnimation}`}>
          <NameGame
            className="w-full h-full"
            fontSize={16}
            opacity={0.3}
          />
        </div>

        {/* Boot Content */}
        <div className="absolute bottom-0 left-0 p-8 z-10 flex flex-col items-start gap-2">
          <p className={`text-3xl text-black ${styles.bootScreen}`}>BOOTING SYSTEM...</p>
          <div className="w-64">
            <ProgressBar height="12px" />
          </div>
        </div>
      </div>
    );
  }

  // [修正] 不再手寫 Layout，直接渲染 Desktop
  // Desktop 內部已經包含了 RetroOSLayout > Finder > WindowManager > MenuBar > Launcher
  return <Desktop />;
}