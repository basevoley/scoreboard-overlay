import { describe, it, expect } from 'vitest';
import { planWaveTiming, DEFAULT_DURATION_MS, LEAVE_DURATION_S } from './waveTiming';

const LEAVE_MS = LEAVE_DURATION_S * 1000;

describe('planWaveTiming', () => {
  it('returns nothing for no letters', () => {
    expect(planWaveTiming(0)).toEqual([]);
  });

  it('starts the letters one after another, from the first', () => {
    const t = planWaveTiming(4, 4000);
    expect(t.map(l => l.entryDelayS)).toEqual([0, expect.closeTo(0.1), expect.closeTo(0.2), expect.closeTo(0.3)]);
  });

  it('makes the letters leave in the same order', () => {
    const leaves = planWaveTiming(5, 4000).map(l => l.leaveAtMs);
    expect([...leaves].sort((a, b) => a - b)).toEqual(leaves);
    expect(new Set(leaves).size).toBe(5);
  });

  it.each([1, 3, 10, 25, 60])('has the last of %i letters fully gone exactly when the celebration ends', count => {
    const t = planWaveTiming(count, 4000);
    expect(t[count - 1].leaveAtMs + LEAVE_MS).toBeCloseTo(4000);
  });

  it('keeps every letter waving for a while before it leaves, for a normal text', () => {
    planWaveTiming(20, 4000).forEach(l => {
      const finishedFirstBounce = l.entryDelayS * 1000 + 600;
      expect(l.leaveAtMs).toBeGreaterThan(finishedFirstBounce);
    });
  });

  it('speeds up the arrival of long texts so they are all in before the end', () => {
    const t = planWaveTiming(40, 4000);
    expect(t[39].entryDelayS).toBeLessThanOrEqual(1.5);
    expect(t[1].entryDelayS).toBeLessThan(0.1);
  });

  it('follows the duration it is given', () => {
    const short = planWaveTiming(3, 3000);
    const long = planWaveTiming(3, 6000);
    expect(long[2].leaveAtMs - short[2].leaveAtMs).toBeCloseTo(3000);
  });

  it('assumes the usual duration when none is given', () => {
    expect(planWaveTiming(3)).toEqual(planWaveTiming(3, DEFAULT_DURATION_MS));
  });

  it('never schedules a departure before the start', () => {
    planWaveTiming(80, 300).forEach(l => expect(l.leaveAtMs).toBeGreaterThanOrEqual(0));
  });
});
