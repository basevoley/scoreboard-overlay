import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { EffectPayload } from '../types/matchData';

const handlers: Record<string, (data: unknown) => void> = {};
const fakeSocket = {
  on: (event: string, fn: (data: unknown) => void) => { handlers[event] = fn; },
  emit: vi.fn(),
  disconnect: vi.fn(),
};
vi.mock('socket.io-client', () => ({ default: () => fakeSocket }));

import { useSocket } from './useSocket';

const payload: EffectPayload = { id: 7, team: 'teamA', text: { content: 'Hola', effect: 'pop' }, crowd: true, durationMs: 4000 };

describe('useSocket triggerEffect', () => {
  beforeEach(() => {
    Object.keys(handlers).forEach(k => delete handlers[k]);
    window.history.pushState({}, '', '/?key=abc');
  });

  it('exposes the latest triggerEffect payload', () => {
    const { result } = renderHook(() => useSocket());
    expect(result.current.effect).toBeNull();
    act(() => handlers['triggerEffect'](payload));
    expect(result.current.effect).toEqual(payload);
  });

  it('does not turn score updates into effects', () => {
    const { result } = renderHook(() => useSocket());
    act(() => handlers['matchData']({ scores: { teamA: 1, teamB: 0 } }));
    expect(result.current.effect).toBeNull();
  });
});
