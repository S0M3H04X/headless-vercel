import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { SystemDialog } from '../../app/components/system/dialog/SystemDialog';
import { Button } from '../../app/components/ui/primitives/Button';

const meta: Meta<typeof SystemDialog> = {
  title: 'System/SystemDialog',
  component: SystemDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['stop', 'note', 'caution'],
      description: 'Dialog icon type',
    },
    open: {
      control: 'boolean',
      description: 'Whether dialog is visible',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Whether clicking backdrop closes dialog',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// DIALOG ICON TYPES
// =============================================================================

export const StopDialog: Story = {
  render: () => (
    <SystemDialog open={true} onClose={() => { }} type="stop">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type="stop" />
        <SystemDialog.Title>Operation Failed</SystemDialog.Title>
      </div>
      <SystemDialog.Message>
        The file could not be saved. The disk may be full or write-protected.
      </SystemDialog.Message>
      <SystemDialog.Actions>
        <Button buttonStyle="system" isDefault>OK</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Stop dialogs (🛑) indicate errors or critical failures.',
      },
    },
  },
};

export const NoteDialog: Story = {
  render: () => (
    <SystemDialog open={true} onClose={() => { }} type="note">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type="note" />
        <SystemDialog.Title>Information</SystemDialog.Title>
      </div>
      <SystemDialog.Message>
        Your document has been saved successfully.
      </SystemDialog.Message>
      <SystemDialog.Actions>
        <Button buttonStyle="system" isDefault>OK</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Note dialogs (📝) provide informational messages.',
      },
    },
  },
};

export const CautionDialog: Story = {
  render: () => (
    <SystemDialog open={true} onClose={() => { }} type="caution">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type="caution" />
        <SystemDialog.Title>Delete Item?</SystemDialog.Title>
      </div>
      <SystemDialog.Message>
        Are you sure you want to move "Important File.txt" to the Trash? This action cannot be undone.
      </SystemDialog.Message>
      <SystemDialog.Actions>
        <Button buttonStyle="system">Cancel</Button>
        <Button buttonStyle="system" isDefault>Delete</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Caution dialogs (⚠️) warn about potentially dangerous actions.',
      },
    },
  },
};

// =============================================================================
// DIALOG PATTERNS
// =============================================================================

export const ConfirmDialog: Story = {
  name: 'Confirm Pattern',
  render: () => (
    <SystemDialog open={true} onClose={() => { }} type="caution">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type="caution" />
        <SystemDialog.Title>Unsaved Changes</SystemDialog.Title>
      </div>
      <SystemDialog.Message>
        Do you want to save changes to "Untitled" before closing?
      </SystemDialog.Message>
      <SystemDialog.Actions>
        <Button buttonStyle="system">Don't Save</Button>
        <Button buttonStyle="system">Cancel</Button>
        <Button buttonStyle="system" isDefault>Save</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  ),
};

export const AlertDialog: Story = {
  name: 'Alert Pattern',
  render: () => (
    <SystemDialog open={true} onClose={() => { }} type="note">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <SystemDialog.Icon type="note" />
        <SystemDialog.Title>Update Available</SystemDialog.Title>
      </div>
      <SystemDialog.Message>
        A new version of the application is available. Would you like to update now?
      </SystemDialog.Message>
      <SystemDialog.Actions>
        <Button buttonStyle="system">Not Now</Button>
        <Button buttonStyle="system" isDefault>Update</Button>
      </SystemDialog.Actions>
    </SystemDialog>
  ),
};

// =============================================================================
// INTERACTIVE DEMO
// =============================================================================

const InteractiveDialogDemo = () => {
  const [openDialog, setOpenDialog] = useState<'stop' | 'note' | 'caution' | null>(null);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button buttonStyle="system" onClick={() => setOpenDialog('stop')}>
        Show Stop
      </Button>
      <Button buttonStyle="system" onClick={() => setOpenDialog('note')}>
        Show Note
      </Button>
      <Button buttonStyle="system" onClick={() => setOpenDialog('caution')}>
        Show Caution
      </Button>

      {openDialog && (
        <SystemDialog
          open={true}
          onClose={() => setOpenDialog(null)}
          type={openDialog}
          closeOnBackdropClick
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <SystemDialog.Icon type={openDialog} />
            <SystemDialog.Title>
              {openDialog === 'stop' && 'Error'}
              {openDialog === 'note' && 'Notice'}
              {openDialog === 'caution' && 'Warning'}
            </SystemDialog.Title>
          </div>
          <SystemDialog.Message>
            This is a {openDialog} dialog. Click the button or press Escape to close.
          </SystemDialog.Message>
          <SystemDialog.Actions>
            <Button buttonStyle="system" isDefault onClick={() => setOpenDialog(null)}>
              OK
            </Button>
          </SystemDialog.Actions>
        </SystemDialog>
      )}
    </div>
  );
};

export const InteractiveDemo: Story = {
  name: 'Interactive Demo',
  render: () => <InteractiveDialogDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Click buttons to open different dialog types. Dialogs can be closed with the button, Escape key, or backdrop click.',
      },
    },
  },
};

// =============================================================================
// ALL ICONS
// =============================================================================

export const AllIcons: Story = {
  name: 'All Icon Types',
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <SystemDialog.Icon type="stop" />
        <div style={{ fontFamily: 'sans-serif', fontSize: 11, marginTop: 4 }}>Stop</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SystemDialog.Icon type="note" />
        <div style={{ fontFamily: 'sans-serif', fontSize: 11, marginTop: 4 }}>Note</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SystemDialog.Icon type="caution" />
        <div style={{ fontFamily: 'sans-serif', fontSize: 11, marginTop: 4 }}>Caution</div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
