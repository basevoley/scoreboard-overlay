import React from 'react';
import styles from './TeamComparisonTable.module.css';
import useComponentVisibility from '../../hooks/useComponentVisibility';
import type { MatchDetails } from '../../types/matchDetails';

const STATS: { label: string; key: keyof import('../../types/matchDetails').SeasonStats }[] = [
  { label: 'Posición', key: 'ranking' },
  { label: 'Puntos', key: 'competitionPoints' },
  { label: 'Partidos Jugados', key: 'matchesPlayed' },
  { label: 'Total Partidos Ganados', key: 'totalMatchesWon' },
  { label: 'Ganados 3 pts', key: 'won3Points' },
  { label: 'Ganados 2 pts', key: 'won2Points' },
  { label: 'Total Partidos Perdidos', key: 'totalMatchesLost' },
  { label: 'Perdidos 1 pt', key: 'lost1Point' },
  { label: 'Perdidos 0 pts', key: 'lost0Points' },
  { label: 'Total Puntos Realizados', key: 'totalPointsScored' },
  { label: 'Total Puntos Recibidos', key: 'totalPointsReceived' },
];

interface TeamComparisonTableProps {
  matchDetails: MatchDetails;
  enabled: boolean;
}

const TeamComparisonTable = ({ matchDetails, enabled }: TeamComparisonTableProps) => {
  const { isVisible, animationClass } = useComponentVisibility(enabled, 500);
  if (!isVisible) return null;

  return (
    <div className={`${styles['comparison-wrapper']} ${styles[animationClass]}`}>
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
        <tbody>
          {STATS.map((stat, index) => (
            <tr key={index}>
              <td className={styles['stat-value']}>{matchDetails.stats.teamA[stat.key]}</td>
              <td className={styles['stat-label']}>{stat.label}</td>
              <td className={styles['stat-value']}>{matchDetails.stats.teamB[stat.key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamComparisonTable;
