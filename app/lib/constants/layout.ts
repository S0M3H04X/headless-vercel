// app/lib/constants/layout.ts

export const INITIAL_LAYOUTS = {
  PRODUCT: {
    GALLERY: { x: 0, y: 80, width: 350, height: 420 },
    INFO: { x: 50, y: 500, width: 350, height: 500 },
    DETAILS: { x: 50, y: 350, width: 300, height: 400 },
  },
  VIDEO: {
    VISUALISER: { x: 20, y: 100, width: 300, height: 340 },
    CONTROL: { x: 20, y: 450, width: 350, height: 200 },
    MIXER: { x: 20, y: 450, width: 150, height: 200 },
  },
  PDF: {
    DEFAULT: { x: 20, y: 100, width: 300, height: 800 },
  },
  COLLECTION: {
    APP: {
      x: 0,
      y: 0,
      width: '100vw',
      height: 'calc(90vh - 120px)'
    },
  },
} as const;