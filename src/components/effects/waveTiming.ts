// Timing of the waving text: letters join the wave one after another and leave it in the same
// order, so that the last one has disappeared exactly when the celebration ends.

export const DEFAULT_DURATION_MS = 4000;
export const WAVE_CYCLE_S = 0.6;
export const LEAVE_DURATION_S = 0.25;

const MAX_ENTRY_STAGGER_S = 0.1; // gap between letters starting, short enough to read as one wave
const MAX_ENTRY_SPAN_S = 1.5; // long texts speed up so they are not still arriving when the show is half over
const MAX_LEAVE_STAGGER_S = 0.06;
const MAX_LEAVE_SPAN_S = 1;

export interface LetterTiming {
  /** Seconds before this letter starts growing */
  entryDelayS: number;
  /** Milliseconds after the start at which this letter begins to shrink away */
  leaveAtMs: number;
}

export const planWaveTiming = (letterCount: number, durationMs: number = DEFAULT_DURATION_MS): LetterTiming[] => {
  const entryStagger = Math.min(MAX_ENTRY_STAGGER_S, MAX_ENTRY_SPAN_S / Math.max(letterCount, 1));
  const leaveStagger = Math.min(MAX_LEAVE_STAGGER_S, MAX_LEAVE_SPAN_S / Math.max(letterCount, 1));
  const lastLeaveStartMs = durationMs - LEAVE_DURATION_S * 1000;

  return Array.from({ length: letterCount }, (_, index) => ({
    entryDelayS: index * entryStagger,
    // Counted back from the end, so every letter has fully gone by `durationMs`
    leaveAtMs: Math.max(0, lastLeaveStartMs - (letterCount - 1 - index) * leaveStagger * 1000),
  }));
};
