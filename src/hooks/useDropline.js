import { useState, useEffect } from 'react';

const useDropline = (matchEvent) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelData, setPanelData] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!matchEvent || !matchEvent.type) {
      return;
    }

    let icon, textLine1, textLine2;

    switch (matchEvent.type) {
      case 'referee-call':
        icon = '/ref_flag.png';
        textLine1 = matchEvent.details.text;
        // textLine2 = `Call at ${new Date(matchEvent.timestamp).toLocaleTimeString()}`;
        textLine2 = matchEvent.details.team;
        break;
      case 'substitution':
        icon = '/substitution-icon.webp';
        textLine1 = `Substitution: ${matchEvent.details.player}`;
        textLine2 = `for ${matchEvent.details.team}`;
        break;
      case 'timeout':
        icon = '/clock-timeout.png';
        textLine1 = matchEvent.details.text;
        textLine2 = matchEvent.details.team;
        break;
      default:
        icon = null;
        textLine1 = null;
        textLine2 = null;
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
      const animateOutTimer = setTimeout(() => setShouldAnimate(false), 7000);
      const hidePanelTimer = setTimeout(() => {
        setPanelData(null);
        setIsPanelVisible(false);
      }, 7200);

      // Cleanup timers on component unmount or state change
      return () => {
        clearTimeout(animateOutTimer);
        clearTimeout(hidePanelTimer);
      };
    }
  }, [isPanelVisible]);

  return { panelData, shouldAnimate };
};

export default useDropline;
