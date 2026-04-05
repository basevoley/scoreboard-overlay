import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DroplinePanel from './components/shared/DroplinePanel';

describe('DroplinePanel', () => {
  it('renders nothing when no text is provided', () => {
    const { container } = render(
      <DroplinePanel isTopPosition={true} isAnimatedIn={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders text lines when provided', () => {
    render(
      <DroplinePanel
        textLine1="Timeout"
        textLine2="Team A"
        isTopPosition={true}
        isAnimatedIn={true}
      />
    );
    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <DroplinePanel
        icon="/clock-timeout.png"
        textLine1="Timeout"
        isTopPosition={false}
        isAnimatedIn={true}
      />
    );
    expect(screen.getByAltText('Info Icon')).toBeInTheDocument();
  });
});
