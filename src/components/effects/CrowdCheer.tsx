import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicCrowd from './DynamicCrowd';

export interface CrowdCheerData {
  id: number;
  primaryColor: string;
  secondaryColor: string;
  badgeUrl?: string;
  scarfText: string;
}

interface CrowdCheerProps {
  triggerData: CrowdCheerData | null;
  onComplete: () => void;
  durationMs: number;
}

export default function CrowdCheer({ triggerData, onComplete, durationMs }: CrowdCheerProps) {
  const invocationKey = triggerData?.id;

  useEffect(() => {
    if (!triggerData) return;
    const timer = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timer);
  }, [invocationKey, onComplete, durationMs]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        width: '95%',
        maxHeight: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        // Negative so the crowd paints behind the scoreboard (z-index: auto) but above the transparent canvas.
        zIndex: -1,
        transform: 'translate(-50%, 5%)',
      }}
    >
      <AnimatePresence>
        {triggerData && (
          <motion.div
            key={`crowd-layer-${invocationKey}`}
            initial={{ y: '55vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '55vh', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              position: 'relative',
            }}
          >
            <DynamicCrowd
              primaryColor={triggerData.primaryColor}
              secondaryColor={triggerData.secondaryColor}
              badgeUrl={triggerData.badgeUrl}
              scarfText={triggerData.scarfText}
              supporterCount={10}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
