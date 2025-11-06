// src/AfterMatchStats.js
import React from "react";
import styles from "./AfterMatchStats.module.css";
import useComponentVisibility from './hooks/useComponentVisibility';

const AfterMatchStats = ({ matchDetails, matchData, afterMatchConfig }) => {
    
  const { isVisible, animationClass } = useComponentVisibility(afterMatchConfig.enabled, 500);
  if (!isVisible) return null;
    const { statistics, winner, setsWon, } = matchData;
    const { matchHeader, competitionLogo, extendedInfo } = matchDetails;

    const stats = [
        { label: "SERVING ACES", key: "ace" },
        { label: "SERVING FAULTS", key: "serveError" },
        { label: "ATTACKS", key: "attack" },
        { label: "ATTACK KILLS", key: "attackPoint" },
        { label: "BLOCKS", key: "blockPoint" },
        { label: "DIGS", key: "dig" },
    ];

    return (
        <div className={`${styles['after-match-wrapper']} ${styles[animationClass]}`}>
            <div className={styles["info-header"]}>
                <div className={styles["competition-logo"]}>
                    {competitionLogo && (
                        <img src={competitionLogo} alt="Competition Logo" className={styles["competition-logo-img"]} style={{ backgroundColor: "#bdc3c7", padding: "5px" }} />
                    )}
                </div>
                <div>
                    <div className={styles["competition"]}>{matchHeader}</div>
                    <div className={styles["category"]}>{extendedInfo}</div>
                </div>
            </div>
            <table className={styles["after-match-table"]}>
                <thead>
                    <tr>
                        <th className={`${styles["header-cell"]} ${winner === "teamA" ? styles["winner"] : ""}`}>
                            <div className={styles['logo-container']}>
                                <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles["team-logo"]} />
                            </div>
                            <div className={styles["team-name"]}>{matchDetails.teams.teamA}</div>
                        </th>
                        <th className={styles["empty-cell"]}>
                            <div>
                                <span>{winner? "FINAL" : "EN JUEGO"}</span>
                                <div className={styles["final-score"]}>
                                    <span className={`${winner === "teamA" ? styles["winner"] : ""}`} >
                                        {setsWon.teamA}
                                    </span>
                                    <span > - </span>
                                    <span className={`${winner === "teamB" ? styles["winner"] : ""}`}>{setsWon.teamB}</span>
                                </div>
                            </div>
                        </th>
                        <th className={`${styles["header-cell"]} ${winner === "teamB" ? styles["winner"] : ""}`}>
                            <div className={styles['logo-container']}>
                                <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles["team-logo"]} />
                            </div>
                            <div className={styles["team-name"]}>{matchDetails.teams.teamB}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {afterMatchConfig.showStats && stats.map((stat, index) => (
                        <tr key={index}>
                            <td className={styles["stat-value"]}>{statistics.teamA[stat.key]}</td>
                            <td className={styles["stat-label"]}>{stat.label}</td>
                            <td className={styles["stat-value"]}>{statistics.teamB[stat.key]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AfterMatchStats;
