import { useCallback, useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { TextEffectProps } from './textEffects';

const DEFAULT_COLOR = '#ff3c00';
const PAUSE_BEFORE_NEXT_WORD_MS = 10;

interface SlamWordProps {
  word: string;
  isTarget: boolean;
  onSlamComplete: () => void;
  blockShadow: string;
}

// One word with its own animation controls, so each slam is independent of the others
function SlamWord({ word, isTarget, onSlamComplete, blockShadow }: SlamWordProps) {
  const controls = useAnimationControls();
  const letters = Array.from(word);

  useEffect(() => {
    // Only the word whose turn it is gets slammed
    if (!isTarget) return;

    let cancelled = false;
    let nextWordTimer: ReturnType<typeof setTimeout> | undefined;

    const slam = async () => {
      // Start huge, hidden and tilted, ready to crash forward
      controls.set({ scale: 4, y: -150, opacity: 0, rotateX: -45 });

      // "BAM!": instant crash onto the screen
      await controls.start({
        scale: 1,
        y: 0,
        opacity: 1,
        rotateX: 0,
        transition: { duration: 0.09, ease: 'easeOut' },
      });
      if (cancelled) return;

      // Drive down through the floor and bounce back
      await controls.start({
        y: [0, 120, -35, 10, 0],
        scaleY: [1, 0.7, 1.2, 0.95, 1],
        transition: { duration: 0.38, times: [0, 0.25, 0.55, 0.8, 1], ease: 'easeInOut' },
      });
      if (cancelled) return;

      nextWordTimer = setTimeout(onSlamComplete, PAUSE_BEFORE_NEXT_WORD_MS);
    };

    void slam();

    return () => {
      cancelled = true;
      clearTimeout(nextWordTimer);
    };
  }, [isTarget, controls, onSlamComplete]);

  return (
    <motion.div
      animate={controls}
      initial={false} // keeps Framer from overriding the manual starting pose
      style={{
        display: 'flex',
        position: 'relative',
        // The target stays hidden until its slam begins
        opacity: isTarget ? 0 : 1,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* White flash at the moment of impact */}
      {isTarget && (
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 2.5], opacity: [0, 1, 0] }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle, #ffffff 20%, transparent 70%)',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      <div style={{ display: 'flex', transform: 'skewX(-12deg)' }}>
        {letters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            style={{
              display: 'inline-block',
              fontSize: '100px',
              fontWeight: 950,
              fontFamily: '"Impact", "Arial Black", sans-serif',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow: blockShadow,
              letterSpacing: '-2px',
              padding: '0 4px',
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// Words crash onto the screen one after another, each with an impact bounce
export default function SlammingText({ text, primaryColor }: TextEffectProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  // Stable, so a parent re-render never restarts the slam in progress
  const nextWord = useCallback(() => setActiveIndex(index => index + 1), []);

  const brandColor = primaryColor || DEFAULT_COLOR;
  const blockShadow = `
    0 4px 0 ${brandColor},
    0 8px 0 ${brandColor},
    0 16px 30px ${brandColor},
    0 0 20px ${brandColor}
  `;

  return (
    <div
      data-testid="slamming-text"
      style={{
        width: '100%',
        height: '500px',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
        justifyContent: 'center',
        columnGap: '36px',
        rowGap: '8px',
        background: 'transparent',
        position: 'relative',
        overflow: 'visible',
        userSelect: 'none',
        perspective: '1200px',
      }}
    >
      {words.map((word, index) => {
        // Words later in the queue are not rendered yet, so they cannot shift the layout early
        if (index > activeIndex) return null;
        return (
          <SlamWord
            key={`${word}-${index}`}
            word={word}
            isTarget={index === activeIndex}
            blockShadow={blockShadow}
            onSlamComplete={nextWord}
          />
        );
      })}
    </div>
  );
}
