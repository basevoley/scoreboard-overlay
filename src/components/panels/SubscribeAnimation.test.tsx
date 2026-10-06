import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SubscribeAnimation from './SubscribeAnimation';
import type { SubscribeConfig } from '../../types/config';

const confettiMock = vi.hoisted(() => vi.fn());
vi.mock('canvas-confetti', () => ({ default: confettiMock }));

const makeConfig = (overrides: Partial<SubscribeConfig> = {}): SubscribeConfig => ({
  enabled: true,
  position: 'top-left',
  logoUrl: 'logo.png',
  callToActionText: 'Subscribe',
  buttonColor: '#ff0000',
  ...overrides,
});

describe('SubscribeAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    confettiMock.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('renders nothing while disabled', () => {
    const { container } = render(<SubscribeAnimation config={makeConfig({ enabled: false })} />);
    expect(container).toBeEmptyDOMElement();
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it('mounts and fires confetti once when enabled', () => {
    const { rerender } = render(<SubscribeAnimation config={makeConfig({ enabled: false })} />);
    rerender(<SubscribeAnimation config={makeConfig()} />);
    act(() => { vi.advanceTimersByTime(100); });

    expect(screen.getByText('Subscribe')).toBeInTheDocument();
    expect(confettiMock).toHaveBeenCalledTimes(1);
  });

  it('unmounts after the fade-out when disabled', () => {
    const { rerender, container } = render(<SubscribeAnimation config={makeConfig()} />);
    expect(screen.getByText('Subscribe')).toBeInTheDocument();

    rerender(<SubscribeAnimation config={makeConfig({ enabled: false })} />);
    expect(screen.getByText('Subscribe')).toBeInTheDocument(); // still fading out
    act(() => { vi.advanceTimersByTime(500); });
    expect(container).toBeEmptyDOMElement();
  });
});
