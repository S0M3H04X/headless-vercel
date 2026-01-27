import type { Meta, StoryObj } from '@storybook/react';
import { AccessDenied } from '../../app/components/ui/AccessDenied';
import { WidgetRenderer } from '../../app/components/widgets/Registry';
import { WidgetKind } from '../../app/lib/types/workspace';

const meta: Meta<typeof AccessDenied> = {
  title: 'System/AccessControl',
  component: AccessDenied,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[300px] border border-gray-400 shadow-outset mx-auto my-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AccessDenied>;

export const Default: Story = {
  args: {
    requiredTier: 'member',
  },
  parameters: {
    tier: 'guest', // User is guest, so access is denied
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'This area is restricted to Pro users only.',
  },
  parameters: {
    tier: 'member', // User is member, but maybe pro is needed
  },
};

// Demonstrate Widget Gating via Registry (Integration Test)
const WidgetGatingDemo = () => {
  return (
    <WidgetRenderer
      id="test-widget"
      content={{ kind: WidgetKind.UserProfile, sourceId: 'test' }}
    />
  );
};

export const WidgetGating_MemberOnly_AsGuest: StoryObj = {
  render: () => <WidgetGatingDemo />,
  parameters: {
    tier: 'guest', // Should show AccessDenied because UserProfile is member-only
  }
};

export const WidgetGating_MemberOnly_AsMember: StoryObj = {
  render: () => <WidgetGatingDemo />,
  parameters: {
    tier: 'member', // Should show UserProfile (Mock Data)
  }
};
