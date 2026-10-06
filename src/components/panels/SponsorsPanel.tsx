import React, { useState, useEffect } from 'react';
import styles from './SponsorsPanel.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import type { SponsorsConfig } from '../../types/config';

interface SponsorsPanelProps {
  sponsorsConfig: SponsorsConfig;
}

interface SponsorsContentProps extends SponsorsPanelProps {
  animationClass: string;
}

// Mounted only while the panel is visible, so the rotation timer never runs while hidden.
const SponsorsContent = ({ sponsorsConfig, animationClass }: SponsorsContentProps) => {
  const { imageUrls, displayTime, enabled } = sponsorsConfig;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!enabled || imageUrls.length < 2) return;
    // Every (re-)enable starts from the first sponsor with a fresh timer,
    // including a re-enable during the fade-out when this component never unmounted.
    setCurrentIndex(0);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
    }, displayTime);
    return () => clearInterval(interval);
  }, [enabled, imageUrls.length, displayTime]);

  return (
    <div className={`${styles.panel} ${styles[animationClass]}`}>
      <h2 className={styles.title}>Nuestros patrocinadores:</h2>
      <div className={styles.imageContainer}>
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Patrocinador ${index + 1}`}
            className={styles.image}
            style={{ opacity: index === currentIndex ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          />
        ))}
      </div>
    </div>
  );
};

const SponsorsPanel = ({ sponsorsConfig }: SponsorsPanelProps) => {
  const { isVisible, animationClass } = useComponentVisibility(sponsorsConfig.enabled, 500);

  if (!isVisible) return null;

  return <SponsorsContent sponsorsConfig={sponsorsConfig} animationClass={animationClass} />;
};

export default SponsorsPanel;
