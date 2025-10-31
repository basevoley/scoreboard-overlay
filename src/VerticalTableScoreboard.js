// src/VerticalScoreboard.js
import React from 'react';
import styles from './VerticalTableScoreboard.module.css';
import useDropline from './hooks/useDropline'; // Import the custom hook
import DroplinePanel from './DroplinePanel';
import useComponentVisibility from './hooks/useComponentVisibility'; 

const VerticalTableScoreboard = ({ matchData, scoreboardConfig  }) => {
  const { teamA, teamB } = matchData;
  const { panelData, shouldAnimate } = useDropline(matchData.matchEvent); // Use the custom hook
  const { isVisible, animationClass } = useComponentVisibility(scoreboardConfig.enabled  && (scoreboardConfig.type=== 'vertical-table'), 500);
  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isTopPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('top');


  const renderTeamRow = (team) => {
    const timeoutIndicators = [...Array(2)].map((_, index) => (
      <div
        key={index}
        className={`${styles['timeout-indicator']} ${index < team.timeoutsUsed ? styles.used : ''}`}
      ></div>
    ));

    return (
      <tr>
        <td className={styles['team-cell']}>
          <div className={styles['team-cell-content']}>
            <img src={team.logo} alt={team.name} className={styles['team-logo']} />
            <span className={styles['team-name']}>{team.name}</span>
          </div>
          <div className={styles['team-cell-indicators']}>
            <div className={styles['timeouts-container']}>{timeoutIndicators}</div>
            {team.isServing && <div className={styles['serving-indicator']}></div>}
          </div>
        </td>
        <td className={styles['sets-won-cell']}>{team.sets}</td>
        {team.setPoints.map((set, index) => (
          <td key={index} className={styles['set-points-cell']}>
            {set.points}
          </td>
        ))}
        <td className={styles['current-score-cell']}>{team.score}</td>
      </tr>
    );
  };

  return (
    <div className={`${styles['scoreboard-wrapper']} ${positionClass} ${styles['table-container']} ${styles[animationClass]}`}>
        <table className={styles['scoreboard-table']}>
          <tbody>
            {renderTeamRow(teamA)}
            {renderTeamRow(teamB)}
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
