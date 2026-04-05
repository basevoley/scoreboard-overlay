import React, { useState, useEffect } from 'react';
import styles from './SocialMediaLowerThird.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import type { SocialMediaConfig } from '../../types/config';

interface SocialMediaLowerThirdProps {
  socialMediaConfig: SocialMediaConfig;
}

const SocialMediaLowerThird = ({ socialMediaConfig }: SocialMediaLowerThirdProps) => {
  const { enabled, channels, position } = socialMediaConfig;
  const [currentIndex, setCurrentIndex] = useState(1);
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);

  useEffect(() => {
    if (!channels || channels.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % channels.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [channels]);

  if (!isVisible || !channels || channels.length === 0) return null;

  const positionClass = position ? styles[position] : '';
  const { network, handle, icon } = channels[currentIndex];

  const getCTA = (net: string) => net.toLowerCase() === 'web' ? 'Visítanos' : 'Síguenos';

  return (
    <div className={`${styles['social-wrapper']} ${positionClass} ${styles[animationClass]}`}>
      <div className={styles['social-container']}>
        <div className={styles['icon-section']}>
          {icon && <img src={icon} alt={network} className={styles['network-icon']} />}
        </div>
        <div className={styles['text-content']}>
          <div className={styles['network-name']}>{network}</div>
          <div className={styles['handle']}>{handle}</div>
          <div className={styles['cta']}>{getCTA(network)}</div>
        </div>
        <div className={styles['divider']} />
        <div className={styles['indicator-dots']}>
          {channels.map((_, index) => (
            <div
              key={index}
              className={`${styles['dot']} ${index === currentIndex ? styles['active'] : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaLowerThird;
