import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { alert, confirm, prompt } from '../../app/components/system/dialog';
import { Button } from '../../app/components/ui/primitives/Button';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';

// Helper component for pixel icons
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <i className={`hn hn-${name} ${className}`} style={{ fontSize: 14 }} />
);

const meta: Meta = {
  title: 'System/Dialog Helpers',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Promise-based helper functions for common dialog patterns: `alert()`, `confirm()`, and `prompt()`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// ALERT HELPER
// =============================================================================

const AlertDemo = () => {
  const handleAlert = async () => {
    await alert({
      title: 'File Saved',
      message: 'Your document has been saved successfully.',
      icon: 'note',
    });
    console.log('Alert dismissed');
  };

  return (
    <Button buttonStyle="system" onClick={handleAlert}>
      Show Alert
    </Button>
  );
};

export const Alert: Story = {
  name: 'alert()',
  render: () => <AlertDemo />,
  parameters: {
    docs: {
      description: {
        story: `
\`\`\`tsx
await alert({
  title: 'File Saved',
  message: 'Your document has been saved successfully.',
  icon: 'note',
});
\`\`\`
        `,
      },
    },
  },
};

// =============================================================================
// CONFIRM HELPER
// =============================================================================

const ConfirmDemo = () => {
  const [result, setResult] = React.useState<boolean | null>(null);

  const handleConfirm = async () => {
    const confirmed = await confirm({
      title: 'Delete File?',
      message: 'Are you sure you want to delete "Important.txt"? This cannot be undone.',
      icon: 'caution',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    setResult(confirmed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Button buttonStyle="system" onClick={handleConfirm}>
        Show Confirm
      </Button>
      {result !== null && (
        <span style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          Result: <strong>{result ? 'Confirmed' : 'Cancelled'}</strong>
        </span>
      )}
    </div>
  );
};

export const Confirm: Story = {
  name: 'confirm()',
  render: () => <ConfirmDemo />,
  parameters: {
    docs: {
      description: {
        story: `
\`\`\`tsx
const confirmed = await confirm({
  title: 'Delete File?',
  message: 'Are you sure?',
  icon: 'caution',
});
if (confirmed) {
  // User clicked OK
}
\`\`\`
        `,
      },
    },
  },
};

// =============================================================================
// PROMPT HELPER
// =============================================================================

const PromptDemo = () => {
  const [result, setResult] = React.useState<string | null>(null);

  const handlePrompt = async () => {
    const value = await prompt({
      title: 'Rename File',
      message: 'Enter a new name for this file:',
      icon: 'note',
      defaultValue: 'Untitled.txt',
      placeholder: 'Enter filename...',
    });
    setResult(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Button buttonStyle="system" onClick={handlePrompt}>
        Show Prompt
      </Button>
      {result !== null && (
        <span style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
          Result: <strong>{result === null ? 'Cancelled' : `"${result}"`}</strong>
        </span>
      )}
    </div>
  );
};

export const Prompt: Story = {
  name: 'prompt()',
  render: () => <PromptDemo />,
  parameters: {
    docs: {
      description: {
        story: `
\`\`\`tsx
const filename = await prompt({
  title: 'Rename File',
  message: 'Enter a new name:',
  defaultValue: 'Untitled.txt',
});
if (filename !== null) {
  // User entered a value
}
\`\`\`
        `,
      },
    },
  },
};

// =============================================================================
// ALL ICON TYPES WITH HELPERS
// =============================================================================

const AllIconsDemo = () => {
  const showStop = () => alert({
    title: 'Error',
    message: 'An error has occurred.',
    icon: 'stop',
  });

  const showNote = () => alert({
    title: 'Information',
    message: 'This is an informational message.',
    icon: 'note',
  });

  const showCaution = () => alert({
    title: 'Warning',
    message: 'This action may have consequences.',
    icon: 'caution',
  });

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button buttonStyle="system" onClick={showStop}>
        <Icon name="exclamation-circle" /> Stop
      </Button>
      <Button buttonStyle="system" onClick={showNote}>
        <Icon name="info-circle" /> Note
      </Button>
      <Button buttonStyle="system" onClick={showCaution}>
        <Icon name="exclamation-triangle" /> Caution
      </Button>
    </div>
  );
};

export const AllIconTypes: Story = {
  name: 'Icon Types',
  render: () => <AllIconsDemo />,
};
