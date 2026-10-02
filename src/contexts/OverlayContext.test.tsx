import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OverlayProvider } from './OverlayContext';

/**
 * The broadcast overlay is composited over a live camera feed inside the phone
 * streaming app (Larix). For the camera to show through, the canvas wrappers must
 * stay transparent — a solid background here would paint an opaque rectangle over
 * the video. These tests guard against a future change silently reintroducing one.
 */
describe('ScalableCanvas transparency (camera compositing guard)', () => {
  const renderCanvas = () =>
    render(
      <OverlayProvider width={1920} height={1080} connectionStatus="handshake-success">
        <div data-testid="panel">panel content</div>
      </OverlayProvider>
    );

  it('keeps the outer viewport wrapper transparent', () => {
    const { container } = renderCanvas();
    const outerWrapper = container.firstChild as HTMLElement;

    expect(outerWrapper).toBeTruthy();
    // Assert on the inline style directly: the wrapper must declare a transparent
    // background and must not carry any opaque color.
    expect(outerWrapper.style.backgroundColor).toBe('transparent');
  });

  it('keeps the inner 1920x1080 canvas transparent', () => {
    const { container } = renderCanvas();
    const outerWrapper = container.firstChild as HTMLElement;
    const innerCanvas = outerWrapper.firstChild as HTMLElement;

    expect(innerCanvas).toBeTruthy();
    expect(innerCanvas.style.background).toBe('transparent');
  });

  it('renders children inside the canvas without imposing a background on them', () => {
    const { getByTestId } = renderCanvas();
    // Sanity: children still render through the transparent canvas.
    expect(getByTestId('panel')).toBeInTheDocument();
  });
});
