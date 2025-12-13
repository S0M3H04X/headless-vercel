// app/lib/constants/layout.ts

export const INITIAL_LAYOUTS = {
  PRODUCT: {
    GALLERY: { x: 50, y: 50, width: 400, height: 500 },
    INFO: { x: 460, y: 50, width: 300, height: 150 },
    DETAILS: { x: 460, y: 210, width: 300, height: 340 },
  },
  VIDEO: {
    VISUALISER: { x: 100, y: 100, width: 600, height: 340 },
    CONTROL: { x: 100, y: 450, width: 350, height: 200 },
    MIXER: { x: 460, y: 450, width: 150, height: 200 },
  },
  PDF: {
    DEFAULT: { x: 300, y: 100, width: 600, height: 800 },
  }
} as const;