import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';

export const ScenarioService = {
  // Scenario 1: Product Suite
  launchProductSuite: (productId: string) => {
    const { openWindow } = useWorkspaceStore.getState();
    const baseX = 50;
    const baseY = 50;

    // 1. Image (Left)
    openWindow({
      title: 'Product Gallery',
      content: { kind: WidgetKind.ProductImage, sourceId: productId },
      initialGeometry: { x: baseX, y: baseY, width: 400, height: 500 }
    });

    // 2. Info (Top Right)
    openWindow({
      title: 'Product Info',
      content: { kind: WidgetKind.ProductTitle, sourceId: productId },
      initialGeometry: { x: baseX + 410, y: baseY, width: 300, height: 150 }
    });

    // 3. Details (Bottom Right)
    openWindow({
      title: 'Details',
      content: { kind: WidgetKind.ProductDesc, sourceId: productId },
      initialGeometry: { x: baseX + 410, y: baseY + 160, width: 300, height: 340 }
    });
  },

  // Scenario 2: Video Studio
  launchVideoStudio: (sourceId?: string) => {
    const { openWindow } = useWorkspaceStore.getState();
    const baseX = 100;
    const baseY = 100;

    // 使用一個開源的測試影片 (Big Buck Bunny)
    // 或是您 public 資料夾內的 '/asses/video/demo.mp4t' (如果有)
    const videoUrl = '/assets/mp4/01.mp4';

    // 1. Visualiser (Master) - 負責載入影片
    openWindow({
      title: 'Studio Monitor A',
      content: { 
          kind: WidgetKind.VideoVisual, 
          sourceId: videoUrl // 這裡傳入真實 URL
      },
      initialGeometry: { x: baseX, y: baseY, width: 600, height: 340 }
    });

    // 2. Playback (Controller) - sourceId 在這裡是為了參考，實際上它控制 Global Store
    openWindow({
      title: 'Transport',
      content: { kind: WidgetKind.VideoControl, sourceId: 'ctrl_01' },
      initialGeometry: { x: baseX, y: baseY + 350, width: 350, height: 200 }
    });

    // 3. EQ (Mixer)
    openWindow({
      title: 'Master EQ',
      content: { kind: WidgetKind.VideoMixer, sourceId: 'mix_01' },
      initialGeometry: { x: baseX + 360, y: baseY + 350, width: 150, height: 200 }
    });
  }
};