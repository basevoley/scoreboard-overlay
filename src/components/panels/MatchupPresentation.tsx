import React from 'react';
import styles from './MatchupPresentation.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import type { MatchDetails } from '../../types/matchDetails';

interface MatchupPresentationProps {
  matchDetails: MatchDetails;
  enabled: boolean;
}

const MatchupPresentation = ({ matchDetails, enabled }: MatchupPresentationProps) => {
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);
  if (!isVisible) return null;

  const { matchHeader, competitionLogo, extendedInfo, stadium } = matchDetails;

  return (
    <div className={`${styles['matchup-wrapper']} ${styles[animationClass]}`}>
      <div className={styles['matchup-card']}>
        <div className={styles['details-container']}>
          <div className={styles['competition-info']}>
            <span className={styles['competition']}>{matchHeader}</span>
          </div>
          <span className={styles['category']}>{extendedInfo}</span>
          <span className={styles['location']}>{stadium}</span>
        </div>
        <div className={styles['teams-container']}>
          <div className={styles['team']}>
            <div className={styles['logo-container']}>
              <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles['team-logo']} />
            </div>
            <span className={styles['team-name']}>{matchDetails.teams.teamA}</span>
          </div>
          <div className={styles['vs-container']}>
            <span className={styles['vs']}>vs</span>
            {competitionLogo && (
              <img src={competitionLogo} alt="Competition Logo" className={styles['competition-logo']} style={{ backgroundColor: '#bdc3c7', padding: '5px' }} />
            )}
          </div>
          <div className={styles['team']}>
            <div className={styles['logo-container']}>
              <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles['team-logo']} />
            </div>
            <span className={styles['team-name']}>{matchDetails.teams.teamB}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupPresentation;
