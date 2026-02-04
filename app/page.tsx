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
      <div className={`${styles.bootScreen} py-8 px-8 h-screen w-screen flex flex-col items-start justify-end gap-2`}>
        <p className="text-3xl text-black">BOOTING SYSTEM...</p>
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