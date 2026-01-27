import React from 'react';
import styles from './PixelIcon.module.scss';

export interface PixelIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, className, ...props }) => {
  return <i className={`hn hn-${name} ${styles.dockPanel}}`} {...props} />;
};
