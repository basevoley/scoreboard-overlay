import React, { useState } from 'react';
import styles from './LiveScoreboard.module.css';
import UniformIcon from '../shared/UniformIcon';
import type { MatchDetails } from '../../types/matchDetails';
import type { MatchData, MatchStats } from '../../types/matchData';
import type { SpectatorStatus } from '../../hooks/useSpectatorSocket';

interface Props {
  matchDetails: MatchDetails;
  matchData: MatchData;
  status: SpectatorStatus;
}

const STATS: { label: string; key: string }[] = [
  { label: 'Saques directos',  key: 'ace' },
  { label: '% Recepción',      key: 'receptionEffectiveness' },
  { label: 'Pts. ataque',      key: 'attackPoint' },
  { label: 'Pts. bloqueo',     key: 'blockPoint' },
  { label: 'Errores propios',  key: 'selfErrors' },
  { label: '% Servicio',       key: 'serviceEffectiveness' },
  { label: '% Ataque',         key: 'attackEffectiveness' },
  { label: '% Defensa',        key: 'defenseEffectiveness' },
];

function StatsGrid({ teamA, teamB }: { teamA: MatchStats; teamB: MatchStats }) {
  const rows = STATS.filter(({ key }) => teamA[key] !== undefined || teamB[key] !== undefined);
  if (rows.length === 0) {
    return <div className={styles.statsEmpty}>Sin estadísticas disponibles</div>;
  }
  return (
    <div className={styles.statsGrid}>
      {rows.map(({ label, key }) => (
        <div key={key} className={styles.statsRow}>
          <span className={styles.statVal}>{teamA[key] ?? '–'}</span>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statVal}>{teamB[key] ?? '–'}</span>
        </div>
      ))}
    </div>
  );
}


function setWinner(scoreA: number, scoreB: number): 'A' | 'B' | null {
  if (scoreA > scoreB) return 'A';
  if (scoreB > scoreA) return 'B';
  return null;
}

