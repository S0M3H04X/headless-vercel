
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { ClassicyWindow } from '../../app/components/system/window/ClassicyWindow';
import { WindowLayout } from '../../app/components/system/window/WindowLayout';
import { Button } from '../../app/components/ui/primitives/Button';
import { usePolygon, Point } from '../../app/hooks/usePolygon';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';

// Mocking store is not needed if we are okay with real store updates or if strict mode isn't an issue.
// For pure visual testing, we assume the store works or is allowed to fail silently if no context.


const meta: Meta<typeof ClassicyWindow> = {
  title: 'System/PolygonWindow',
  component: ClassicyWindow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        backgroundColor: '#dfdfdf',
        overflow: 'hidden',
        border: '1px solid #000'
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// INTERACTIVE EDITOR DEMO
// =============================================================================

const PolygonEditorDemo = () => {
  const width = 500;
  const height = 400;

  // Initial Hexagon-ish shape
  const initialPoints: Point[] = [
    { x: 100, y: 0 },
    { x: 400, y: 0 },
    { x: 500, y: 200 },
    { x: 400, y: 400 },
    { x: 100, y: 400 },
    { x: 0, y: 200 },
  ];

  const { points, setPoints } = usePolygon(initialPoints);
  const [isEditing, setIsEditing] = useState(true);

  return (
    <div>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: 10,
        border: '1px solid black'
      }}>
        <Button buttonStyle="system" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Finish Editing' : 'Edit Shape'}
        </Button>
        <p style={{ marginTop: 8, fontSize: 12 }}>
          {isEditing ? 'Drag white handles to move. Click semi-transparent handles to split edges.' : 'Content is clipped to the polygon shape.'}
        </p>
      </div>

      <ClassicyWindow
        id="polygon-demo"
        title="Polygon Window"
        isActive={true}
        geometry={{ x: 100, y: 50, width, height }}
        zIndex={1}
        points={points}
        onUpdatePoints={setPoints}
        isEditingShape={isEditing}
      >
        <WindowLayout>
          <WindowLayout.Content>
            <div style={{ padding: 20 }}>
              <h2 style={{ fontFamily: 'sans-serif', margin: '0 0 10px 0' }}>Adaptive Content</h2>
              <p style={{ fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                This content lives inside an arbitrary polygon shape.
                The OS clips the content area to match the custom frame.
                Try editing the shape to see how the content responds!
              </p>
              <p style={{ fontFamily: 'sans-serif', lineHeight: 1.5, marginTop: 10 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Button buttonStyle="tool">Action</Button>
              </div>
            </div>
          </WindowLayout.Content>
        </WindowLayout>
      </ClassicyWindow>
    </div>
  );
};

export const InteractiveEditor: Story = {
  render: () => <PolygonEditorDemo />,
};

// =============================================================================
// PRESETS
// =============================================================================

export const DiamondShape: Story = {
  render: () => {
    const points = [
      { x: 200, y: 0 },
      { x: 400, y: 200 },
      { x: 200, y: 400 },
      { x: 0, y: 200 },
    ];

    return (
      <ClassicyWindow
        id="diamond"
        title="Diamond"
        isActive={true}
        geometry={{ x: 100, y: 50, width: 400, height: 400 }}
        zIndex={1}
        points={points}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#000',
          fontFamily: 'sans-serif'
        }}>
          <strong>Diamond Window</strong>
        </div>
      </ClassicyWindow>
    );
  }
};
