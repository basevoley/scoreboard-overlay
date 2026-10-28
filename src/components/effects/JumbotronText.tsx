import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TextEffectProps } from './textEffects';

// Words that "roll" on the board before the final text locks in
const ROLLING_WORDS = ['INCREIBLE', 'IMPARABLE', 'POTENTISIMO', 'GANADOR'];
const PLACEHOLDER = '*************';
// ~30 characters at 80px monospace on the 1920px canvas; longer text is clipped by the panel
const PANEL_WIDTH_PX = 1700;
const PANEL_INTRO_MS = 550; // matches the panel's open animation
const ROLL_STEP_MS = 110;
const PUMP_STEP_MS = 200;
const PUMP_SCALE = 1.25;

// LED jumbotron panel: opens like a screen, rolls through some words, locks on the text and pumps
export default function JumbotronText({ text, primaryColor }: TextEffectProps) {
  const finalWord = text.toUpperCase();
  const words = useMemo(() => [...ROLLING_WORDS, finalWord], [finalWord]);

  const [displayedText, setDisplayedText] = useState(PLACEHOLDER);
  const [isLocked, setIsLocked] = useState(false);
  const [startCycling, setStartCycling] = useState(false);

  // Plain numeric toggle: the pump must snap between sizes, not be interpolated by Framer
  const [hardwareScale, setHardwareScale] = useState(1);

  const ledColor = primaryColor || '#ffcc00';

  const activeGlow = `
    0 0 4px ${ledColor},
    0 0 12px ${ledColor},
    0 0 25px ${ledColor},
    0 0 45px ${ledColor},
    3px 3px 0px #000000
  `;

  // Start the roll once the panel has finished opening
  useEffect(() => {
    const timeout = setTimeout(() => setStartCycling(true), PANEL_INTRO_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!startCycling) return;

    let step = 1;
    const interval = setInterval(() => {
      if (step < words.length - 1) {
        setDisplayedText(words[step]);
        step++;
      } else {
        setDisplayedText(finalWord);
        setIsLocked(true);
        clearInterval(interval);
      }
    }, ROLL_STEP_MS);

    return () => clearInterval(interval);
  }, [startCycling, words, finalWord]);

  // Once locked, alternate between normal and enlarged on every tick
  useEffect(() => {
    if (!isLocked) return;

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      setHardwareScale(ticks % 2 === 0 ? PUMP_SCALE : 1);
    }, PUMP_STEP_MS);

    return () => clearInterval(interval);
  }, [isLocked]);

  const textStyle = {
    fontSize: '80px',
    fontWeight: 950,
    fontFamily: '"Courier New", Courier, monospace',
    letterSpacing: '4px',
    margin: 0,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div
      data-testid="jumbotron"
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
      <motion.div
        data-testid="jumbotron-panel"
        initial={{ scaleX: 0, scaleY: 0.05, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], scaleY: [0.05, 0.05, 1], opacity: [0, 1, 1] }}
        transition={{ duration: PANEL_INTRO_MS / 1000, times: [0, 0.45, 1], ease: 'easeOut' }}
        style={{
          background: '#040406',
          border: `4px solid ${ledColor}`,
          borderRadius: '4px',
          boxShadow: `0 0 35px rgba(0,0,0,0.95), inset 0 0 30px ${ledColor}`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          width: `${PANEL_WIDTH_PX}px`,
          height: '160px',
          transformOrigin: 'center center',
        }}
      >
        {/* LED pixel mesh */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 10,
            mixBlendMode: 'multiply',
            opacity: 0.2,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,1) 50%, transparent 50%),
              linear-gradient(90deg, rgba(0,0,0,1) 50%, transparent 50%)
            `,
            backgroundSize: '4px 4px',
          }}
        />

        {/* Screen glare */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
            pointerEvents: 'none',
            zIndex: 11,
          }}
        />

        <div
          data-testid="jumbotron-pump"
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${hardwareScale})`,
          }}
        >
          {/* Blurred halo */}
          <h1
            style={{
              ...textStyle,
              position: 'absolute',
              color: ledColor,
              filter: 'blur(16px)',
              zIndex: 1,
              opacity: !startCycling ? 0 : isLocked ? 0.75 : 0.35,
            }}
          >
            {displayedText}
          </h1>

          {/* Emissive text */}
          <h1
            style={{
              ...textStyle,
              position: 'relative',
              color: isLocked ? '#ffffff' : ledColor,
              textShadow: activeGlow,
              zIndex: 2,
              opacity: !startCycling ? 0 : 1,
            }}
          >
            {displayedText}
          </h1>
        </div>
      </motion.div>
    </div>
  );
}
