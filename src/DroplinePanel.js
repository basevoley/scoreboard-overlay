// src/DroplinePanel.js
import React from 'react';
import styles from './DroplinePanel.module.css';

const DroplinePanel = ({ icon, textLine1, textLine2, isTopPosition, isAnimatedIn }) => {
  if (!textLine1 && !textLine2) {
    return null;
  }
  
  const panelPositionClass = isTopPosition ? styles['on-top'] : styles['on-bottom'];
  const arrowDirectionClass = isTopPosition ? styles['arrow-up'] : styles['arrow-down'];

  return (
    <div className={`${styles['dropline-panel']} ${panelPositionClass} ${isAnimatedIn ? styles['is-animated-in'] : ''}`}>
      {icon && <img src={icon} alt="Info Icon" className={styles['dropline-icon']} />}
      <div className={styles['text-container']}>
        {textLine1 && <span className={styles['text-line-1']}>{textLine1}</span>}
        {textLine2 && <span className={styles['text-line-2']}>{textLine2}</span>}
      </div>
      <div className={`${styles['arrow-indicator']} ${arrowDirectionClass}`}></div>
    </div>
  );
};
export default DroplinePanel;
