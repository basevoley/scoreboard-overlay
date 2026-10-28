import { useEffect, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { TextEffectProps } from './textEffects';

const DEFAULT_COLOR = '#ccff00';
const LETTER_WIDTH_PX = 46;
const BEAM_IMPACT_DELAY_S = 0.12; // letters and camera shake sync with the laser beam hitting

const FONT = {
  fontSize: '95px',
  fontWeight: 900,
  fontFamily: '"Impact", "Arial Black", sans-serif',
} as const;

const jitter = (amplitude: number) => (Math.random() - 0.5) * amplitude;

interface LetterPlan {
  char: string;
  restX: number;
  blastX: number;
  startY: number;
  shakeX: number[];
  shakeY: number[];
  delay: number;
}

// Lightning strike that blows the letters in from the sides, then shakes the whole frame
export default function LaserAceText({ text, primaryColor }: TextEffectProps) {
  const containerControls = useAnimationControls();

  const laserColor = primaryColor || DEFAULT_COLOR;
  const neonGlow = `0 0 8px ${laserColor}, 0 0 20px ${laserColor}, 0 0 40px ${laserColor}, 2px 2px 0px #000`;

  // Randomness lives here so it is drawn once per text, not on every render
  const letters = useMemo<LetterPlan[]>(() => {
    const chars = Array.from(text);
    const centerOffset = (chars.length * LETTER_WIDTH_PX) / 2;

    return chars.map((char, index) => {
      const restX = index * LETTER_WIDTH_PX - centerOffset + LETTER_WIDTH_PX / 2;
      // Blast outwards from the centre, where the beam lands
      const direction = restX >= 0 ? 1 : -1;
      return {
        char,
        restX,
        blastX: restX + direction * (150 + Math.random() * 150),
        startY: jitter(80),
        shakeX: [0, jitter(15), jitter(15), 0],
        shakeY: [0, jitter(15), jitter(15), 0],
        delay: index * 0.02,
      };
    });
  }, [text]);

  // Camera shake plus a brightness flash at the moment of impact
  useEffect(() => {
    void containerControls.start({
      y: [0, -25, 20, -12, 8, -3, 0],
      x: [0, 15, -15, 8, -8, 4, 0],
      filter: ['brightness(1)', 'brightness(4)', 'brightness(2)', 'brightness(1)'],
      transition: { delay: BEAM_IMPACT_DELAY_S, duration: 0.45, ease: 'easeOut' },
    });
  }, [text, containerControls]);

  return (
    <motion.div
      data-testid="laser-ace"
      animate={containerControls}
      style={{
        width: '100%',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        position: 'relative',
        overflow: 'visible',
        userSelect: 'none',
      }}
    >
      {/* Vertical beam strike */}
      <motion.div
        initial={{ scaleY: 0, scaleX: 1, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1, 0], scaleX: [1, 8, 0.1, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.22, times: [0, 0.4, 0.8, 1], ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '6px',
          height: '1000px',
          background: '#ffffff',
          boxShadow: `0 0 20px ${laserColor}, 0 0 50px ${laserColor}, 0 0 100px ${laserColor}`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Horizontal flare at the impact point */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 2.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '200px',
          height: '8px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: `0 0 30px ${laserColor}, 0 0 60px ${laserColor}`,
          zIndex: 9,
        }}
      />

      {letters.map((item, index) => {
        // Spaces only occupy their slot in the layout
        if (/\s/.test(item.char)) return null;

        return (
          <div
            key={`${item.char}-${index}`}
            data-testid="laser-letter"
            style={{
              position: 'absolute',
              transform: `translateX(${item.restX}px)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Blurred electric halo */}
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.4, delay: BEAM_IMPACT_DELAY_S }}
              style={{ ...FONT, position: 'absolute', color: laserColor, filter: 'blur(12px)' }}
            >
              {item.char}
            </motion.span>

            {/* The letter itself, thrown in from the side and trembling into place */}
            <motion.span
              initial={{ x: item.blastX, y: item.startY, scale: 0, opacity: 0 }}
              animate={{ x: item.shakeX, y: item.shakeY, scale: [0, 1.4, 1], opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: BEAM_IMPACT_DELAY_S + item.delay,
                times: [0, 0.3, 0.7, 1],
                type: 'spring',
                stiffness: 200,
                damping: 11,
              }}
              style={{
                ...FONT,
                position: 'relative',
                display: 'inline-block',
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: neonGlow,
                fontStyle: 'italic',
              }}
            >
              {item.char}
            </motion.span>
          </div>
        );
      })}
    </motion.div>
  );
}
