import { useEffect, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { TextEffectProps } from './textEffects';

const DEFAULT_COLOR = '#ff0055';
const LETTER_WIDTH_PX = 48;
const SPEED_LINES = 4;

const FONT = {
  fontSize: '85px',
  fontWeight: 900,
  fontFamily: '"Impact", "Arial Black", sans-serif',
} as const;

interface LetterPlan {
  char: string;
  restX: number;
  dynamicY: number;
  introStagger: number;
  exitStagger: number;
}

// Letters slash in from the right, alternating above and below; on exit they sweep out to the left
// (the exit only plays while the parent keeps the effect mounted, e.g. under AnimatePresence)
export default function SonicSlashText({ text, primaryColor }: TextEffectProps) {
  const containerControls = useAnimationControls();

  const elementColor = primaryColor || DEFAULT_COLOR;
  const textGlow = primaryColor
    ? `0 0 10px ${primaryColor}, 0 0 25px ${primaryColor}, 2px 2px 0px #000`
    : '0 0 15px rgba(255,0,85,0.8), 2px 2px 0px #000';

  const letters = useMemo<LetterPlan[]>(() => {
    const chars = Array.from(text);
    const centerOffset = (chars.length * LETTER_WIDTH_PX) / 2;

    return chars.map((char, index) => ({
      char,
      restX: index * LETTER_WIDTH_PX - centerOffset + LETTER_WIDTH_PX / 2,
      dynamicY: index % 2 === 0 ? -120 : 120,
      introStagger: index * 0.05,
      exitStagger: (chars.length - 1 - index) * 0.03, // reverse cascade for a crisp sweep out
    }));
  }, [text]);

  // Small shake as the text lands
  useEffect(() => {
    void containerControls.start({
      skewX: [0, -7, 5, -3, 0],
      x: [0, -12, 10, -5, 0],
      transition: { delay: 0.2, duration: 0.3, ease: 'easeOut' },
    });
  }, [text, containerControls]);

  return (
    <motion.div
      data-testid="sonic-slash"
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
      {/* Horizontal speed lines */}
      <div style={{ position: 'absolute', width: '600px', height: '120px', pointerEvents: 'none' }}>
        {Array.from({ length: SPEED_LINES }, (_, i) => (
          <motion.div
            key={`line-${i}`}
            initial={{ scaleX: 0, opacity: 0, x: -100 }}
            animate={{ scaleX: [0, 1.5, 0], opacity: [0, 0.7, 0], x: [-200, 400] }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'linear' }}
            style={{
              height: '4px',
              width: '100%',
              background: `linear-gradient(90deg, transparent, ${elementColor}, #ffffff, transparent)`,
              margin: '20px 0',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {letters.map((item, index) => {
        // Spaces only occupy their slot in the layout
        if (/\s/.test(item.char)) return null;

        return (
          <div
            key={`${item.char}-${index}`}
            data-testid="sonic-letter"
            style={{
              position: 'absolute',
              transform: `translateX(${item.restX}px)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <motion.span
              initial={{ x: 600, y: item.dynamicY, scale: 1.4, skewX: -50, opacity: 0 }}
              animate={{ x: 0, y: 0, scale: 1, skewX: -10, opacity: 1 }}
              exit={{
                x: -700, // explode outwards to the left
                y: -item.dynamicY * 0.4,
                scaleX: 3,
                skewX: 60,
                opacity: 0,
                transition: { type: 'tween', ease: 'easeIn', duration: 0.22, delay: item.exitStagger },
              }}
              transition={{
                duration: 0.32,
                delay: item.introStagger,
                type: 'spring',
                stiffness: 150,
                damping: 13,
              }}
              style={{
                ...FONT,
                position: 'relative',
                display: 'inline-block',
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: textGlow,
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
