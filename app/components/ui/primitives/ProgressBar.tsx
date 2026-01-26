import React from 'react';
import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  /**
   * Current progress value (0 to 100).
   * If not provided, renders an indeterminate loading animation.
   */
  value?: number;
  /**
   * Valid CSS width (e.g., '100%', '200px'). Default: '100%'.
   */
  width?: string;
  /**
   * Valid CSS height (e.g., '20px'). Default: '20px'.
   */
  height?: string;
  /**
   * Optional label to display above or inside the bar.
   */
  label?: string;
  /**
   * Show the percentage text? Default: false.
   */
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = '100%',
  height = '20px',
  label,
  showPercentage = true,
  className = '',
}) => {
  const isIndeterminate = value === undefined;
  const percentage = value ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className={`${styles.container} ${className}`} style={{ width }}>
      {(label || showPercentage) && (
        <div className={styles.labelRow}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && !isIndeterminate && (
            <span className={styles.percentage}>{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div className={styles.track} style={{ height }}>
        {isIndeterminate ? (
          <div className={styles.indeterminateFill}>
            {/* Animated repeating blocks */}
            <div className={styles.block} />
            <div className={styles.block} />
            <div className={styles.block} />
            <div className={styles.block} />
          </div>
        ) : (
          <div
            className={styles.fill}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
