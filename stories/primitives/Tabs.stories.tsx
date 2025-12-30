import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs } from '../../app/components/ui/primitives/Tabs';
import { useState } from 'react';

const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default active tab value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// BASIC TABS
// =============================================================================

export const BasicTabs: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <Tabs defaultValue="general">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="display">Display</Tabs.Trigger>
          <Tabs.Trigger value="sound">Sound</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="general">
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
            General settings go here. Configure your basic preferences.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="display">
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
            Display settings: resolution, colors, appearance options.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="sound">
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
            Sound settings: volume, alerts, system sounds.
          </p>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

// =============================================================================
// CONTROLLED TABS
// =============================================================================

export const ControlledTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');
    return (
      <div style={{ width: '400px' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="tab1">First</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Second</Tabs.Trigger>
            <Tabs.Trigger value="tab3">Third</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="tab1">
            <p style={{ margin: 0 }}>Content of the first tab</p>
          </Tabs.Panel>
          <Tabs.Panel value="tab2">
            <p style={{ margin: 0 }}>Content of the second tab</p>
          </Tabs.Panel>
          <Tabs.Panel value="tab3">
            <p style={{ margin: 0 }}>Content of the third tab</p>
          </Tabs.Panel>
        </Tabs>
        <p style={{ marginTop: '16px', fontFamily: 'monospace', fontSize: '11px' }}>
          Active tab: {activeTab}
        </p>
      </div>
    );
  },
};

// =============================================================================
// WITH DISABLED TAB
// =============================================================================

export const WithDisabledTab: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <Tabs defaultValue="available">
        <Tabs.List>
          <Tabs.Trigger value="available">Available</Tabs.Trigger>
          <Tabs.Trigger value="disabled" disabled>Disabled</Tabs.Trigger>
          <Tabs.Trigger value="another">Another</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="available">
          <p style={{ margin: 0 }}>This tab is available</p>
        </Tabs.Panel>
        <Tabs.Panel value="another">
          <p style={{ margin: 0 }}>Another available tab</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};

// =============================================================================
// MANY TABS
// =============================================================================

export const ManyTabs: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
          <Tabs.Trigger value="tab4">Tab 4</Tabs.Trigger>
          <Tabs.Trigger value="tab5">Tab 5</Tabs.Trigger>
        </Tabs.List>
        {[1, 2, 3, 4, 5].map((n) => (
          <Tabs.Panel key={n} value={`tab${n}`}>
            <p style={{ margin: 0 }}>Content for Tab {n}</p>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  ),
};

// =============================================================================
// FINDER-STYLE TABS
// =============================================================================

export const FinderStyle: Story = {
  render: () => (
    <div style={{
      width: '450px',
      border: '1px solid #888',
      backgroundColor: '#c0c0c0',
      padding: '16px'
    }}>
      <h3 style={{ margin: '0 0 12px', fontFamily: 'monospace', fontSize: '12px' }}>
        System Preferences
      </h3>
      <Tabs defaultValue="network">
        <Tabs.List>
          <Tabs.Trigger value="network">Network</Tabs.Trigger>
          <Tabs.Trigger value="sharing">Sharing</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="network">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px' }}>Configure network settings</p>
            <div style={{ fontSize: '11px', color: '#444' }}>
              <strong>Status:</strong> Connected<br />
              <strong>IP Address:</strong> 192.168.1.100
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="sharing">
          <p style={{ margin: 0, fontSize: '12px' }}>File and printer sharing options</p>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <p style={{ margin: 0, fontSize: '12px' }}>Security and privacy settings</p>
        </Tabs.Panel>
      </Tabs>
    </div>
  ),
};
