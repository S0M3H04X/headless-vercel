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
  launchVideoStudio: (videoId: string) => {
    const { openWindow } = useWorkspaceStore.getState();
    const baseX = 100;
    const baseY = 100;

    openWindow({
      title: 'Visualiser',
      content: { kind: WidgetKind.VideoVisual, sourceId: videoId },
      initialGeometry: { x: baseX, y: baseY, width: 600, height: 200 }
    });

    openWindow({
      title: 'Playback',
      content: { kind: WidgetKind.VideoControl, sourceId: videoId },
      initialGeometry: { x: baseX, y: baseY + 210, width: 350, height: 150 }
    });

    openWindow({
      title: 'EQ Mixer',
      content: { kind: WidgetKind.VideoMixer, sourceId: videoId },
      initialGeometry: { x: baseX + 360, y: baseY + 210, width: 240, height: 150 }
    });
  }
};