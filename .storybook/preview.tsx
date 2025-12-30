import React, { useEffect } from 'react';
import type { Preview } from '@storybook/nextjs-vite'
import { useAuthStore } from '../app/store/authStore';

// Import Classicy theme styles for Platinum look
import '../app/styles/classicy/main.scss'
import '../app/global.css'

// Decorator to mock Auth/Tier state based on story parameters
const TierDecorator = (Story: any, context: any) => {
  const tier = context.parameters.tier;
  const isAuthenticated = context.parameters.isAuthenticated;

  useEffect(() => {
    // Only update if parameters are provided, otherwise leave as default (or reset)
    if (tier) {
      useAuthStore.setState({
        tier,
        isAuthenticated: isAuthenticated ?? (tier !== 'guest')
      });
    }
  }, [tier, isAuthenticated]);

  return <Story />;
};

const preview: Preview = {
  decorators: [TierDecorator],
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