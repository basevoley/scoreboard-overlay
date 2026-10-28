import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createElement } from 'react';
import ShootingText from './ShootingText';

const controls = { start: vi.fn() };

// Framer's animations do not run in jsdom; plain elements are enough to check structure and wiring
vi.mock('framer-motion', () => {
  const STRIPPED = new Set(['animate', 'initial', 'exit', 'transition']);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
      const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !STRIPPED.has(key)));
      return createElement(tag, domProps, children as never);
    },
  });
  return { motion, useAnimationControls: () => controls };
});

const props = { primaryColor: '#112233', secondaryColor: '#445566' };
const wordOf = (container: HTMLElement) => container.querySelectorAll('svg');
const strokes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('line')).map(l => l.getAttribute('stroke'));

describe('ShootingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    controls.start = vi.fn(() => Promise.resolve());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders each letter with its own impact hole, except spaces', () => {
    const { container } = render(<ShootingText text="HO LA" {...props} />);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(wordOf(container)).toHaveLength(4);
  });

  it('keeps emojis whole', () => {
    const { container } = render(<ShootingText text="👏A" {...props} />);
    expect(screen.getByText('👏')).toBeInTheDocument();
    expect(wordOf(container)).toHaveLength(2);
  });

  it('renders nothing for empty text', () => {
    const { container } = render(<ShootingText text="" {...props} />);
    expect(wordOf(container)).toHaveLength(0);
  });

  it('draws the letters in Arial Black without forcing upper case', () => {
    render(<ShootingText text="Ola" {...props} />);
    const letter = screen.getByText('O');
    expect(letter.style.fontFamily).toContain('Arial Black');
    expect(letter.style.textTransform).toBe('');
    expect(screen.getByText('l')).toBeInTheDocument();
  });

  it('glows with the team colours', () => {
    render(<ShootingText text="O" {...props} />);
    const shadow = screen.getByText('O').style.textShadow;
    expect(shadow).toContain('#112233');
    expect(shadow).toContain('#445566');
  });

  it('draws every crack, fork and stress arc in black, none in white', () => {
    const { container } = render(<ShootingText text="TIRO" {...props} />);
    const all = strokes(container);
    expect(all.length).toBeGreaterThan(0);
    all.forEach(stroke => {
      expect(stroke).toMatch(/^rgba\(0, 0, 0, /);
      expect(stroke).not.toContain('255');
    });
  });

  it('draws a jagged hole and glass shards for each letter', () => {
    const { container } = render(<ShootingText text="A" {...props} />);
    const polygons = container.querySelectorAll('polygon');
    // two hole layers, plus 4-6 shards
    expect(polygons.length).toBeGreaterThanOrEqual(2 + 4);
    expect(polygons.length).toBeLessThanOrEqual(2 + 6);
    expect(polygons[0].getAttribute('points')!.split(' ')).toHaveLength(11);
  });

  it('gives every hole its own gradient id', () => {
    const { container } = render(<ShootingText text="AB" {...props} />);
    const ids = Array.from(container.querySelectorAll('radialGradient')).map(g => g.id);
    expect(ids).toEqual(['hole-0', 'hole-1']);
  });

  it('does not re-roll the random geometry when re-rendered with the same text', () => {
    const random = vi.spyOn(Math, 'random');
    const { rerender, container } = render(<ShootingText text="TIRO" {...props} />);
    const before = container.innerHTML;
    const draws = random.mock.calls.length;
    rerender(<ShootingText text="TIRO" {...props} />);
    expect(random.mock.calls.length).toBe(draws);
    expect(container.innerHTML).toBe(before);
  });

  it('builds new geometry when the text changes', () => {
    const random = vi.spyOn(Math, 'random');
    const { rerender } = render(<ShootingText text="TIRO" {...props} />);
    const draws = random.mock.calls.length;
    rerender(<ShootingText text="GOL" {...props} />);
    expect(random.mock.calls.length).toBeGreaterThan(draws);
  });

  it('shakes the frame as each letter hits, in order', async () => {
    render(<ShootingText text="ABC" {...props} />);
    expect(controls.start).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(210); });
    expect(controls.start).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(60); });
    expect(controls.start).toHaveBeenCalledTimes(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(60); });
    expect(controls.start).toHaveBeenCalledTimes(3);
  });

  it('cancels pending shakes when unmounted', () => {
    const { unmount } = render(<ShootingText text="ABC" {...props} />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
