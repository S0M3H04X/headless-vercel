// app/lib/constants/layout.ts
import { WindowGeometry } from '@/lib/types/workspace';

type LayoutGroup = Record<string, WindowGeometry>;

export const INITIAL_LAYOUTS = {
  PRODUCT: {
    GALLERY: { x: 0, y: 0, width: 350, height: 420 },
    INFO: { x: 50, y: 450, width: 350, height: 180 }, // Updated height from 500 to 200 (from ScenarioService)
    DETAILS: { x: 50, y: 350, width: 300, height: 400 },
  },
  VIDEO: {
    VISUALISER: { x: 20, y: 100, width: 300, height: 340 },
    CONTROL: { x: 20, y: 450, width: 350, height: 200 },
    MIXER: { x: 20, y: 450, width: 150, height: 200 },
  },
  PDF: {
    DEFAULT: { x: 20, y: 100, width: 300, height: 700 },
  },
  COLLECTION: {
    // Updated to match SystemService usage instead of the old full-screen default
    APP: { x: 0, y: 0, width: 640, height: 480 },
  },
} satisfies Record<string, LayoutGroup>;