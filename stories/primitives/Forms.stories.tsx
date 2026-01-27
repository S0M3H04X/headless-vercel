import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GroupFrame, Radio, Checkbox, Select } from '../../app/components/ui/primitives/Forms';
import { useState } from 'react';

// =============================================================================
// GROUP FRAME META
// =============================================================================

const groupFrameMeta: Meta<typeof GroupFrame> = {
  title: 'Primitives/Forms/GroupFrame',
  component: GroupFrame,
  tags: ['autodocs'],
  argTypes: {
    legend: {
      control: 'text',
      description: 'Legend text displayed at the top of the frame',
    },
  },
};

export default groupFrameMeta;

// =============================================================================
// GROUP FRAME STORIES
// =============================================================================

export const BasicGroupFrame: StoryObj<typeof GroupFrame> = {
  args: {
    legend: 'Options',
    children: 'Content goes here...',
  },
};

export const GroupFrameWithControls: StoryObj<typeof GroupFrame> = {
  render: () => (
    <GroupFrame legend="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Checkbox label="Enable notifications" />
        <Checkbox label="Show preview" />
        <Checkbox label="Auto-save" defaultChecked />
      </div>
    </GroupFrame>
  ),
};

// =============================================================================
// RADIO META & STORIES
// =============================================================================

export const RadioGroup: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState('medium');
    return (
      <GroupFrame legend="Size">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Radio
            name="size"
            value="small"
            label="Small"
            checked={selected === 'small'}
            onChange={() => setSelected('small')}
          />
          <Radio
            name="size"
            value="medium"
            label="Medium"
            checked={selected === 'medium'}
            onChange={() => setSelected('medium')}
          />
          <Radio
            name="size"
            value="large"
            label="Large"
            checked={selected === 'large'}
            onChange={() => setSelected('large')}
          />
        </div>
        <p style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '11px' }}>
          Selected: {selected}
        </p>
      </GroupFrame>
    );
  },
};

// =============================================================================
// CHECKBOX META & STORIES
// =============================================================================

export const CheckboxStates: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled Checked" disabled defaultChecked />
    </div>
  ),
};

// =============================================================================
// SELECT META & STORIES
// =============================================================================

export const SelectBasic: StoryObj = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Select
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
            { value: 'date', label: 'Date' },
          ]}
          placeholder="Select a fruit..."
          value={value}
          onChange={setValue}
        />
        <p style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          Selected: {value || 'none'}
        </p>
      </div>
    );
  },
};

export const SelectWithDisabled: StoryObj = {
  render: () => (
    <Select
      options={[
        { value: 'opt1', label: 'Available Option' },
        { value: 'opt2', label: 'Disabled Option', disabled: true },
        { value: 'opt3', label: 'Another Option' },
      ]}
      placeholder="Choose..."
    />
  ),
};

export const SelectDisabled: StoryObj = {
  render: () => (
    <Select
      options={[
        { value: 'opt1', label: 'Option 1' },
      ]}
      defaultValue="opt1"
      disabled
    />
  ),
};

// =============================================================================
// ALL FORMS GALLERY
// =============================================================================

export const FormsGallery: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <GroupFrame legend="Personal Info">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Checkbox label="Subscribe to newsletter" />
          <Checkbox label="Accept terms and conditions" />
        </div>
      </GroupFrame>

      <GroupFrame legend="Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontFamily: 'monospace', fontSize: '11px' }}>Theme:</label>
          <Select
            options={[
              { value: 'platinum', label: 'Platinum' },
              { value: 'classic', label: 'Classic Mac' },
              { value: 'dark', label: 'Dark Mode' },
            ]}
            defaultValue="platinum"
          />
        </div>
      </GroupFrame>
    </div>
  ),
};
