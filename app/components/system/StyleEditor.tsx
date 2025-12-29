// app/components/system/StyleEditor.tsx
'use client';

import React, { useState } from 'react';
import { useStylePermissions } from '@/hooks/usePermissions';
import { useDesignSystemStore } from '@/store/designSystemStore';
import { THEME_PRESETS } from '@/lib/types/designSystem';
import { useMembershipStore } from '@/store/membershipStore';
import { SystemButton } from '@/components/ui/SystemButton';

/**
 * StyleEditor - UI for customizing design tokens (tier-gated)
 * 
 * Features:
 * - Theme preset selector (available to all)
 * - Color picker (Tier 1+)
 * - Font selector (Tier 2 only)
 */

const ComponentEditor: React.FC = () => {
  const { getActiveTheme, customizeComponents } = useDesignSystemStore();
  const theme = getActiveTheme();

  // Initialize state from current theme (defaults to Classicy if missing)
  const [winBg, setWinBg] = useState(theme.components?.window.background || '#dfdfdf');
  const [menuBg, setMenuBg] = useState(theme.components?.menu.background || '#e0e0e0');
  const [btnBg, setBtnBg] = useState(theme.components?.button.background || '#dfdfdf');

  const handleApply = () => {
    customizeComponents({
      window: { background: winBg },
      menu: { background: menuBg },
      button: { background: btnBg },
    });
  };

  const Row = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-sm)' }}>
      <span style={{ width: '100px', fontSize: '11px' }}>{label}:</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '30px', height: '20px', border: 'none', cursor: 'pointer' }}
      />
      <code style={{ fontSize: '10px', opacity: 0.7 }}>{value}</code>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-sm)' }}>
      <Row label="Window Bg" value={winBg} onChange={setWinBg} />
      <Row label="Menu Bg" value={menuBg} onChange={setMenuBg} />
      <Row label="Button Bg" value={btnBg} onChange={setBtnBg} />

      <div style={{ marginTop: '4px' }}>
        <SystemButton onClick={handleApply}>Apply Styles</SystemButton>
      </div>
    </div>
  );
};

/**
 * StyleEditor - UI for customizing design tokens (tier-gated)
 */
