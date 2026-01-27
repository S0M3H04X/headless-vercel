import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScrollArea } from '../../app/components/ui/primitives/ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
    hideScrollbar: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content for scrolling
const LongContent = () => (
  <div style={{ padding: '8px' }}>
    {Array.from({ length: 30 }, (_, i) => (
      <p key={i} style={{ margin: '4px 0', fontFamily: 'monospace', fontSize: '12px' }}>
        Line {i + 1}: Lorem ipsum dolor sit amet
      </p>
    ))}
  </div>
);

const WideContent = () => (
  <div style={{ padding: '8px', whiteSpace: 'nowrap' }}>
    {Array.from({ length: 10 }, (_, i) => (
      <p key={i} style={{ margin: '4px 0', fontFamily: 'monospace', fontSize: '12px' }}>
        This is a very long line of text that extends horizontally to demonstrate horizontal scrolling behavior in the ScrollArea component. Line {i + 1}.
      </p>
    ))}
  </div>
);

// =============================================================================
// STORIES
// =============================================================================

export const VerticalScroll: Story = {
  render: () => (
    <div style={{
      width: '300px',
      height: '200px',
      border: '1px solid #888',
      backgroundColor: '#fff'
    }}>
      <ScrollArea orientation="vertical" className="h-full">
        <ScrollArea.Viewport>
          <LongContent />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea>
    </div>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <div style={{
      width: '300px',
      height: '150px',
      border: '1px solid #888',
      backgroundColor: '#fff'
    }}>
      <ScrollArea orientation="horizontal">
        <ScrollArea.Viewport>
          <WideContent />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea>
    </div>
  ),
};

export const BothScrollbars: Story = {
  render: () => (
    <div style={{
      width: '300px',
      height: '200px',
      border: '1px solid #888',
      backgroundColor: '#fff'
    }}>
      <ScrollArea orientation="both">
        <ScrollArea.Viewport>
          <div style={{ width: '500px' }}>
            <LongContent />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea>
    </div>
  ),
};

export const HiddenScrollbar: Story = {
  args: {
    hideScrollbar: true,
  },
  render: (args) => (
    <div style={{
      width: '300px',
      height: '200px',
      border: '1px solid #888',
      backgroundColor: '#fff'
    }}>
      <ScrollArea {...args}>
        <ScrollArea.Viewport>
          <LongContent />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea>
    </div>
  ),
};
