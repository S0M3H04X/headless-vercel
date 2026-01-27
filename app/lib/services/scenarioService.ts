import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';
import { INITIAL_LAYOUTS } from '@/lib/constants/layout';

const VIDEO_WIDGET_KINDS = [
  WidgetKind.VideoVisual,
  WidgetKind.VideoControl,
  WidgetKind.VideoMixer,
];

export const ScenarioService = {
  // Scenario 1: Product Suite (Singleton Navigation)
  launchProductSuite: (handle: string) => {
    const { openWindow, windows, updateWindowContent, focusWindow } = useWorkspaceStore.getState();
    const layout = INITIAL_LAYOUTS.PRODUCT;

    // 1. Search for existing Product Windows
    const existingImageWin = Object.values(windows).find(w => w.content.kind === WidgetKind.ProductImage);
    const existingInfoWin = Object.values(windows).find(w => w.content.kind === WidgetKind.ProductInfo);

    // 2. Singleton Update or New Launch
    if (existingImageWin) {
      updateWindowContent(existingImageWin.id, { kind: WidgetKind.ProductImage, sourceId: handle });
      focusWindow(existingImageWin.id);
    } else {
      openWindow({
        title: 'Product Gallery',
        content: { kind: WidgetKind.ProductImage, sourceId: handle },
        initialGeometry: layout.GALLERY
      });
    }

    if (existingInfoWin) {
      updateWindowContent(existingInfoWin.id, { kind: WidgetKind.ProductInfo, sourceId: handle });
      focusWindow(existingInfoWin.id);
    } else {
      openWindow({
        title: 'Product Info',
        content: { kind: WidgetKind.ProductInfo, sourceId: handle },
        initialGeometry: layout.INFO
      });
    }

    
  },



  // Scenario 2: Video Studio (with Singleton Check)
  launchVideoStudio: (sourceId?: string) => {
    const store = useWorkspaceStore.getState();

    // [Fix 1] Singleton Check: 檢查是否已經有 Video Studio 相關視窗
    const hasVideoStudio = Object.values(store.windows).some(win =>
      VIDEO_WIDGET_KINDS.includes(win.content.kind as any)
    );

    if (hasVideoStudio) {
      // 這裡簡單使用 alert，實務上可以使用 Toast 通知
      alert("Video Studio is already running. Only one instance is allowed.");
      return;
    }

    const { openWindow } = store;
    const layout = INITIAL_LAYOUTS.VIDEO;
    // 使用真實影片或預設影片
    const videoUrl = sourceId || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    // [Fix 2] 使用常數佈局
    openWindow({
      title: 'Studio Monitor A',
      content: { kind: WidgetKind.VideoVisual, sourceId: videoUrl },
      initialGeometry: layout.VISUALISER
    });

    openWindow({
      title: 'Transport',
      content: { kind: WidgetKind.VideoControl, sourceId: 'ctrl_01' },
      initialGeometry: layout.CONTROL
    });

    openWindow({
      title: 'Master EQ',
      content: { kind: WidgetKind.VideoMixer, sourceId: 'mix_01' },
      initialGeometry: layout.MIXER
    });
  }
};