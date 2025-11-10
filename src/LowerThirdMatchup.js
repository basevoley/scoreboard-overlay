// src/LowerThirdMatchup.js
import React, { useState, useEffect } from 'react';
import styles from './LowerThirdMatchup.module.css';
import useComponentVisibility from './hooks/useComponentVisibility';

const LowerThirdMatchup = ({ matchDetails, enabled }) => {
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);
  
  const { matchHeader, competitionLogo, extendedInfo, stadium } = matchDetails;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const cyclingTexts = [`${matchHeader} - ${extendedInfo}`, stadium];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % cyclingTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cyclingTexts.length]);

  if (!isVisible) return null;

  return (
    <div className={`${styles['lower-third-wrapper']} ${styles[animationClass]}`}>
      <div className={styles['lower-third-container']}>
        <div className={styles['team-logo-left']}>
          <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles['team-logo']} />
        </div>

        <div className={styles['text-content']}>
          <div className={styles['teams-vs']}>
            <span className={styles['team-name']}>{matchDetails.teams.teamA}</span>
            <span className={styles['vs']}>vs</span>
            <span className={styles['team-name']}>{matchDetails.teams.teamB}</span>
          </div>

          <div className={styles['animated-text-container']}>
            {cyclingTexts.map((text, index) => (
              <span
                key={index}
                className={`${styles['text-line-2']} ${currentTextIndex === index ? styles['is-visible'] : ''}`}
              >
                {text}
              </span>
            ))}
          </div>

          <div className={styles['competition-logo']}>
            {competitionLogo && <img src={competitionLogo} alt="Competition Logo" className={styles['competition-logo-img']}/>}
          </div>
        </div>

        <div className={styles['team-logo-right']}>
          <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles['team-logo']} />
        </div>
      </div>
    </div>
  );
};

export default LowerThirdMatchup;
