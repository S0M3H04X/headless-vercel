import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HelloWorld from '../sections/HelloWorld';

describe('HelloWorld Section', () => {
  it('renders default content correctly', () => {
    render(<HelloWorld />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello, World!');
    expect(screen.getByTestId('hello-world-section')).toBeInTheDocument();
    expect(screen.getByAltText('Shoppy X-ray')).toBeInTheDocument();
  });

  it('renders custom props', () => {
    const customTitle = "Custom Title";
    const customDesc = "Custom Description";
    
    render(<HelloWorld title={customTitle} description={customDesc} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDesc)).toBeInTheDocument();
  });
});