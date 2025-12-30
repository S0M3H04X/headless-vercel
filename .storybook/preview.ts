import type { Preview } from '@storybook/nextjs-vite'

// Import Classicy theme styles for Platinum look
import '../app/styles/classicy/main.scss'
import '../app/global.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'platinum',
      values: [
        { name: 'platinum', value: '#c0c0c0' },
        { name: 'window', value: '#dfdfdf' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
};

export default preview;