import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createElement } from 'react';
import SlammingText from './SlammingText';

const controlCalls = { set: vi.fn(), start: vi.fn() };

// Framer's animations do not run in jsdom: the controls resolve at once, which leaves
// SlamWord's own sequencing (one word at a time, then the next) as the thing under test.
vi.mock('framer-motion', () => {
  const STRIPPED = new Set(['animate', 'initial', 'exit', 'transition']);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
      const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !STRIPPED.has(key)));
      return createElement(tag, domProps, children as never);
    },
  });
  return {
    motion,
    useAnimationControls: () => controlCalls,
  };
});

const letters = (word: HTMLElement) => word.textContent;
const words = () => Array.from(screen.getByTestId('slamming-text').children).map(w => letters(w as HTMLElement));
const flush = () => act(async () => { await vi.advanceTimersByTimeAsync(10); });

describe('SlammingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    controlCalls.set = vi.fn();
    controlCalls.start = vi.fn(() => Promise.resolve());
  });
  afterEach(() => vi.useRealTimers());

  it('shows only the first word at the start', async () => {
    render(<SlammingText text="monster block now" primaryColor="#ff0000" secondaryColor="" />);
    expect(words()).toEqual(['monster']);
  });

  it('slams the words in order, keeping the earlier ones on screen', async () => {
    render(<SlammingText text="monster block now" primaryColor="#ff0000" secondaryColor="" />);
    await flush();
    expect(words()).toEqual(['monster', 'block']);
    await flush();
    expect(words()).toEqual(['monster', 'block', 'now']);
  });

  it('stops after the last word', async () => {
    render(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    await flush();
    await flush();
    await flush();
    expect(words()).toEqual(['uno', 'dos']);
  });

  it('runs two animation phases per word', async () => {
    render(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    await flush();
    expect(controlCalls.set).toHaveBeenCalledTimes(2);
    expect(controlCalls.start).toHaveBeenCalledTimes(4);
  });

  it('keeps emojis and splits on any whitespace', async () => {
    render(<SlammingText text={'  🧱  BLOQUEO\n🧱 '} primaryColor="#ff0000" secondaryColor="" />);
    await flush();
    await flush();
    expect(words()).toEqual(['🧱', 'BLOQUEO', '🧱']);
  });

  it('renders nothing for empty text', () => {
    render(<SlammingText text="   " primaryColor="#ff0000" secondaryColor="" />);
    expect(words()).toEqual([]);
  });

  it('does not restart the slam in progress when the parent re-renders', async () => {
    const { rerender } = render(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    expect(controlCalls.set).toHaveBeenCalledTimes(1);
    rerender(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    rerender(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    expect(controlCalls.set).toHaveBeenCalledTimes(1);
  });

  it('uses the team colour for the letter shadow, with a fallback', () => {
    const { unmount } = render(<SlammingText text="uno" primaryColor="#112233" secondaryColor="" />);
    expect(screen.getByText('u').style.textShadow).toContain('#112233');
    unmount();
    render(<SlammingText text="uno" primaryColor="" secondaryColor="" />);
    expect(screen.getByText('u').style.textShadow).toContain('#ff3c00');
  });

  it('does not advance after being unmounted', async () => {
    const { unmount } = render(<SlammingText text="uno dos" primaryColor="#ff0000" secondaryColor="" />);
    unmount();
    await flush();
    expect(vi.getTimerCount()).toBe(0);
  });
});
