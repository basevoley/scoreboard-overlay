import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import PointEffect from './PointEffect';
import { getTextEffectComponent, TEXT_EFFECT_COMPONENTS } from './textEffects';
import type { EffectPayload } from '../../types/matchData';
import type { MatchDetails } from '../../types/matchDetails';

// The real effects are heavy SVG/CSS animations; these stand-ins expose what they were given
vi.mock('./CrowdCheer', () => ({
  default: ({ triggerData }: { triggerData: { scarfText: string; primaryColor: string; badgeUrl?: string } | null }) => (
    <div data-testid="crowd" data-active={triggerData ? 'yes' : 'no'} data-scarf={triggerData?.scarfText} data-color={triggerData?.primaryColor} data-badge={triggerData?.badgeUrl} />
  ),
}));
vi.mock('./SupermanText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-superman">{text}</div> }));
vi.mock('./CircularExplosionText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-explosion">{text}</div> }));
vi.mock('./PopText', () => ({ default: ({ text, durationMs }: { text: string; durationMs?: number }) => <div data-testid="text-pop" data-duration={durationMs}>{text}</div> }));
vi.mock('./ShootingText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-shooting">{text}</div> }));
vi.mock('./GlitchText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-glitch">{text}</div> }));
vi.mock('./JumbotronText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-jumbotron">{text}</div> }));
vi.mock('./SlammingText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-slam">{text}</div> }));
vi.mock('./LaserAceText', async () => {
  const { usePresence } = await import('framer-motion');
  return {
    default: ({ text }: { text: string }) => {
      const [isPresent, safeToRemove] = usePresence();
      return <div data-testid="text-laser" data-present={String(isPresent)} onClick={() => safeToRemove?.()}>{text}</div>;
    },
  };
});
vi.mock('./SonicSlashText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-sonic">{text}</div> }));
vi.mock('./WavingText', () => ({ default: ({ text }: { text: string }) => <div data-testid="text-wave">{text}</div> }));

const matchDetails = {
  teams: { teamA: 'Alfa', teamB: 'Beta' },
  teamColors: { teamA: '#ff0000', teamB: '#0000ff' },
  teamLogos: { teamA: 'a.png', teamB: 'b.png' },
} as unknown as MatchDetails;

const payload = (over: Partial<EffectPayload> = {}): EffectPayload => ({
  id: 1,
  team: 'teamA',
  text: { content: 'PUNTAZO!!!', effect: 'glitch' },
  crowd: true,
  durationMs: 4000,
  ...over,
});

describe('PointEffect', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('plays nothing until the control app triggers an effect', () => {
    render(<PointEffect effect={null} matchDetails={matchDetails} />);
    expect(screen.queryByTestId('text-glitch')).toBeNull();
    expect(screen.getByTestId('crowd')).toHaveAttribute('data-active', 'no');
  });

  it('plays the requested text effect with the payload text', () => {
    render(<PointEffect effect={payload({ text: { content: 'Vamos 🔥', effect: 'superman' } })} matchDetails={matchDetails} />);
    expect(screen.getByTestId('text-superman')).toHaveTextContent('Vamos 🔥');
    expect(screen.queryByTestId('text-glitch')).toBeNull();
  });

  it.each(Object.keys(TEXT_EFFECT_COMPONENTS))('maps the "%s" effect id to its component', id => {
    render(<PointEffect effect={payload({ text: { content: 'x', effect: id as never } })} matchDetails={matchDetails} />);
    expect(screen.getByTestId(`text-${id}`)).toBeInTheDocument();
  });

  it('tells the text effect how long the celebration lasts', () => {
    render(<PointEffect effect={payload({ text: { content: 'x', effect: 'pop' }, durationMs: 5200 })} matchDetails={matchDetails} />);
    expect(screen.getByTestId('text-pop')).toHaveAttribute('data-duration', '5200');
  });

  it('falls back to a safe effect for an unknown id', () => {
    expect(getTextEffectComponent('does-not-exist')).toBe(TEXT_EFFECT_COMPONENTS.pop);
  });

  it('shows the scoring team crowd with its colour, badge and scarf', () => {
    render(<PointEffect effect={payload({ team: 'teamB' })} matchDetails={matchDetails} />);
    const crowd = screen.getByTestId('crowd');
    expect(crowd).toHaveAttribute('data-active', 'yes');
    expect(crowd).toHaveAttribute('data-scarf', 'BETA');
    expect(crowd).toHaveAttribute('data-color', '#0000ff');
    expect(crowd).toHaveAttribute('data-badge', 'b.png');
  });

  it('text-only payload: no crowd', () => {
    render(<PointEffect effect={payload({ crowd: false })} matchDetails={matchDetails} />);
    expect(screen.getByTestId('text-glitch')).toBeInTheDocument();
    expect(screen.getByTestId('crowd')).toHaveAttribute('data-active', 'no');
  });

  it('crowd-only payload: no text', () => {
    render(<PointEffect effect={payload({ text: undefined })} matchDetails={matchDetails} />);
    expect(screen.queryByTestId('text-glitch')).toBeNull();
    expect(screen.getByTestId('crowd')).toHaveAttribute('data-active', 'yes');
  });

  it('clears text and crowd together once the duration has elapsed', () => {
    render(<PointEffect effect={payload({ durationMs: 4000 })} matchDetails={matchDetails} />);
    act(() => { vi.advanceTimersByTime(3999); });
    expect(screen.getByTestId('text-glitch')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByTestId('text-glitch')).toBeNull();
    expect(screen.getByTestId('crowd')).toHaveAttribute('data-active', 'no');
  });

  it('keeps a text effect on screen until its exit animation reports it is done', () => {
    render(<PointEffect effect={payload({ text: { content: 'Salida', effect: 'laser' } })} matchDetails={matchDetails} />);
    act(() => { vi.advanceTimersByTime(4000); });
    const leaving = screen.getByTestId('text-laser');
    expect(leaving).toHaveAttribute('data-present', 'false');
    fireEvent.click(leaving);
    expect(screen.queryByTestId('text-laser')).toBeNull();
  });

  it('removes effects without an exit animation immediately', () => {
    render(<PointEffect effect={payload()} matchDetails={matchDetails} />);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.queryByTestId('text-glitch')).toBeNull();
  });

  it('a newer payload replaces the current one and restarts the clock', () => {
    const { rerender } = render(<PointEffect effect={payload({ id: 1 })} matchDetails={matchDetails} />);
    act(() => { vi.advanceTimersByTime(3000); });
    rerender(<PointEffect effect={payload({ id: 2, text: { content: 'Otra', effect: 'pop' } })} matchDetails={matchDetails} />);
    expect(screen.queryByTestId('text-glitch')).toBeNull();
    expect(screen.getByTestId('text-pop')).toHaveTextContent('Otra');
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByTestId('text-pop')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByTestId('text-pop')).toBeNull();
  });

  it('does not celebrate on its own when match details change', () => {
    const { rerender } = render(<PointEffect effect={null} matchDetails={matchDetails} />);
    rerender(<PointEffect effect={null} matchDetails={{ ...matchDetails } as MatchDetails} />);
    expect(screen.queryByTestId('text-glitch')).toBeNull();
    expect(screen.getByTestId('crowd')).toHaveAttribute('data-active', 'no');
  });
});
