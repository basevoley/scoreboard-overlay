import React from "react";
import styles from "./Lineup.module.css";
import useComponentVisibility from './hooks/useComponentVisibility';
import UniformIcon from "./UniformIcon";

const Lineup = ({ matchDetails, config }) => {

    const { isVisible, animationClass } = useComponentVisibility(config.enabled, 500);
    if (!isVisible) return null;
    const { players } = matchDetails;

    const getPlayers = (teamId) => Array.isArray(players[teamId]) ? players[teamId] : [];

    const playersA = getPlayers('teamA');
    const playersB = getPlayers('teamB');

    const maxRows = Math.max(playersA.length, playersB.length);

    return (
        <div className={`${styles['after-match-wrapper']} ${styles[animationClass]}`}>
            <div className={styles['after-match-inner']}>
                <div className={styles["table-wrapper"]}>
                    <table className={styles['comparison-table']}>
                        <thead>
                            <tr>
                                <th className={styles['header-cell']}>
                                    <div>
                                        <img src={matchDetails.teamLogos.teamA} alt={matchDetails.teams.teamA} className={styles['team-logo']} />
                                        <div className={styles['team-name']}>{matchDetails.teams.teamA}</div>
                                    </div>
                                </th>
                                <th className={styles['empty-cell']}><span className={styles['vs']}>vs</span></th>
                                <th className={styles['header-cell']}>
                                    <div>
                                        <img src={matchDetails.teamLogos.teamB} alt={matchDetails.teams.teamB} className={styles['team-logo']} />
                                        <div className={styles['team-name']}>{matchDetails.teams.teamB}</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div className={`${styles['tbody-wrapper']} ${config.showStats ? styles['stats-visible'] : styles['stats-hidden']}`}>
                        <table className={styles["comparison-table"]}>
                            <tbody className={styles['stats-tbody']}>
                                {[...Array(maxRows)].map((_, index) => (
                                    <tr key={index} className={styles['stat-row']}>
                                        <td className={styles["stat-value"]}>
                                            {playersA[index] && (
                                                <div className={styles['stat-content']}>
                                                    <UniformIcon shirtColor={matchDetails.teamColors.teamA} size={"1.8rem"} shirtNumber={playersA[index].number} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;{playersA[index].name}
                                                </div>
                                            )}
                                        </td>

                                        <td className={styles["empty-stat-content"]}>
                                            {/* Espacio central vacío */}
                                        </td>

                                        <td className={styles["stat-value"]}>
                                            {playersB[index] && (
                                                <div className={`${styles['stat-content']} ${styles['stat-content-B']}`}>
                                                    {playersB[index].name}
                                                    &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <UniformIcon shirtColor={matchDetails.teamColors.teamB} size={"1.8rem"} shirtNumber={playersB[index].number} />
                                                </div>
                                            )}
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

export default Lineup;
