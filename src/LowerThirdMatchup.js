// src/LowerThirdMatchup.js
import React, { useState, useEffect } from 'react';
import styles from './LowerThirdMatchup.module.css';

const LowerThirdMatchup = ({ matchData }) => {
  const { teamA, teamB, competition, competitionLogo, category, location } = matchData;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const cyclingTexts = [`${competition} - ${category}`, location];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % cyclingTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [cyclingTexts.length]);

  return (
    <div className={styles['lower-third-wrapper']}>
      <div className={styles['lower-third-container']}>
        <div className={styles['team-logo-left']}>
          <img src={teamA.logo} alt={teamA.name} className={styles['team-logo']} />
        </div>

        <div className={styles['text-content']}>
          <div className={styles['teams-vs']}>
            <span className={styles['team-name']}>{teamA.name}</span>
            <span className={styles['vs']}>vs</span>
            <span className={styles['team-name']}>{teamB.name}</span>
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
            {competitionLogo && <img src={competitionLogo} alt="Competition Logo" className={styles['competition-logo-img']} style={{ backgroundColor: '#bdc3c7', padding: '5px' }}/>}
          </div>
        </div>

        <div className={styles['team-logo-right']}>
          <img src={teamB.logo} alt={teamB.name} className={styles['team-logo']} />
        </div>
      </div>
    </div>
  );
};

export default LowerThirdMatchup;
