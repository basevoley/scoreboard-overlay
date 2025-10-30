// src/Scoreboard.js
import React, { useState, useEffect  } from "react";
import styles from "./Scoreboard.module.css";
import DroplinePanel from "./DroplinePanel"; // New import

const Scoreboard = ({ matchData, scoreboardConfig  }) => {
  const { teamA, teamB } = matchData;
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelData, setPanelData] = useState(null); // State to control the panel
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isBottomPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('bottom');

// Use useEffect to watch for changes in matchEvent
  useEffect(() => {
    const { matchEvent } = matchData;

    if (matchEvent.type) {
      let icon, textLine1, textLine2;

      // Logic to determine dropline content based on the event type
      switch (matchEvent.type) {
        case 'referee-call':
          icon = '/ref_flag.png';
          textLine1 = matchEvent.details.text;
          // textLine2 = `Call at ${new Date(matchEvent.timestamp).toLocaleTimeString()}`;
          break;
        case 'substitution':
          icon = '/substitution-icon.webp';
          textLine1 = `Substitution: ${matchEvent.details.player}`;
          textLine2 = `for ${matchEvent.details.team}`;
          break;
        default:
          icon = null;
          textLine1 = null;
          textLine2 = null;
          break;
      }

      // Display the dropline
      if (icon && textLine1) {
        setPanelData({ icon, textLine1, textLine2 });
        setIsPanelVisible(true);
        setTimeout(() => setShouldAnimate(true), 10);
      }
    }
  }, [matchData.matchEvent]); // Dependency array: run effect only when matchEvent changes

  useEffect(() => {
    if (isPanelVisible) {
      setTimeout(() => setShouldAnimate(false), 3000);
      setTimeout(() => {
        setPanelData(null);
        setIsPanelVisible(false);
      }, 3500);
    }
  }, [isPanelVisible]);

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
    <div className={`${styles['scoreboard-wrapper']} ${positionClass}`}>
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
