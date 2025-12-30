import React from 'react';

export interface PixelIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, className, ...props }) => {
  return <i className={`hn hn-${name} ${className || ''}`} {...props} />;
};
