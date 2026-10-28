import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createElement } from 'react';
import WavingText from './WavingText';
import { planWaveTiming } from './waveTiming';

const controls = { start: vi.fn(), stop: vi.fn() };

// Framer's animations do not run in jsdom: the mock keeps the initial pose readable from the DOM,
// and `controls` records what the letters ask to animate (in order, with timing).
vi.mock('framer-motion', () => {
  const STRIPPED = new Set(['animate', 'initial', 'exit', 'transition']);
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: Record<string, unknown>) => {
      const domProps: Record<string, unknown> = Object.fromEntries(Object.entries(props).filter(([key]) => !STRIPPED.has(key)));
      domProps['data-initial'] = JSON.stringify(props.initial);
      domProps['data-has-exit'] = String('exit' in props);
      return createElement(tag, domProps, children as never);
    },
  });
  return { motion, useAnimationControls: () => controls };
});

const props = { primaryColor: '#112233', secondaryColor: '#445566' };
const letters = () => screen.getAllByTestId('wave-letter');
const reprs = (value: unknown) => JSON.parse(JSON.stringify(value, (_k, v) => (v === Infinity ? 'Infinity' : v)));
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

// Every animation a letter asked for, classified
const calls = () => controls.start.mock.calls.map(([arg]) => reprs(arg));
const firstBounces = () => calls().filter(c => Array.isArray(c.scale) && c.scale[0] === 0);
const loops = () => calls().filter(c => c.transition?.repeat === 'Infinity');
const shrinks = () => calls().filter(c => c.scale === 0);

