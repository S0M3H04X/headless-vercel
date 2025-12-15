// app/page.tsx
import Desktop from '@/components/workspace/Desktop';


export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      {/* Desktop 是我們 Phase 1 完成的「柔性容器」。
        它負責渲染整個 Winbox 桌面環境。
      */}
      <Desktop />
    </main>
  );
}