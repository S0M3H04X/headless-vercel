import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'next.config.mjs',
    'app/**/route.ts',
    'app/**/page.tsx',
    'app/**/layout.tsx',
    'app/**/loading.tsx',
    'app/**/error.tsx',
    'app/**/not-found.tsx',
    'middleware.ts',
  ],
  project: ['**/*.{ts,tsx,js,jsx}'],
  ignore: ['**/*.d.ts'],
  ignoreDependencies: [
    // Add dependencies here that are used but not detected by knip
    // e.g. 'husky', 'lint-staged' if you use them but they aren't imported
    'sass', // Used in styles, might not be detected as import
  ],
  next: {
    entry: [
      'next.config.js',
      'next.config.mjs',
      'app/**/*.{js,jsx,ts,tsx}',
      'pages/**/*.{js,jsx,ts,tsx}'
    ]
  }
};

export default config;
