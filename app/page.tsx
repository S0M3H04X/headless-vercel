'use client';
import { useBootSequence } from '@/hooks/useBootSequence';
import { Desktop } from '@/components/workspace/Desktop'; // [修正] 引入 Desktop
import '@/styles/classicy/main.scss';
import styles from './Page.module.scss';



import { ProgressBar } from '@/components/ui/primitives';

export default function Home() {
  const { isLoading } = useBootSequence();

  if (isLoading) {
    return (
      <div className={`${styles.bootScreen} h-screen w-screen flex flex-col items-center justify-center gap-4`}>
        <p className="text-xl text-white">BOOTING SYSTEM...</p>
        <div className="w-64">
          <ProgressBar height="12px" />
        </div>
      </div>
    );
  }

  // [修正] 不再手寫 Layout，直接渲染 Desktop
  // Desktop 內部已經包含了 RetroOSLayout > Finder > WindowManager > MenuBar > Launcher
  return <Desktop />;
}