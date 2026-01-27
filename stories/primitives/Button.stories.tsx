import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../app/components/ui/primitives/Button';
import { PixelIcon } from '../../app/components/ui/PixelIcon';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'help', 'disclosure'],
      description: 'Logical variant: default (action), help (?), disclosure (▾)',
    },
    buttonStyle: {
      control: 'select',
      options: ['system', 'tool', 'menu', 'custom'],
      description: 'Visual style: system (dialogs), tool (icon-only), menu, custom (widget)',
    },
    isDefault: {
      control: 'boolean',
      description: 'If true, renders as default/primary button with pulsing border',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// BUTTON STYLES
// =============================================================================

export const SystemDefault: Story = {
  args: {
    children: 'OK',
    buttonStyle: 'system',
    isDefault: true,
  },
};

export const SystemNormal: Story = {
  args: {
    children: 'Cancel',
    buttonStyle: 'system',
  },
};

export const ToolButton: Story = {
  args: {
    buttonStyle: 'tool',
  },
  render: (args) => (
    <Button {...args}>
      <PixelIcon name="product_browser" size={16} />
    </Button>
  ),
};

export const MenuButton: Story = {
  args: {
    children: 'File',
    buttonStyle: 'menu',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '150px', backgroundColor: '#fff' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomWidget: Story = {
  args: {
    children: 'Add to Cart',
    buttonStyle: 'custom',
  },
};

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const HelpButton: Story = {
  args: {
    variant: 'help',
    buttonStyle: 'system',
  },
};

export const DisclosureButton: Story = {
  args: {
    variant: 'disclosure',
    buttonStyle: 'system',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    buttonStyle: 'system',
    disabled: true,
  },
};

// =============================================================================
// BUTTON GALLERY
// =============================================================================

export const AllStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'monospace' }}>System Buttons</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button buttonStyle="system" isDefault>OK</Button>
          <Button buttonStyle="system">Cancel</Button>
          <Button buttonStyle="system" disabled>Disabled</Button>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'monospace' }}>Tool Buttons</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button buttonStyle="tool"><PixelIcon name="product_browser" size={16} /></Button>
          <Button buttonStyle="tool"><PixelIcon name="pdf_viewer" size={16} /></Button>
          <Button buttonStyle="tool"><PixelIcon name="cart" size={16} /></Button>
          <Button buttonStyle="tool"><PixelIcon name="profile" size={16} /></Button>
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'monospace' }}>Variants</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button variant="help" buttonStyle="system" />
          <Button variant="disclosure" buttonStyle="system" />
        </div>
      </div>
      <div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'monospace' }}>Custom Style</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button buttonStyle="custom">Add to Cart</Button>
          <Button buttonStyle="custom">Buy Now</Button>
        </div>
      </div>
    </div>
  ),
};