describe('WavingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    controls.start = vi.fn(() => Promise.resolve());
    controls.stop = vi.fn();
  });
  afterEach(() => vi.useRealTimers());

  describe('layout', () => {
    it('renders one element per character', () => {
      render(<WavingText text="OLA" {...props} />);
      expect(letters().map(l => l.textContent)).toEqual(['O', 'L', 'A']);
    });

    it('draws the letters at 85px', () => {
      render(<WavingText text="OLA" {...props} />);
      letters().forEach(l => expect(l.style.fontSize).toBe('85px'));
    });

    it('keeps emojis whole', () => {
      render(<WavingText text="👏A" {...props} />);
      expect(letters().map(l => l.textContent)).toEqual(['👏', 'A']);
    });

    it('keeps the gap between words, whatever kind of whitespace it was, without animating it', () => {
      render(<WavingText text={'A B\tC'} {...props} />);
      expect(letters().map(l => l.textContent)).toEqual(['A', 'B', 'C']);
      const spaces = screen.getAllByTestId('wave-space');
      expect(spaces).toHaveLength(2);
      expect(spaces[0].style.whiteSpace).toBe('pre');
    });

    it('renders nothing for empty text', () => {
      render(<WavingText text="" {...props} />);
      expect(screen.queryAllByTestId('wave-letter')).toHaveLength(0);
    });

    it('glows with the team colours, with a fallback', () => {
      const { unmount } = render(<WavingText text="O" {...props} />);
      expect(letters()[0].style.textShadow).toContain('#112233');
      expect(letters()[0].style.textShadow).toContain('#445566');
      unmount();
      render(<WavingText text="O" primaryColor="" secondaryColor="" />);
      expect(letters()[0].style.textShadow).toContain('#ffcc00');
      expect(letters()[0].style.textShadow).toContain('#ffffff');
    });
  });

  describe('growing in', () => {
    it('starts every letter at zero size, so nothing shows before its turn', () => {
      render(<WavingText text="OLA" {...props} />);
      letters().forEach(l => expect(JSON.parse(l.dataset.initial!)).toMatchObject({ scale: 0 }));
    });

    it('makes growing part of the wave: the first bounce starts from nothing and has the wave shape', () => {
      render(<WavingText text="OLA" {...props} />);
      expect(firstBounces()).toHaveLength(3);
      firstBounces().forEach(b => {
        expect(b.scale).toEqual([0, 1.5, 0.3, 1]);
        expect(b.y).toEqual([0, -30, 30, 0]);
        expect(b.transition.duration).toBe(0.6);
      });
    });

    it('starts the letters one after another', () => {
      render(<WavingText text="OLA" {...props} />);
      expect(firstBounces().map(b => b.transition.delay)).toEqual([0, expect.closeTo(0.1), expect.closeTo(0.2)]);
    });

    it('never grows a letter on its own before the wave: no separate entrance animation', () => {
      render(<WavingText text="OLA" {...props} />);
      expect(calls().filter(c => c.scale === 1)).toHaveLength(0);
    });
  });

  describe('waving', () => {
    it('keeps bouncing, with no pause, as soon as the first bounce ends', async () => {
      render(<WavingText text="OLA" {...props} />);
      expect(loops()).toHaveLength(0);
      await flush();
      expect(loops()).toHaveLength(3);
      loops().forEach(l => {
        expect(l.scale).toEqual([1, 1.5, 0.3, 1]);
        expect(l.y).toEqual([0, -30, 30, 0]);
        expect(l.transition).toMatchObject({ duration: 0.6, repeat: 'Infinity', ease: 'linear' });
      });
    });

    it('does not start looping before the first bounce has finished', async () => {
      controls.start = vi.fn(() => new Promise(() => {}));
      render(<WavingText text="OLA" {...props} />);
      await flush();
      expect(loops()).toHaveLength(0);
    });
  });

  describe('leaving', () => {
    it('lets the letters carry on waving until each one’s own turn to go', async () => {
      render(<WavingText text="OLA" {...props} durationMs={4000} />);
      await flush();
      const leaveAt = planWaveTiming(3, 4000).map(t => t.leaveAtMs);

      await advance(leaveAt[0] - 1);
      expect(shrinks()).toHaveLength(0);
      await advance(1);
      expect(shrinks()).toHaveLength(1);
      await advance(leaveAt[1] - leaveAt[0]);
      expect(shrinks()).toHaveLength(2);
      await advance(leaveAt[2] - leaveAt[1]);
      expect(shrinks()).toHaveLength(3);
    });

    it('shrinks a leaving letter all the way to nothing', async () => {
      render(<WavingText text="O" {...props} durationMs={4000} />);
      await flush();
      await advance(4000);
      expect(shrinks()).toHaveLength(1);
      expect(shrinks()[0]).toMatchObject({ scale: 0, y: 0, transition: { duration: 0.25 } });
    });

    it('has the last letter completely gone when the celebration ends', async () => {
      render(<WavingText text="OLA" {...props} durationMs={4000} />);
      const last = planWaveTiming(3, 4000)[2];
      expect(last.leaveAtMs + 250).toBeCloseTo(4000);
    });

    it('follows the duration it is given', async () => {
      render(<WavingText text="O" {...props} durationMs={6000} />);
      await flush();
      await advance(5000);
      expect(shrinks()).toHaveLength(0);
      await advance(1000);
      expect(shrinks()).toHaveLength(1);
    });

    it('does not use the exit animation, which would freeze the wave', () => {
      render(<WavingText text="OLA" {...props} />);
      letters().forEach(l => expect(l.dataset.hasExit).toBe('false'));
    });

    it('does not resume waving if the first bounce finishes after the letter started leaving', async () => {
      let finishFirstBounce: () => void = () => {};
      controls.start = vi.fn(arg => {
        if (Array.isArray((arg as { scale?: unknown }).scale) && (arg as { scale: number[] }).scale[0] === 0) {
          return new Promise<void>(resolve => { finishFirstBounce = resolve; });
        }
        return Promise.resolve();
      });
      render(<WavingText text="O" {...props} durationMs={1000} />);
      await advance(1000);
      expect(shrinks()).toHaveLength(1);
      finishFirstBounce();
      await flush();
      expect(loops()).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('stops every letter and cancels the pending departures on unmount', () => {
      const { unmount } = render(<WavingText text="OLA" {...props} />);
      unmount();
      expect(controls.stop).toHaveBeenCalledTimes(3);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
