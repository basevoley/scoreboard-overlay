// src/AfterMatchStats.js
import React from "react";
import styles from "./AfterMatchStats.module.css";
import useComponentVisibility from './hooks/useComponentVisibility';

const AfterMatchStats = ({ matchDetails, matchData, afterMatchConfig }) => {

    const { isVisible, animationClass } = useComponentVisibility(afterMatchConfig.enabled, 500);
    if (!isVisible) return null;
    const { statistics, currentSetStats, winner, setsWon, setScores, scores, matchStarted, } = matchData;
    const { matchHeader, competitionLogo, extendedInfo, } = matchDetails;

    const stats = [
        { label: "PUNTOS Directos DE SAQUE", key: "ace" },
        { label: "% Recepciones buenas", key: "receptionEffectiveness" },
        { label: "PUNTOS DE ATAQUE", key: "attackPoint" },
        { label: "PUNTOS DE BLOQUEO", key: "blockPoint" },
        { label: "Errores cometidos", key: "selfErrors" },
        { label: "Efectividad del servicio", key: "serviceEffectiveness" },
        { label: "Efectividad del ataque", key: "attackEffectiveness" },
        { label: "Efectividad de la defensa", key: "defenseEffectiveness" },
    ];

    return (
        <div className={`${styles['after-match-wrapper']} ${styles[animationClass]}`}>
            <div className={styles['after-match-inner']}>
                <div className={styles["info-header"]}>
                    <div className={styles["competition-logo"]}>
                        {competitionLogo && (
                            <img src={competitionLogo} alt="Competition Logo" className={styles["competition-logo-img"]} style={{ backgroundColor: "#bdc3c7", padding: "5px" }} />
                        )}
                    </div>
                    <div style={{ width: "100%" }}>
                        <div className={styles["competition"]}>{matchHeader}</div>
                        <div className={styles["category"]}>{extendedInfo}</div>
                    </div>
                </div>
                <div className={styles["table-wrapper"]}>
                    <table className={styles["after-match-table"]}>
                        <thead>
                            <tr>
                                <th className={`${winner === "teamA" ? styles["winner"] : ""}`}>
                                    <div className={styles["header-cell"]}>
                                        <div className={styles['logo-container']}>
                                            <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles["team-logo"]} />
                                        </div>
                                        <div className={styles["team-name"]}>{matchDetails.teams.teamA}</div>
                                    </div>
                                </th>
                                <th className={styles["empty-cell"]}>
                                    <div>
                                        <span>{winner ? "FINAL" : (matchStarted ? "TIEMPO MUERTO" : "DESCANSO")}</span>
                                        {!winner && (
                                            <>
                                                <br />
                                                <span>{"SET " + (setScores.length + 1)}</span>
                                            </>
                                        )}
                                        <div className={styles["final-score"]}>
                                            <span className={`${winner === "teamA" ? styles["winner"] : ""}`} >
                                                {setsWon.teamA}
                                            </span>
                                            <span > - </span>
                                            <span className={`${winner === "teamB" ? styles["winner"] : ""}`}>{setsWon.teamB}</span>
                                        </div>
                                        <div className={styles["set-scores"]}>
                                            {setScores.map((setScore, index) => (
                                                <div key={index} >
                                                    <span className={`${setScore.teamA > setScore.teamB ? styles["set-winner"] : ""}`}>{setScore.teamA} </span>
                                                    -
                                                    <span className={`${setScore.teamB > setScore.teamA ? styles["set-winner"] : ""}`}> {setScore.teamB}</span>
                                                </div>
                                            ))}
                                            {!winner && (<div><span className={styles["current-score"]}>{scores.teamA} - {scores.teamB}</span></div>)}

                                        </div>
                                    </div>
                                </th>
                                <th className={`${winner === "teamB" ? styles["winner"] : ""}`}>
                                    <div className={styles["header-cell"]}>
                                        <div className={styles['logo-container']}>
                                            <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles["team-logo"]} />
                                        </div>
                                        <div className={styles["team-name"]}>{matchDetails.teams.teamB}</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div className={`${styles['tbody-wrapper']} ${afterMatchConfig.showStats ? styles['stats-visible'] : styles['stats-hidden']}`}>
                        <table className={styles["after-match-table"]}>
                            <tbody className={styles['stats-tbody']}>
                                {stats.map((stat, index) => (
                                    <tr key={index} className={styles['stat-row']}>
                                        <td className={styles["stat-value"]}>
                                            <div className={styles['stat-content']}>
                                                {winner ? statistics.teamA[stat.key] : currentSetStats.teamA[stat.key]}
                                            </div>
                                        </td>
                                        <td className={styles["stat-label"]}>
                                            <div className={styles['stat-content']}>
                                                {stat.label}
                                            </div>
                                        </td>
                                        <td className={styles["stat-value"]}>
                                            <div className={styles['stat-content']}>
                                                {winner ? statistics.teamB[stat.key] : currentSetStats.teamB[stat.key]}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AfterMatchStats;
