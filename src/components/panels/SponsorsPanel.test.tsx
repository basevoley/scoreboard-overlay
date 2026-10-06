import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SponsorsPanel from './SponsorsPanel';
import type { SponsorsConfig } from '../../types/config';

const makeConfig = (overrides: Partial<SponsorsConfig> = {}): SponsorsConfig => ({
  enabled: true,
  imageUrls: ['a.png', 'b.png', 'c.png'],
  displayTime: 1000,
  ...overrides,
});

const opacityOf = (index: number) => screen.getByAltText(`Patrocinador ${index}`).style.opacity;

describe('SponsorsPanel', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders nothing and runs no timers while disabled', () => {
    const { container } = render(<SponsorsPanel sponsorsConfig={makeConfig({ enabled: false })} />);
    expect(container).toBeEmptyDOMElement();
    act(() => { vi.advanceTimersByTime(500); }); // let the visibility hook's own settle timer finish
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows the first sponsor first and advances after displayTime', () => {
    render(<SponsorsPanel sponsorsConfig={makeConfig()} />);
    expect(opacityOf(1)).toBe('1');
    expect(opacityOf(2)).toBe('0');

    act(() => { vi.advanceTimersByTime(1000); });
    expect(opacityOf(1)).toBe('0');
    expect(opacityOf(2)).toBe('1');
  });

  it('restarts from the first sponsor when re-enabled after being hidden', () => {
    const { rerender } = render(<SponsorsPanel sponsorsConfig={makeConfig()} />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(opacityOf(3)).toBe('1');

    rerender(<SponsorsPanel sponsorsConfig={makeConfig({ enabled: false })} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByAltText('Patrocinador 1')).toBeNull();

    rerender(<SponsorsPanel sponsorsConfig={makeConfig()} />);
    expect(opacityOf(1)).toBe('1');
  });

  it('restarts from the first sponsor when re-enabled during the fade-out', () => {
    const { rerender } = render(<SponsorsPanel sponsorsConfig={makeConfig()} />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(opacityOf(2)).toBe('1');

    rerender(<SponsorsPanel sponsorsConfig={makeConfig({ enabled: false })} />);
    act(() => { vi.advanceTimersByTime(100); });
    rerender(<SponsorsPanel sponsorsConfig={makeConfig()} />);
    expect(opacityOf(1)).toBe('1');
  });

  it('keeps a single sponsor shown without rotating', () => {
    render(<SponsorsPanel sponsorsConfig={makeConfig({ imageUrls: ['a.png'] })} />);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(opacityOf(1)).toBe('1');
    expect(vi.getTimerCount()).toBe(0);
  });
});
