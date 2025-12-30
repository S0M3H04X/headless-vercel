import type { Meta, StoryObj } from '@storybook/react';
import { Window } from '../../app/components/ui/primitives';
import { GroupFrame } from '../../app/components/ui/primitives/Forms';
import { ScrollArea } from '../../app/components/ui/primitives/ScrollArea';

const meta: Meta<typeof Window.Frame> = {
  title: 'Primitives/Window',
  component: Window.Frame,
  tags: ['autodocs'],
  argTypes: {
    isActive: { control: 'boolean' },
  },
  subcomponents: {
    TitleBar: Window.TitleBar,
    Controls: Window.Controls,
    ResizeHandle: Window.ResizeHandle,
    Layout: Window.Layout as any,
  }
};

export default meta;
type Story = StoryObj<typeof Window.Frame>;

// 1. Complete Window Composition
export const CompleteWindow: Story = {
  render: (args) => (
    <Window.Frame {...args} style={{ width: 400, height: 300 }}>
      {/* 1. Title Bar */}
      <Window.TitleBar
        title="My Computer"
        isActive={args.isActive}
        icon="/assets/classicy/img/icons/system/drives/disk.png"
        onClose={() => alert('Close')}
        onMinimize={() => alert('Minimize')}
        onMaximize={() => alert('Maximize')}
      />

      {/* 2. Window Layout (Content Area) */}
      <Window.Layout className="flex-1 bg-white relative">
        <Window.Layout.Toolbar>
          <div className="flex gap-2 text-xs w-full">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Help</span>
          </div>
        </Window.Layout.Toolbar>

        <Window.Layout.Content>
          <ScrollArea className="h-full">
            <GroupFrame legend="Disk Information" className="p-4 mb-4">
              <p className="text-sm font-sans mb-2">Local Disk (C:)</p>
              <div className="h-4 w-full bg-gray-200 border border-gray-400 shadow-inset relative">
                <div className="h-full bg-blue-600 w-[60%]"></div>
              </div>
              <p className="text-xs mt-1">60GB free of 100GB</p>
            </GroupFrame>

            {Array.from({ length: 5 }).map((_, i) => (
              <p key={i} className="text-sm text-gray-500 mb-2">My Document #{i + 1}</p>
            ))}
          </ScrollArea>
        </Window.Layout.Content>

        <Window.Layout.StatusBar>
          <span>5 items</span>
          <span>120 MB</span>
        </Window.Layout.StatusBar>
      </Window.Layout>

      {/* 3. Resize Handle */}
      <Window.ResizeHandle />
    </Window.Frame>
  ),
  args: {
    isActive: true,
  },
};

// 2. Inactive State
export const InactiveState: Story = {
  ...CompleteWindow,
  args: {
    isActive: false,
  }
};

// 3. TitleBar Only
export const TitleBarOnly: StoryObj<typeof Window.TitleBar> = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <Window.TitleBar title="Active Window" isActive={true} onClose={() => { }} onMinimize={() => { }} />
      <Window.TitleBar title="Inactive Window" isActive={false} onClose={() => { }} onMinimize={() => { }} />
      <Window.TitleBar title="Custom Buttons" isActive={true}>
        <Window.Controls variant="help" />
        <Window.Controls variant="close" />
      </Window.TitleBar>
    </div>
  )
};

// 4. Controls Only
export const Controls: StoryObj<typeof Window.Controls> = {
  render: () => (
    <div className="flex gap-4 p-4 bg-[#c0c0c0]">
      <Window.Controls variant="close" />
      <Window.Controls variant="collapse" />
      <Window.Controls variant="fullscreen" />
      <Window.Controls variant="help" />
      <Window.Controls variant="close" disabled />
    </div>
  )
};

