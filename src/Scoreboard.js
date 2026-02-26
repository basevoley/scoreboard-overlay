// src/Scoreboard.js
import React from "react";
import styles from "./Scoreboard.module.css";
import useDropline from './hooks/useDropline';
import DroplinePanel from "./DroplinePanel";
import useComponentVisibility from './hooks/useComponentVisibility'; 
import ContentFlipper from "./ContentFlipper";
import UniformIcon from "./UniformIcon";

const Scoreboard = ({ matchDetails, matchData, scoreboardConfig  }) => {
  const { timeouts, scores,setsWon, currentServer } = matchData;

  const { panelData, shouldAnimate } = useDropline(matchData.matchEvent);
  const { isVisible, animationClass } = useComponentVisibility(scoreboardConfig.enabled && (scoreboardConfig.type=== 'classic'), 500);
  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isBottomPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('bottom');
  const flipperContentSize = '2.3rem';

  const renderTimeouts = (timeoutsUsed) => {
    return [...Array(2)].map((_, index) => (
      <div
        key={index}
        className={`${styles["timeout-indicator"]} ${
          index < timeoutsUsed ? styles.used : ""
        }`}
      ></div>
    ));
  };

  return (
    <div className={`${styles['scoreboard-wrapper']} ${positionClass} ${styles[animationClass]}`}>
      <div className={styles["scoreboard-container"]}>
        <div className={styles["team-info"]}>
            <ContentFlipper
              duration={15} // 8 segundos por ciclo completo
              width={flipperContentSize}
              height={flipperContentSize}
              front={
                <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles['team-logo']} />
              }
              back={
                <UniformIcon shirtColor={matchDetails.teamColors.teamA} size={flipperContentSize} />
              }
            />
          <div className={styles["name-details"]}>
            <div className={styles["name-and-indicator"]}>
              <span className={styles["team-name"]}>{matchDetails.teams.teamA}</span>
            </div>
            <div className={styles["timeouts-container"]}>
              {renderTimeouts(timeouts.teamA)}
            </div>
          </div>
          {currentServer === 'teamA' && (
            <div
              className={`${styles["serving-indicator"]} ${styles.left}`}
            ></div>
          )}
        </div>

        {/* Scores and Sets */}
        <div className={styles["match-details"]}>
          <span className={styles["team-score"]}>{scores.teamA}</span>
          <span className={styles["sets-score"]}>
            {setsWon.teamA}-{setsWon.teamB}
          </span>
          <span className={styles["team-score"]}>{scores.teamB}</span>
        </div>

        {/* Team B */}
        <div className={styles["team-info"]}>
          {currentServer === 'teamB' && (
            <div
              className={`${styles["serving-indicator"]} ${styles.right}`}
            ></div>
          )}
          <div className={styles["name-details"]}>
            <div className={styles["name-and-indicator"]}>
              <span className={styles["team-name"]}>{matchDetails.teams.teamB}</span>
            </div>
            <div className={styles["timeouts-container"]}>
              {renderTimeouts(timeouts.teamB)}
            </div>
          </div>
            <ContentFlipper
              duration={15} // 8 segundos por ciclo completo
              width={flipperContentSize}
              height={flipperContentSize}
              front={
                <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles['team-logo']} />
              }
              back={
                <UniformIcon shirtColor={matchDetails.teamColors.teamB} size={flipperContentSize} />
              }
            />
        </div>
      </div>
      {/* Dropline Panel */}
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
