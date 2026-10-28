import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import LaserAceText from './LaserAceText';

const controls = { start: vi.fn(), set: vi.fn() };

// Framer's animations do not run in jsdom; plain elements are enough to check the layout and wiring
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

const props = { primaryColor: '#112233', secondaryColor: '' };
const letterX = () =>
  screen.getAllByTestId('laser-letter').map(el => parseFloat(el.style.transform.replace('translateX(', '')));

describe('LaserAceText', () => {
  beforeEach(() => {
    controls.start = vi.fn(() => Promise.resolve());
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders every letter as a halo plus the letter itself', () => {
    render(<LaserAceText text="ACE" {...props} />);
    expect(screen.getAllByTestId('laser-letter')).toHaveLength(3);
    expect(screen.getAllByText('A')).toHaveLength(2);
  });

  it('spreads the letters evenly around the centre', () => {
    render(<LaserAceText text="ACE" {...props} />);
    expect(letterX()).toEqual([-46, 0, 46]);
  });

  it('keeps the slot of a space but draws nothing for it', () => {
    render(<LaserAceText text="A B" {...props} />);
    expect(letterX()).toEqual([-46, 46]);
  });

  it('treats any whitespace like a space and keeps emojis whole', () => {
    render(<LaserAceText text={'🎯\tACE\n🎯'} {...props} />);
    expect(screen.getAllByTestId('laser-letter')).toHaveLength(5);
    expect(screen.getAllByText('🎯')).toHaveLength(4);
  });

  it('renders no letters for empty text', () => {
    render(<LaserAceText text="" {...props} />);
    expect(screen.queryAllByTestId('laser-letter')).toHaveLength(0);
  });

  it('uses the team colour for the glow, with a fallback', () => {
    const { unmount } = render(<LaserAceText text="A" {...props} />);
    expect(screen.getAllByText('A')[1].style.textShadow).toContain('#112233');
    unmount();
    render(<LaserAceText text="A" primaryColor="" secondaryColor="" />);
    expect(screen.getAllByText('A')[1].style.textShadow).toContain('#ccff00');
  });

  it('shakes the frame once on mount, and again only when the text changes', () => {
    const { rerender } = render(<LaserAceText text="ACE" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(1);
    rerender(<LaserAceText text="ACE" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(1);
    rerender(<LaserAceText text="PUNTO" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(2);
  });

  it('does not redraw the random blast on re-render', () => {
    const random = vi.mocked(Math.random);
    const { rerender } = render(<LaserAceText text="ACE" {...props} />);
    const draws = random.mock.calls.length;
    rerender(<LaserAceText text="ACE" {...props} />);
    expect(random.mock.calls.length).toBe(draws);
  });
});
