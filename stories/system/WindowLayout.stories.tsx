import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { WindowLayout } from '../../app/components/system/window/WindowLayout';
import { Button } from '../../app/components/ui/primitives/Button';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';

// Helper component for pixel icons
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <i className={`hn hn-${name} ${className}`} style={{ fontSize: 14 }} />
);

const meta: Meta<typeof WindowLayout> = {
  title: 'System/WindowLayout',
  component: WindowLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{
        width: '600px',
        height: '400px',
        border: '1px solid #000',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: '#dfdfdf',
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// BASIC LAYOUTS
// =============================================================================

export const ContentOnly: Story = {
  render: () => (
    <WindowLayout>
      <WindowLayout.Content>
        <p style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          This is the simplest layout with just content area.
          The content automatically scrolls when it overflows.
        </p>
      </WindowLayout.Content>
    </WindowLayout>
  ),
};

export const WithToolbar: Story = {
  render: () => (
    <WindowLayout>
      <WindowLayout.Toolbar>
        <Button buttonStyle="tool"><Icon name="arrow-left" /></Button>
        <Button buttonStyle="tool"><Icon name="arrow-right" /></Button>
        <Button buttonStyle="tool"><Icon name="arrow-up" /></Button>
        <span style={{ flex: 1 }} />
        <Button buttonStyle="tool"><Icon name="search" /></Button>
      </WindowLayout.Toolbar>
      <WindowLayout.Content>
        <p style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          Layout with a toolbar at the top for navigation and actions.
        </p>
      </WindowLayout.Content>
    </WindowLayout>
  ),
};

export const WithSidebar: Story = {
  render: () => (
    <WindowLayout>
      <WindowLayout.Sidebar width={150}>
        <div style={{ fontFamily: 'sans-serif', fontSize: 11 }}>
          <strong style={{ display: 'block', marginBottom: 8 }}>Favorites</strong>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="folder" /> Desktop</div>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="file" /> Documents</div>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="image" /> Pictures</div>
          <strong style={{ display: 'block', marginTop: 12, marginBottom: 8 }}>Devices</strong>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="hard-drive" /> Macintosh HD</div>
        </div>
      </WindowLayout.Sidebar>
      <WindowLayout.Content>
        <p style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          Layout with a sidebar for file navigation, like Finder.
        </p>
      </WindowLayout.Content>
    </WindowLayout>
  ),
};

export const WithStatusBar: Story = {
  render: () => (
    <WindowLayout>
      <WindowLayout.Content>
        <p style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          Layout with a status bar at the bottom.
        </p>
      </WindowLayout.Content>
      <WindowLayout.StatusBar>
        <span>12 items</span>
        <span>48.2 MB available</span>
      </WindowLayout.StatusBar>
    </WindowLayout>
  ),
};

// =============================================================================
// COMPLETE LAYOUTS
// =============================================================================

export const FullLayout: Story = {
  name: 'Full Layout (All Parts)',
  render: () => (
    <WindowLayout>
      <WindowLayout.Toolbar>
        <Button buttonStyle="tool"><Icon name="arrow-left" /></Button>
        <Button buttonStyle="tool"><Icon name="arrow-right" /></Button>
        <span style={{ flex: 1 }} />
        <Button buttonStyle="tool"><Icon name="folder" /></Button>
        <Button buttonStyle="tool"><Icon name="trash" /></Button>
      </WindowLayout.Toolbar>
      <WindowLayout.Sidebar width={160}>
        <div style={{ fontFamily: 'sans-serif', fontSize: 11 }}>
          <strong style={{ display: 'block', marginBottom: 8, color: '#666' }}>FAVORITES</strong>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="folder" /> Desktop</div>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="file" /> Documents</div>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="download" /> Downloads</div>
          <strong style={{ display: 'block', marginTop: 16, marginBottom: 8, color: '#666' }}>DEVICES</strong>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="hard-drive" /> Macintosh HD</div>
          <div style={{ padding: '4px 0', cursor: 'pointer' }}><Icon name="compact-disc" /> Disk Image</div>
        </div>
      </WindowLayout.Sidebar>
      <WindowLayout.Content padding="medium">
        <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          <strong>Full Window Layout</strong>
          <p>This demonstrates all four parts of the WindowLayout component:</p>
          <ul>
            <li><code>WindowLayout.Toolbar</code> - Navigation and actions</li>
            <li><code>WindowLayout.Sidebar</code> - File browser navigation</li>
            <li><code>WindowLayout.Content</code> - Main scrollable area</li>
            <li><code>WindowLayout.StatusBar</code> - Item count and info</li>
          </ul>
        </div>
      </WindowLayout.Content>
      <WindowLayout.StatusBar>
        <span>6 items</span>
        <span>128.5 MB available</span>
      </WindowLayout.StatusBar>
    </WindowLayout>
  ),
};

export const ScrollableContent: Story = {
  name: 'Scrollable Content',
  render: () => (
    <WindowLayout>
      <WindowLayout.Toolbar>
        <span style={{ fontFamily: 'sans-serif', fontSize: 11 }}>Scroll Demo</span>
      </WindowLayout.Toolbar>
      <WindowLayout.Content padding="medium">
        <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} style={{ margin: '8px 0' }}>
              Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          ))}
        </div>
      </WindowLayout.Content>
      <WindowLayout.StatusBar>
        <span>30 lines</span>
      </WindowLayout.StatusBar>
    </WindowLayout>
  ),
};
