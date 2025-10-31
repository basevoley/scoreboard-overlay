// src/MatchupPresentation.js
import React from 'react';
import styles from './MatchupPresentation.module.css';
import useComponentVisibility from './hooks/useComponentVisibility';

const MatchupPresentation = ({ matchData, enabled }) => {
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);
  if (!isVisible) return null;

  const { teamA, teamB, competition, competitionLogo, category, location } = matchData;

  return (
    <div className={`${styles['matchup-wrapper']} ${styles[animationClass]}`}>
      <div className={styles['matchup-card']}>
        <div className={styles['details-container']}>
          <div className={styles['competition-info']}>
            <span className={styles['competition']}>{competition}</span>
          </div>
          <span className={styles['category']}>{category}</span>
          <span className={styles['location']}>{location}</span>
        </div>
        <div className={styles['teams-container']}>
          <div className={styles['team']}>
            <img src={teamA.logo} alt={teamA.name} className={styles['team-logo']} />
            <span className={styles['team-name']}>{teamA.name}</span>
          </div>
          <div className={styles['vs-container']}>
            <span className={styles['vs']}>vs</span>
            {competitionLogo && <img src={competitionLogo} alt="Competition Logo" className={styles['competition-logo']} style={{ backgroundColor: '#bdc3c7', padding: '5px' }} />}
          </div>
          <div className={styles['team']}>
            <img src={teamB.logo} alt={teamB.name} className={styles['team-logo']} />
            <span className={styles['team-name']}>{teamB.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupPresentation;
