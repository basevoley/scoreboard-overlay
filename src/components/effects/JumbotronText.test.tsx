import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import JumbotronText from './JumbotronText';

// Halo and emissive layer both render the word
const shown = () => screen.getAllByRole('heading').map(h => h.textContent);
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('JumbotronText', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts on the placeholder while the panel opens', () => {
    render(<JumbotronText text="Vamos" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    expect(shown()).toEqual(['*************', '*************']);
    advance(549);
    expect(shown()).toEqual(['*************', '*************']);
  });

  it('rolls through the words, then locks on the upper-cased text', () => {
    render(<JumbotronText text="Vamos 🔥" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    advance(550);
    const seen: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      advance(110);
      seen.push(shown()[1]);
    }
    expect(seen).toEqual(['IMPARABLE', 'POTENTISIMO', 'GANADOR', 'VAMOS 🔥']);
  });

  it('has a panel wide enough for long texts on the 1920px canvas', () => {
    render(<JumbotronText text="x" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    const width = parseInt(screen.getByTestId('jumbotron-panel').style.width, 10);
    expect(width).toBeGreaterThanOrEqual(1500);
    expect(width).toBeLessThan(1920);
  });

  it('uses the team colour for the panel and the glow', () => {
    render(<JumbotronText text="x" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    expect(screen.getAllByRole('heading')[1].style.textShadow).toContain('#ff0000');
  });

  it('falls back to a default LED colour', () => {
    render(<JumbotronText text="x" primaryColor="" secondaryColor="" />);
    expect(screen.getAllByRole('heading')[1].style.textShadow).toContain('#ffcc00');
  });

  it('snaps between sizes once locked, never before', () => {
    render(<JumbotronText text="Go" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    const pump = screen.getByTestId('jumbotron-pump');
    advance(550);
    for (let i = 0; i < 4; i++) advance(110); // the fourth tick locks on the final word
    expect(pump.style.transform).toBe('scale(1)');
    advance(200);
    expect(pump.style.transform).toBe('scale(1)');
    advance(200);
    expect(pump.style.transform).toBe('scale(1.25)');
    advance(200);
    expect(pump.style.transform).toBe('scale(1)');
  });

  it('stops all timers when unmounted', () => {
    const { unmount } = render(<JumbotronText text="Go" primaryColor="#ff0000" secondaryColor="#00ff00" />);
    advance(550);
    for (let i = 0; i < 4; i++) advance(110);
    advance(200);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
