import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import type { TextEffectProps } from './textEffects';
import { LEAVE_DURATION_S, WAVE_CYCLE_S, planWaveTiming, type LetterTiming } from './waveTiming';

const DEFAULT_PRIMARY = '#ffcc00';
const DEFAULT_SECONDARY = '#ffffff';
const FONT_SIZE = '85px';

const WAVE_Y = [0, -30, 30, 0]; // up, then down, then back to rest
const WAVE_SCALE = [1, 1.5, 0.3, 1]; // biggest at the top of the bounce, smallest at the bottom
const FIRST_CYCLE_SCALE = [0, ...WAVE_SCALE.slice(1)]; // the same wave, but starting from nothing

interface WaveLetterProps extends LetterTiming {
  char: string;
  textShadow: string;
}

// One letter. It joins the wave by growing from nothing as part of its first bounce, keeps bouncing,
// and when its turn comes shrinks all the way down while the others carry on.
function WaveLetter({ char, textShadow, entryDelayS, leaveAtMs }: WaveLetterProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    let leaving = false;

    const leaveTimer = setTimeout(() => {
      leaving = true;
      void controls.start({ scale: 0, y: 0, transition: { duration: LEAVE_DURATION_S, ease: 'easeIn' } });
    }, leaveAtMs);

    const wave = async () => {
      await controls.start({
        y: WAVE_Y,
        scale: FIRST_CYCLE_SCALE,
        transition: { duration: WAVE_CYCLE_S, delay: entryDelayS, ease: 'linear' },
      });
      if (leaving) return;

      // Each letter's loop starts where its first bounce ended, so the entry stagger is the wave's phase
      void controls.start({
        y: WAVE_Y,
        scale: WAVE_SCALE,
        transition: { duration: WAVE_CYCLE_S, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
      });
    };
    void wave();

    return () => {
      clearTimeout(leaveTimer);
      controls.stop();
    };
  }, [controls, entryDelayS, leaveAtMs]);

  return (
    <motion.span
      data-testid="wave-letter"
      initial={{ scale: 0, y: 0 }}
      animate={controls}
      style={{
        display: 'inline-block',
        fontSize: FONT_SIZE,
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '2px',
        textShadow,
      }}
    >
      {char}
    </motion.span>
  );
}

// Letters join a bouncing wave one after another and leave it in the same order, timed so the last
// one is gone when the celebration (`durationMs`) ends.
export default function WavingText({ text, primaryColor, secondaryColor, durationMs }: TextEffectProps) {
  const primary = primaryColor || DEFAULT_PRIMARY;
  const secondary = secondaryColor || DEFAULT_SECONDARY;
  const textShadow = `0 0 25px ${primary}, 0 0 12px ${secondary}, 0 4px 12px rgba(0,0,0,0.9)`;

  const chars = Array.from(text);
  const timings = planWaveTiming(chars.length, durationMs);

  return (
    <div
      data-testid="waving-text"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {chars.map((char, index) =>
        // Any whitespace becomes a plain space that only keeps the gap between words
        /\s/.test(char) ? (
          <span key={index} data-testid="wave-space" style={{ display: 'inline-block', fontSize: FONT_SIZE, whiteSpace: 'pre' }}>
            {' '}
          </span>
        ) : (
          <WaveLetter key={index} char={char} textShadow={textShadow} {...timings[index]} />
        ),
      )}
    </div>
  );
}
