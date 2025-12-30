import type { Meta, StoryObj } from '@storybook/react';
import { WindowFrame, WindowTitleBar, WindowButton, ResizeHandle } from '../../app/components/ui/primitives/Window';
import { GroupFrame } from '../../app/components/ui/primitives/Forms';
import { ScrollArea } from '../../app/components/ui/primitives/ScrollArea';

const meta: Meta<typeof WindowFrame> = {
  title: 'Primitives/Window',
  component: WindowFrame,
  tags: ['autodocs'],
  argTypes: {
    isActive: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof WindowFrame>;

// 1. Complete Window Composition
export const CompleteWindow: Story = {
  render: (args) => (
    <WindowFrame {...args} style={{ width: 400, height: 300 }}>
      <WindowTitleBar
        title="My Computer"
        isActive={args.isActive}
        icon="/assets/classicy/img/icons/system/drives/disk.png"
        onClose={() => alert('Close')}
        onMinimize={() => alert('Minimize')}
        onMaximize={() => alert('Maximize')}
      />
      <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
        {/* Menu Bar Simulation */}
        <div className="flex gap-2 text-xs p-1 border-b border-gray-400 bg-gray-100">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>

        <ScrollArea className="flex-1 p-4">
          <GroupFrame legend="Disk Information" className="p-4 mb-4">
            <p className="text-sm font-sans mb-2">Local Disk (C:)</p>
            <div className="h-4 w-full bg-gray-200 border border-gray-400 shadow-inset relative">
              <div className="h-full bg-blue-600 w-[60%]"></div>
            </div>
            <p className="text-xs mt-1">60GB free of 100GB</p>
          </GroupFrame>

          <p className="text-sm">More content goes here...</p>
          <p className="text-sm">And scrollable too!</p>
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-sm text-gray-500">Log entry #{i + 1}</p>
          ))}
        </ScrollArea>
      </div>
      <ResizeHandle />
    </WindowFrame>
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
export const TitleBarOnly: StoryObj<typeof WindowTitleBar> = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <WindowTitleBar title="Active Window" isActive={true} onClose={() => { }} onMinimize={() => { }} />
      <WindowTitleBar title="Inactive Window" isActive={false} onClose={() => { }} onMinimize={() => { }} />
      <WindowTitleBar title="Custom Buttons" isActive={true}>
        <WindowButton variant="help" />
        <WindowButton variant="close" />
      </WindowTitleBar>
    </div>
  )
};

// 4. Buttons Only
export const Buttons: StoryObj<typeof WindowButton> = {
  render: () => (
    <div className="flex gap-4 p-4 bg-[#c0c0c0]">
      <WindowButton variant="close" />
      <WindowButton variant="collapse" />
      <WindowButton variant="fullscreen" />
      <WindowButton variant="help" />
      <WindowButton variant="close" disabled />
    </div>
  )
};
