import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CrowdCheer from './CrowdCheer';
import { getTextEffectComponent } from './textEffects';
import { deriveSecondaryColor } from './colorUtils';
import type { EffectPayload } from '../../types/matchData';
import type { MatchDetails } from '../../types/matchDetails';

// Plays the celebration the control app asks for (`triggerEffect`): an optional text effect and an
// optional cheering crowd for the scoring team, both for the payload's duration. The overlay never
// decides to celebrate by itself, so score corrections cannot trigger it.

interface PointEffectProps {
  effect: EffectPayload | null;
  matchDetails: MatchDetails;
}

const noop = () => {};

const PointEffect = ({ effect, matchDetails }: PointEffectProps) => {
  const [active, setActive] = useState<EffectPayload | null>(null);

  // A new payload replaces whatever is playing and restarts the clock
  useEffect(() => {
    if (!effect) return;
    setActive(effect);
    const timer = setTimeout(() => setActive(current => (current === effect ? null : current)), effect.durationMs);
    return () => clearTimeout(timer);
  }, [effect]);

  const color = active ? matchDetails.teamColors[active.team] : '';
  const secondary = active ? deriveSecondaryColor(color) : '';
  const TextEffect = active?.text ? getTextEffectComponent(active.text.effect) : null;

  return (
    <>
      {/* Always mounted so the crowd can play its exit animation; paints behind the scoreboard. */}
      <CrowdCheer
        triggerData={
          active?.crowd
            ? {
                id: active.id,
                primaryColor: color,
                secondaryColor: secondary,
                badgeUrl: matchDetails.teamLogos[active.team],
                scarfText: matchDetails.teams[active.team].toUpperCase(),
              }
            : null
        }
        onComplete={noop}
        durationMs={active?.durationMs ?? 0}
      />
      {/* Keeps a text effect mounted until its own exit animation (if it has one) has played */}
      <AnimatePresence>
        {active && TextEffect && active.text && (
          <div
            key={active.id}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 200,
              fontFamily: 'var(--ov-font)',
            }}
          >
            <TextEffect
              text={active.text.content}
              primaryColor={color}
              secondaryColor={secondary}
              durationMs={active.durationMs}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PointEffect;
