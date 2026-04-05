import React from 'react';
import styles from './Scoreboard.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import DroplinePanel from '../shared/DroplinePanel';
import ContentFlipper from '../shared/ContentFlipper';
import UniformIcon from '../shared/UniformIcon';
import type { MatchDetails } from '../../types/matchDetails';
import type { MatchData } from '../../types/matchData';
import type { ScoreboardConfig } from '../../types/config';
import type { DroplinePanelData } from '../../hooks/useDropline';
import { FLIPPER_SIZE, MAX_TIMEOUTS } from '../../constants';

interface ScoreboardProps {
  matchDetails: MatchDetails;
  matchData: MatchData;
  scoreboardConfig: ScoreboardConfig;
  enabled: boolean;
  panelData: DroplinePanelData | null;
  shouldAnimate: boolean;
}

const Scoreboard = ({ matchDetails, matchData, scoreboardConfig, enabled, panelData, shouldAnimate }: ScoreboardProps) => {
  const { timeouts, scores, setsWon, currentServer } = matchData;
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);

  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isBottomPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('bottom');

  const renderTimeouts = (timeoutsUsed: number) =>
    [...Array(MAX_TIMEOUTS)].map((_, index) => (
      <div
        key={index}
        className={`${styles['timeout-indicator']} ${index < timeoutsUsed ? styles.used : ''}`}
      />
    ));

  return (
    <div className={`${styles['scoreboard-wrapper']} ${positionClass} ${styles[animationClass]}`}>
      <div className={styles['scoreboard-container']}>
        {/* Team A */}
        <div className={styles['team-info']}>
          <ContentFlipper
            duration={15}
            width={FLIPPER_SIZE}
            height={FLIPPER_SIZE}
            front={<img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles['team-logo']} />}
            back={<UniformIcon shirtColor={matchDetails.teamColors.teamA} size={FLIPPER_SIZE} />}
          />
          <div className={styles['name-details']}>
            <div className={styles['name-and-indicator']}>
              <span className={styles['team-name']}>{matchDetails.teams.teamA}</span>
            </div>
            <div className={styles['timeouts-container']}>
              {renderTimeouts(timeouts.teamA)}
            </div>
          </div>
          {currentServer === 'teamA' && (
            <div className={`${styles['serving-indicator']} ${styles.left}`} />
          )}
        </div>

        {/* Score */}
        <div className={styles['match-details']}>
          <span className={styles['team-score']}>{scores.teamA}</span>
          <span className={styles['sets-score']}>{setsWon.teamA}-{setsWon.teamB}</span>
          <span className={styles['team-score']}>{scores.teamB}</span>
        </div>

        {/* Team B */}
        <div className={styles['team-info']}>
          {currentServer === 'teamB' && (
            <div className={`${styles['serving-indicator']} ${styles.right}`} />
          )}
          <div className={styles['name-details']}>
            <div className={styles['name-and-indicator']}>
              <span className={styles['team-name']}>{matchDetails.teams.teamB}</span>
            </div>
            <div className={styles['timeouts-container']}>
              {renderTimeouts(timeouts.teamB)}
            </div>
          </div>
          <ContentFlipper
            duration={15}
            width={FLIPPER_SIZE}
            height={FLIPPER_SIZE}
            front={<img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles['team-logo']} />}
            back={<UniformIcon shirtColor={matchDetails.teamColors.teamB} size={FLIPPER_SIZE} />}
          />
        </div>
      </div>

      {panelData && (
        <DroplinePanel
          icon={panelData.icon}
          textLine1={panelData.textLine1}
          textLine2={panelData.textLine2}
          isTopPosition={!isBottomPosition}
          isAnimatedIn={shouldAnimate}
        />
      )}
    </div>
  );
};

export default Scoreboard;
