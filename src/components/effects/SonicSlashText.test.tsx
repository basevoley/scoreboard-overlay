import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import SonicSlashText from './SonicSlashText';

const controls = { start: vi.fn() };

// Framer's animations do not run in jsdom. The mock keeps what the component asked for
// (exit / transition) readable from the DOM so the animation set-up can be asserted.
vi.mock('framer-motion', () => {
  const STRIPPED = new Set(['animate', 'initial', 'exit', 'transition']);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
      const domProps: Record<string, unknown> = Object.fromEntries(Object.entries(props).filter(([key]) => !STRIPPED.has(key)));
      if (props.exit) domProps['data-exit'] = JSON.stringify(props.exit);
      if (props.transition) domProps['data-transition'] = JSON.stringify(props.transition);
      return createElement(tag, domProps, children as never);
    },
  });
  return { motion, useAnimationControls: () => controls };
});

const props = { primaryColor: '#112233', secondaryColor: '' };
const letters = () => screen.getAllByTestId('sonic-letter');
const spanOf = (letter: HTMLElement) => letter.querySelector('span')!;
const exitOf = (letter: HTMLElement) => JSON.parse(spanOf(letter).dataset.exit!);
const introOf = (letter: HTMLElement) => JSON.parse(spanOf(letter).dataset.transition!);

describe('SonicSlashText', () => {
  beforeEach(() => {
    controls.start = vi.fn(() => Promise.resolve());
  });

  it('renders one letter per character, centred around the middle', () => {
    render(<SonicSlashText text="ACE" {...props} />);
    const xs = letters().map(el => parseFloat(el.style.transform.replace('translateX(', '')));
    expect(xs).toEqual([-48, 0, 48]);
  });

  it('keeps the slot of a space but draws nothing for it', () => {
    render(<SonicSlashText text="A B" {...props} />);
    expect(letters()).toHaveLength(2);
  });

  it('treats any whitespace like a space and keeps emojis whole', () => {
    render(<SonicSlashText text={'⚡\tGO\n⚡'} {...props} />);
    expect(letters()).toHaveLength(4);
    expect(screen.getAllByText('⚡')).toHaveLength(2);
  });

  it('renders no letters for empty text', () => {
    render(<SonicSlashText text="" {...props} />);
    expect(screen.queryAllByTestId('sonic-letter')).toHaveLength(0);
  });

  it('alternates letters above and below on the way in', () => {
    render(<SonicSlashText text="ABCD" {...props} />);
    const ys = letters().map(l => exitOf(l).y);
    // exit y is the opposite 40% of the entry offset: -120 entry → +48, +120 entry → -48
    expect(ys).toEqual([48, -48, 48, -48]);
  });

  it('staggers the entrance left to right', () => {
    render(<SonicSlashText text="ABC" {...props} />);
    expect(letters().map(l => introOf(l).delay)).toEqual([0, 0.05, 0.1]);
  });

  it('sweeps out in reverse order, with the exit timing inside the exit target', () => {
    render(<SonicSlashText text="ABC" {...props} />);
    const delays = letters().map(l => exitOf(l).transition.delay);
    expect(delays[0]).toBeCloseTo(0.06);
    expect(delays[1]).toBeCloseTo(0.03);
    expect(delays[2]).toBeCloseTo(0);
    expect(exitOf(letters()[0]).transition).toMatchObject({ type: 'tween', ease: 'easeIn', duration: 0.22 });
    // the old nested `transition.exit` is not a Framer option and must not come back
    expect(introOf(letters()[0])).not.toHaveProperty('exit');
  });

  it('draws four speed lines in the team colour', () => {
    const { container } = render(<SonicSlashText text="A" {...props} />);
    const lines = Array.from(container.querySelectorAll<HTMLElement>('div')).filter(d => d.style.background.includes('linear-gradient'));
    expect(lines).toHaveLength(4);
    expect(lines[0].style.background).toContain('rgb(17, 34, 51)');
  });

  it('uses the team colour for the glow, with the default red as fallback', () => {
    const { unmount } = render(<SonicSlashText text="A" {...props} />);
    expect(screen.getByText('A').style.textShadow).toContain('#112233');
    unmount();
    render(<SonicSlashText text="A" primaryColor="" secondaryColor="" />);
    expect(screen.getByText('A').style.textShadow).toContain('rgba(255,0,85');
  });

  it('shakes the frame once on mount, and again only when the text changes', () => {
    const { rerender } = render(<SonicSlashText text="ACE" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(1);
    rerender(<SonicSlashText text="ACE" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(1);
    rerender(<SonicSlashText text="PUNTO" {...props} />);
    expect(controls.start).toHaveBeenCalledTimes(2);
  });
});
