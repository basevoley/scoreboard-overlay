// src/Scoreboard.js
import React from "react";
import styles from "./Scoreboard.module.css";
import useDropline from './hooks/useDropline';
import DroplinePanel from "./DroplinePanel";
import useComponentVisibility from './hooks/useComponentVisibility'; 

const Scoreboard = ({ matchData, scoreboardConfig  }) => {
  const { teamA, teamB } = matchData;
  const { panelData, shouldAnimate } = useDropline(matchData.matchEvent);
  const { isVisible, animationClass } = useComponentVisibility(scoreboardConfig.enabled && (scoreboardConfig.type=== 'classic'), 500);
  if (!isVisible) return null;

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isBottomPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('bottom');

  const renderTimeouts = (team) => {
    return [...Array(2)].map((_, index) => (
      <div
        key={index}
        className={`${styles["timeout-indicator"]} ${
          index < team.timeoutsUsed ? styles.used : ""
        }`}
      ></div>
    ));
  };

  return (
    <div className={`${styles['scoreboard-wrapper']} ${positionClass} ${styles[animationClass]}`}>
      <div className={styles["scoreboard-container"]}>
        <div className={styles["team-info"]}>
          <img
            src={teamA.logo}
            alt={teamA.name}
            className={styles["team-logo"]}
          />
          <div className={styles["name-details"]}>
            <div className={styles["name-and-indicator"]}>
              <span className={styles["team-name"]}>{teamA.name}</span>
            </div>
            <div className={styles["timeouts-container"]}>
              {renderTimeouts(teamA)}
            </div>
          </div>
          {teamA.isServing && (
            <div
              className={`${styles["serving-indicator"]} ${styles.left}`}
            ></div>
          )}
        </div>

        {/* Scores and Sets */}
        <div className={styles["match-details"]}>
          <span className={styles["team-score"]}>{teamA.score}</span>
          <span className={styles["sets-score"]}>
            {teamA.sets}-{teamB.sets}
          </span>
          <span className={styles["team-score"]}>{teamB.score}</span>
        </div>

        {/* Team B */}
        <div className={styles["team-info"]}>
          {teamB.isServing && (
            <div
              className={`${styles["serving-indicator"]} ${styles.right}`}
            ></div>
          )}
          <div className={styles["name-details"]}>
            <div className={styles["name-and-indicator"]}>
              <span className={styles["team-name"]}>{teamB.name}</span>
            </div>
            <div className={styles["timeouts-container"]}>
              {renderTimeouts(teamB)}
            </div>
          </div>
          <img
            src={teamB.logo}
            alt={teamB.name}
            className={styles["team-logo"]}
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