const LiveScoreboard = ({ matchDetails, matchData, status }: Props) => {
  const { teams, teamLogos, teamColors, matchHeader, extendedInfo, stadium } = matchDetails;
  const { scores, setsWon, setScores, setStats, currentServer, winner, matchPhase,
          statistics, currentSetStats } = matchData;

  const [inlineStatsOpen, setInlineStatsOpen] = useState(false);
  const [expandedSet, setExpandedSet] = useState<number | null>(null);

  const isEnded = matchPhase === 'ended'        || winner !== null;
  const isLive  = matchPhase === 'in-progress'  || matchPhase === 'between-sets';

  const phaseLabel =
    matchPhase === 'ended'          || winner !== null ? 'Partido finalizado'
    : matchPhase === 'pre-match'                       ? 'Partido no iniciado'
    : matchPhase === 'between-sets'                    ? 'Descanso entre sets'
    :                                                    'En juego';

  const inlineStatsLabel = isEnded ? 'Estadísticas Acumuladas' : 'Estadísticas del set actual';
  const inlineStats = isEnded ? statistics : currentSetStats;

  return (
    <div className={styles.page}>

      {/* Disconnected banner */}
      {status === 'disconnected' && (
        <div className={styles.disconnectedBanner}>
          <span>●</span> Sin conexión — mostrando último marcador conocido
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.liveBadge}>
          {isLive && <span className={styles.liveDot} />}
          {isLive ? 'En directo' : isEnded ? 'Finalizado' : 'Previo'}
        </div>
        <div className={styles.matchLabel}>
          {matchHeader && <div>{matchHeader}</div>}
          {extendedInfo && <div>{extendedInfo}</div>}
        </div>
      </div>

      {/* Score section */}
      <div className={styles.scoreSection}>

        {/* Team A */}
        <div className={styles.team}>
          <div className={styles.logoWrapper}>
            {teamLogos?.teamA && (
              <img src={teamLogos.teamA} alt={teams.teamA} className={styles.teamLogo} />
            )}
            <span className={styles.jerseyBadge}>
              <UniformIcon shirtColor={teamColors?.teamA ?? '#888'} size="16" />
            </span>
          </div>
          <div className={styles.teamName}>{teams.teamA}</div>
        </div>

        {/* Current score */}
        <div className={styles.scoreCenter}>
          {isEnded ? (
            <div className={styles.scores}>
              <span className={winner === 'teamA' ? styles.scoreNumWin : styles.scoreNum}>{setsWon.teamA}</span>
              <span className={styles.scoreDivider}>–</span>
              <span className={winner === 'teamB' ? styles.scoreNumWin : styles.scoreNum}>{setsWon.teamB}</span>
            </div>
          ) : (
            <>
              <div className={styles.scores}>
                <span className={styles.scoreNum}>{scores.teamA}</span>
                <span className={styles.scoreDivider}>–</span>
                <span className={styles.scoreNum}>{scores.teamB}</span>
              </div>
              <div className={styles.setsWon}>
                <span className={setsWon.teamA > setsWon.teamB ? styles.setsWonAccent : undefined}>{setsWon.teamA}</span>
                <span className={styles.setsWonDivider}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className={setsWon.teamB > setsWon.teamA ? styles.setsWonAccent : undefined}>{setsWon.teamB}</span>
              </div>
            </>
          )}
          <div className={styles.serverRow}>
            {currentServer === 'teamA' && (
              <><span className={styles.serverTriangleLeft} /><span className={styles.serverLabel}>saque</span></>
            )}
            {currentServer === 'teamB' && (
              <><span className={styles.serverLabel}>saque</span><span className={styles.serverTriangleRight} /></>
            )}
          </div>
          <div className={styles.phaseLabel}>{phaseLabel}</div>
        </div>

        {/* Team B */}
        <div className={styles.team}>
          <div className={styles.logoWrapper}>
            {teamLogos?.teamB && (
              <img src={teamLogos.teamB} alt={teams.teamB} className={styles.teamLogo} />
            )}
            <span className={styles.jerseyBadge}>
              <UniformIcon shirtColor={teamColors?.teamB ?? '#888'} size="16" />
            </span>
          </div>
          <div className={styles.teamName}>{teams.teamB}</div>
        </div>

      </div>

      {/* Inline stats — current set or match total */}
      {(isLive || isEnded) && (
        <div className={styles.statsSection}>
          <button
            className={styles.statsSectionToggle}
            onClick={() => setInlineStatsOpen(v => !v)}
          >
            <span>{inlineStatsLabel}</span>
            <span className={styles.statsChevron}>{inlineStatsOpen ? '▲' : '▼'}</span>
          </button>
          {inlineStatsOpen && (
            <StatsGrid teamA={inlineStats.teamA} teamB={inlineStats.teamB} />
          )}
        </div>
      )}

      {/* Set history */}
      {setScores.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>Historial de sets</div>
          {setScores.map((s, i) => {
            const w = setWinner(s.teamA, s.teamB);
            const isExpanded = expandedSet === i;
            return (
              <React.Fragment key={i}>
                <div className={styles.historyRow}>
                  <span className={styles.historySetLabel}>Set {i + 1}</span>
                  <span className={styles.historyScore}>
                    <span className={w === 'A' ? styles.historyScoreWin : undefined}>{s.teamA}</span>
                    {' – '}
                    <span className={w === 'B' ? styles.historyScoreWin : undefined}>{s.teamB}</span>
                  </span>
                  <button
                    className={styles.historyExpandBtn}
                    onClick={() => setExpandedSet(isExpanded ? null : i)}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
                {isExpanded && (
                  <div className={styles.historyExpandedStats}>
                    <StatsGrid
                      teamA={setStats[i]?.statistics.teamA ?? {}}
                      teamB={setStats[i]?.statistics.teamB ?? {}}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {stadium && (
        <div className={styles.footer}>
          <div>{stadium}</div>
        </div>
      )}

    </div>
  );
};

export default LiveScoreboard;
