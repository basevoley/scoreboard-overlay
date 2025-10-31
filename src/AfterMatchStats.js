// src/AfterMatchStats.js
import React from "react";
import styles from "./AfterMatchStats.module.css";
import useComponentVisibility from './hooks/useComponentVisibility';

const AfterMatchStats = ({ matchData, afterMatchConfig }) => {
    
  const { isVisible, animationClass } = useComponentVisibility(afterMatchConfig.enabled, 500);
  if (!isVisible) return null;
    const { teamA, teamB, competition, competitionLogo, category, winner } =
        matchData;

    const stats = [
        { label: "SERVING ACES", key: "servingAces" },
        { label: "SERVING FAULTS", key: "servingFaults" },
        { label: "ATTACKS", key: "attacks" },
        { label: "ATTACK KILLS", key: "attackKills" },
        { label: "BLOCKS", key: "blocks" },
        { label: "DIGS", key: "digs" },
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
                    <div className={styles["competition"]}>{competition}</div>
                    <div className={styles["category"]}>{category}</div>
                </div>
            </div>
            <table className={styles["after-match-table"]}>
                <thead>
                    <tr>
                        <th className={`${styles["header-cell"]} ${winner === "teamA" ? styles["winner"] : ""}`}>
                            <div className={styles['logo-container']}>
                                <img src={teamA.logo} alt={teamA.name} className={styles["team-logo"]} />
                            </div>
                            <div className={styles["team-name"]}>{teamA.name}</div>
                        </th>
                        <th className={styles["empty-cell"]}>
                            <div>
                                <span>FINAL</span>
                                <div className={styles["final-score"]}>
                                    <span className={`${winner === "teamA" ? styles["winner"] : ""}`} >
                                        {teamA.sets}
                                    </span>
                                    <span > - </span>
                                    <span className={`${winner === "teamB" ? styles["winner"] : ""}`}>{teamB.sets}</span>
                                </div>
                            </div>
                        </th>
                        <th className={`${styles["header-cell"]} ${winner === "teamB" ? styles["winner"] : ""}`}>
                            <div className={styles['logo-container']}>
                                <img src={teamB.logo} alt={teamB.name} className={styles["team-logo"]} />
                            </div>
                            <div className={styles["team-name"]}>{teamB.name}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {afterMatchConfig.showStats && stats.map((stat, index) => (
                        <tr key={index}>
                            <td className={styles["stat-value"]}>{teamA.stats[stat.key]}</td>
                            <td className={styles["stat-label"]}>{stat.label}</td>
                            <td className={styles["stat-value"]}>{teamB.stats[stat.key]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AfterMatchStats;
