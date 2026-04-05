import React from 'react';
import styles from './VerticalTableScoreboard.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import DroplinePanel from '../shared/DroplinePanel';
import ContentFlipper from '../shared/ContentFlipper';
import UniformIcon from '../shared/UniformIcon';
import type { MatchDetails } from '../../types/matchDetails';
import type { MatchData } from '../../types/matchData';
import type { ScoreboardConfig } from '../../types/config';
import type { DroplinePanelData } from '../../hooks/useDropline';
import { FLIPPER_SIZE, MAX_TIMEOUTS } from '../../constants';

interface VerticalTableScoreboardProps {
  matchDetails: MatchDetails;
  matchData: MatchData;
  scoreboardConfig: ScoreboardConfig;
  enabled: boolean;
  panelData: DroplinePanelData | null;
  shouldAnimate: boolean;
}

const VerticalTableScoreboard = ({ matchDetails, matchData, scoreboardConfig, enabled, panelData, shouldAnimate }: VerticalTableScoreboardProps) => {
  const { timeouts, scores, setScores, setsWon, currentServer } = matchData;
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);

  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isTopPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('top');

  const renderTeamRow = (team: 'teamA' | 'teamB') => {
    const timeoutIndicators = [...Array(MAX_TIMEOUTS)].map((_, index) => (
      <div
        key={index}
        className={`${styles['timeout-indicator']} ${index < timeouts[team] ? styles.used : ''}`}
      />
    ));

    return (
      <tr key={team}>
        <td className={styles['team-cell']}>
          <div className={styles['team-cell-content']}>
            <ContentFlipper
              duration={15}
              width={FLIPPER_SIZE}
              height={FLIPPER_SIZE}
              front={<img src={matchDetails.teamLogos[team]} alt={matchDetails.teams[team]} className={styles['team-logo']} />}
              back={<UniformIcon shirtColor={matchDetails.teamColors[team]} size={FLIPPER_SIZE} />}
            />
            <span className={styles['team-name']}>{matchDetails.teams[team]}</span>
          </div>
          <div className={styles['team-cell-indicators']}>
            <div className={styles['timeouts-container']}>{timeoutIndicators}</div>
            <div className={`${styles['serving-indicator']} ${currentServer === team ? '' : styles['not-serving']}`} />
          </div>
        </td>
        <td className={styles['sets-won-cell']}>{setsWon[team]}</td>
        {setScores.map((setScore, index) => (
          <td
            key={index}
            className={`${styles['set-points-cell']} ${scoreboardConfig.showHistory ? styles['history-visible'] : styles['history-hidden']}`}
          >
            <div className={styles['set-points-content']}>{setScore[team]}</div>
          </td>
        ))}
        <td className={styles['current-score-cell']}>{scores[team]}</td>
      </tr>
    );
  };

  return (
    <div className={`${styles['scoreboard-wrapper']} ${positionClass} ${styles['table-container']} ${styles[animationClass]}`}>
      <table className={styles['scoreboard-table']}>
        <tbody>
          {renderTeamRow('teamA')}
          {renderTeamRow('teamB')}
        </tbody>
      </table>
      {panelData && (
        <DroplinePanel
          icon={panelData.icon}
          textLine1={panelData.textLine1}
          textLine2={panelData.textLine2}
          isTopPosition={!!isTopPosition}
          isAnimatedIn={shouldAnimate}
        />
      )}
    </div>
  );
};

export default VerticalTableScoreboard;