export const StyleEditor: React.FC = () => {
  const { colors: canColors, fonts: canFonts, tier } = useStylePermissions();
  const { meetsMinimumTier } = useMembershipStore();
  const {
    activePresetId,
    setPreset,
    customizeColors,
    resetCustomizations,
    getActiveTheme,
  } = useDesignSystemStore();

  const activeTheme = getActiveTheme();

  // Local state for color editor
  const [primaryColor, setPrimaryColor] = useState(activeTheme.colors.primary);
  const [accentColor, setAccentColor] = useState(activeTheme.colors.accent);

  const handlePresetChange = (presetId: string) => {
    setPreset(presetId as any);
  };

  const handleColorApply = () => {
    customizeColors({
      primary: primaryColor,
      accent: accentColor,
    });
  };

  return (
    <div
      className="style-editor"
      style={{
        padding: 'var(--ds-spacing-md)',
        fontFamily: 'var(--ds-font-system)',
        fontSize: 'var(--ds-font-size-sm)',
      }}
    >
      <h3 style={{ margin: '0 0 var(--ds-spacing-md) 0' }}>
        🎨 Style Editor
      </h3>

      {/* Theme Presets Section */}
      <section style={{ marginBottom: 'var(--ds-spacing-lg)' }}>
        <h4 style={{ margin: '0 0 var(--ds-spacing-sm) 0', fontSize: 'var(--ds-font-size-sm)' }}>
          Theme Presets
        </h4>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-sm)', flexWrap: 'wrap' }}>
          {THEME_PRESETS.map((preset) => {
            const isAvailable = meetsMinimumTier(preset.requiredTier);
            const isActive = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => isAvailable && handlePresetChange(preset.id)}
                disabled={!isAvailable}
                style={{
                  padding: 'var(--ds-spacing-sm) var(--ds-spacing-md)',
                  border: isActive ? '2px solid var(--ds-color-accent)' : '1px solid #ccc',
                  borderRadius: '4px',
                  background: isActive ? 'var(--ds-color-primary-light)' : 'var(--ds-color-surface)',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.5,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                {preset.name}
                {!isAvailable && ' 🔒'}
              </button>
            );
          })}
        </div>
      </section>

      {/* Color Customization Section */}
      <section style={{ marginBottom: 'var(--ds-spacing-lg)' }}>
        <h4 style={{
          margin: '0 0 var(--ds-spacing-sm) 0',
          fontSize: 'var(--ds-font-size-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-xs)',
        }}>
          Colors
          {!canColors && <span style={{ opacity: 0.6 }}>🔒 Tier 1+</span>}
        </h4>

        {canColors ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-sm)' }}>
              <span style={{ width: '80px' }}>Primary:</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
              />
              <code style={{ fontSize: 'var(--ds-font-size-xs)', opacity: 0.7 }}>
                {primaryColor}
              </code>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-sm)' }}>
              <span style={{ width: '80px' }}>Accent:</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
              />
              <code style={{ fontSize: 'var(--ds-font-size-xs)', opacity: 0.7 }}>
                {accentColor}
              </code>
            </label>

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-sm)', marginTop: 'var(--ds-spacing-xs)' }}>
              <SystemButton onClick={handleColorApply}>
                Apply Colors
              </SystemButton>
            </div>
          </div>
        ) : (
          <div style={{
            padding: 'var(--ds-spacing-md)',
            background: 'var(--ds-color-background-alt)',
            borderRadius: '4px',
            textAlign: 'center',
            opacity: 0.7,
          }}>
            Upgrade to Tier 1 to customize colors
          </div>
        )}

        {/* ... existing color/font sections ... */}
        {/* Component Customization Section */}
        <section style={{ marginBottom: 'var(--ds-spacing-lg)' }}>
          <h4 style={{
            margin: '0 0 var(--ds-spacing-sm) 0',
            fontSize: 'var(--ds-font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-xs)',
          }}>
            Components
            {!canColors && <span style={{ opacity: 0.6 }}>🔒 Tier 1+</span>}
          </h4>

          {canColors ? (
            <ComponentEditor />
          ) : (
            <div style={{ opacity: 0.7, padding: '8px', background: '#eee' }}>Upgrade to Tier 1</div>
          )}
        </section>
      </section>

      {/* Font Customization Section */}
      <section style={{ marginBottom: 'var(--ds-spacing-lg)' }}>
        <h4 style={{
          margin: '0 0 var(--ds-spacing-sm) 0',
          fontSize: 'var(--ds-font-size-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-xs)',
        }}>
          Fonts
          {!canFonts && <span style={{ opacity: 0.6 }}>🔒 Tier 2</span>}
        </h4>

        {canFonts ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-sm)' }}>
            <p style={{ margin: 0, opacity: 0.7 }}>
              Font customization coming soon...
            </p>
          </div>
        ) : (
          <div style={{
            padding: 'var(--ds-spacing-md)',
            background: 'var(--ds-color-background-alt)',
            borderRadius: '4px',
            textAlign: 'center',
            opacity: 0.7,
          }}>
            Upgrade to Tier 2 to customize fonts
          </div>
        )}
      </section>

      {/* Reset Button */}
      <section>
        <SystemButton onClick={resetCustomizations}>
          Reset to Default
        </SystemButton>
      </section>

      {/* Tier Info */}
      <div style={{
        marginTop: 'var(--ds-spacing-lg)',
        padding: 'var(--ds-spacing-sm)',
        background: 'var(--ds-color-primary)',
        borderRadius: '4px',
        fontSize: 'var(--ds-font-size-xs)',
        textAlign: 'center',
      }}>
        Current tier: <strong>{tier}</strong>
      </div>
    </div >
  );
};
