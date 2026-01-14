// src/SocialMediaLowerThird.js
import React, { useState, useEffect } from 'react';
import styles from './SocialMediaLowerThird.module.css';
import useComponentVisibility from './hooks/useComponentVisibility';

const SocialMediaLowerThird = ({ socialMediaConfig }) => {
  const { enabled, channels } = socialMediaConfig;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);

  useEffect(() => {
    if (!channels || channels.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % channels.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [channels]);

  if (!isVisible || !channels || channels.length === 0) return null;

  const currentChannel = channels[currentIndex];
  const { network, handle, icon } = currentChannel;

  // Determine call-to-action based on social network
  const getCTA = (network) => {
    const network_lower = network.toLowerCase();
    if (network_lower === 'twitch') {
      return 'Síguenos y Suscríbete';
    } else if (network_lower === 'youtube') {
      return 'Like y Suscríbete';
    } else {
      return 'Síguenos';
    }
  };

  return (
    <div className={`${styles['social-wrapper']} ${styles[animationClass]}`}>
      <div className={styles['social-container']}>
        <div className={styles['icon-section']}>
          {icon && <img src={icon} alt={network} className={styles['network-icon']} />}
        </div>

        <div className={styles['text-content']}>
          <div className={styles['network-name']}>
            {network}
          </div>
          <div className={styles['handle']}>
            @{handle}
          </div>
          <div className={styles['cta']}>
            {getCTA(network)}
          </div>
        </div>

        <div className={styles['divider']}>
        </div>

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
