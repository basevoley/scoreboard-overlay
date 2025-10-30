// src/Scoreboard.js
import React, { useState, useEffect  } from "react";
import styles from "./Scoreboard.module.css";
import DroplinePanel from "./DroplinePanel"; // New import

const Scoreboard = ({ matchData, scoreboardConfig  }) => {
  const { teamA, teamB } = matchData;
  const [panelData, setPanelData] = useState(null); // State to control the panel

    // You can derive the class name from the prop
  const positionClass = scoreboardConfig.position ? styles[scoreboardConfig.position] : '';
  const isBottomPosition = scoreboardConfig.position && scoreboardConfig.position.startsWith('bottom');


  // Dummy function to demonstrate how to trigger the panel
  const handleAction = () => {
    setPanelData({
      icon: "/ref_flag.png", // Replace with your icon path
      textLine1: "Referee Decision",
      textLine2: "Player Substitution",
    });
    // setTimeout(() => setPanelData(null), 5000); // Hide after 5 seconds
  };
  
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleAction();
  //   }, 2000); // Trigger after 2 seconds

  //   return () => clearTimeout(timer); // Cleanup on unmount
  // }, []); // Empty dependency array means this runs once on mount

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
      {/* New wrapper div */}
      <div className={styles["scoreboard-container"]}>
        {/* Team A */}
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
        />
      )}
            {/* Example button to trigger the dropline */}
      <button onClick={handleAction} style={{ position: 'fixed', top: '100px', left: '100px' }}>
        Show Dropline
      </button>

    </div>
  );
};

export default Scoreboard;
