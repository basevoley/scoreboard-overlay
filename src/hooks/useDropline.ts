import { useState, useEffect } from 'react';
import type { MatchEvent } from '../types';

export interface DroplinePanelData {
  icon: string;
  textLine1: string;
  textLine2: string | null;
}

const useDropline = (matchEvent: MatchEvent) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelData, setPanelData] = useState<DroplinePanelData | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!matchEvent || !matchEvent.type) return;

    let icon: string | null = null;
    let textLine1: string | null = null;
    let textLine2: string | null = null;

    switch (matchEvent.type) {
      case 'referee-call':
        icon = '/ref_flag.png';
        textLine1 = matchEvent.details?.text ?? null;
        textLine2 = matchEvent.details?.team ?? null;
        break;
      case 'substitution':
        icon = '/substitution-icon.webp';
        textLine1 = matchEvent.details?.text ?? null;
        textLine2 = matchEvent.details?.team ?? null;
        break;
      case 'timeout':
        icon = '/clock-timeout.png';
        textLine1 = matchEvent.details?.text ?? null;
        textLine2 = matchEvent.details?.team ?? null;
        break;
      default:
        break;
    }

    if (icon && textLine1) {
      setPanelData({ icon, textLine1, textLine2 });
      setIsPanelVisible(true);
      setTimeout(() => setShouldAnimate(true), 50);
    }
  }, [matchEvent]);

  useEffect(() => {
    if (isPanelVisible) {
      const animateOutTimer = setTimeout(() => setShouldAnimate(false), 5000);
      const hidePanelTimer = setTimeout(() => {
        setPanelData(null);
        setIsPanelVisible(false);
      }, 5200);

      return () => {
        clearTimeout(animateOutTimer);
        clearTimeout(hidePanelTimer);
      };
    }
  }, [isPanelVisible]);

  return { panelData, shouldAnimate };
};

export default useDropline;
