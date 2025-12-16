// app/lib/constants/layout.ts

export const INITIAL_LAYOUTS = {
  PRODUCT: {
    GALLERY: { x: 20, y: 80, width: 300, height: 400 },
    INFO: { x: 30, y: 420, width: 300, height: 150 },
    DETAILS: { x: 50, y: 650, width: 300, height: 340 },
  },
  VIDEO: {
    VISUALISER: { x: 20, y: 100, width: 600, height: 340 },
    CONTROL: { x: 20, y: 450, width: 350, height: 200 },
    MIXER: { x: 20, y: 450, width: 150, height: 200 },
  },
  PDF: {
    DEFAULT: { x: 20, y: 100, width: 300, height: 800 },
  }
} as const;