import React from 'react';
import { useSpectatorSocket } from './hooks/useSpectatorSocket';
import LiveScoreboard from './components/spectator/LiveScoreboard';
import styles from './components/spectator/LiveScoreboard.module.css';

const SpectatorApp = () => {
  const { matchDetails, matchData, status } = useSpectatorSocket();

  if (status === 'no-key') {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusTitle}>Enlace no válido</div>
        <div className={styles.statusSub}>Este enlace no contiene un identificador de partido.</div>
      </div>
    );
  }

  if ((status === 'connecting' || status === 'handshake-pending') && !matchData) {
    return (
      <div className={styles.statusPage}>
        <div className={styles.spinner} />
        <div className={styles.statusTitle}>Conectando...</div>
        <div className={styles.statusSub}>Buscando el partido en directo</div>
      </div>
    );
  }

  if (!matchDetails || !matchData) {
    return (
      <div className={styles.statusPage}>
        <div className={styles.spinner} />
        <div className={styles.statusTitle}>Esperando datos del partido</div>
        <div className={styles.statusSub}>El retransmisor aún no ha iniciado la sesión</div>
      </div>
    );
  }

  return <LiveScoreboard matchDetails={matchDetails} matchData={matchData} status={status} />;
};

export default SpectatorApp;
