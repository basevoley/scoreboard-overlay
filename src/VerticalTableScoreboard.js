// src/VerticalScoreboard.js
import React from 'react';
import styles from './VerticalTableScoreboard.module.css';
import useDropline from './hooks/useDropline'; // Import the custom hook
import DroplinePanel from './DroplinePanel';
import useComponentVisibility from './hooks/useComponentVisibility';
import ContentFlipper from './ContentFlipper';
import UniformIcon from './UniformIcon';

const VerticalTableScoreboard = ({ matchDetails, matchData, scoreboardConfig }) => {
  const { timeouts, scores, setScores, setsWon, currentServer } = matchData;
  const { panelData, shouldAnimate } = useDropline(matchData.matchEvent); // Use the custom hook
  const { isVisible, animationClass } = useComponentVisibility(scoreboardConfig.enabled && (scoreboardConfig.type === 'vertical-table'), 500);
  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isTopPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('top');


  const renderTeamRow = (team) => {
    const timeoutIndicators = [...Array(2)].map((_, index) => (
      <div
        key={index}
        className={`${styles['timeout-indicator']} ${index < timeouts[team] ? styles.used : ''}`}
      ></div>
    ));

    const flipperContentSize = '32px';

    return (
      <tr>
        <td className={styles['team-cell']}>
          <div className={styles['team-cell-content']}>
            <ContentFlipper
              duration={15} // 8 segundos por ciclo completo
              width={flipperContentSize}
              height={flipperContentSize}
              front={
                <img src={matchDetails.teamLogos[team]} alt={matchDetails.teams[team]} className={styles['team-logo']} />
              }
              back={
                <UniformIcon shirtColor={matchDetails.teamColors[team]} size={flipperContentSize} />
              }
            />

            <span className={styles['team-name']}>{matchDetails.teams[team]}</span>
          </div>
          <div className={styles['team-cell-indicators']}>
            <div className={styles['timeouts-container']}>{timeoutIndicators}</div>
            <div className={`${styles['serving-indicator']} ${currentServer === team ? '' : styles['not-serving']}`}></div>
          </div>
        </td>
        <td className={styles['sets-won-cell']}>{setsWon[team]}</td>
        {setScores.length > 0 && (setScores.map((setScore, index) => (
          <td key={index} className={styles['set-points-cell']}>
            {setScore[team]}
          </td>
        )))}
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
          isTopPosition={isTopPosition} // Pass the position prop
          isAnimatedIn={shouldAnimate}
        />
      )}
    </div>
  );
};

export default VerticalTableScoreboard;
