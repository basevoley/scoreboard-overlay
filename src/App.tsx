import React from 'react';
import { OverlayProvider } from './contexts/OverlayContext';
import ScoreboardRouter from './components/scoreboard/ScoreboardRouter';
import MatchupPresentation from './components/panels/MatchupPresentation';
import LowerThirdMatchup from './components/lower-thirds/LowerThirdMatchup';
import SocialMediaLowerThird from './components/lower-thirds/SocialMediaLowerThird';
import TeamComparisonTable from './components/panels/TeamComparisonTable';
import AfterMatchStats from './components/panels/AfterMatchStats';
import SponsorsPanel from './components/panels/SponsorsPanel';
import SubscribeAnimation from './components/panels/SubscribeAnimation';
import Lineup from './components/panels/Lineup';
import DevControls from './components/DevControls';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { useSocket } from './hooks/useSocket';
import './App.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_SERVER_URL) {
  console.error(
    '[scoreboard-overlay] VITE_SOCKET_URL is not defined. ' +
    'Create a .env.local file with VITE_SOCKET_URL=http://localhost:3005.'
  );
}

function App() {
  const { matchDetails, matchData, config, matchEvent, setMatchEvent, setConfig, connectionStatus } = useSocket();

  return (
    <>
      {connectionStatus === 'no-connection' && matchDetails && config && (
        <DevControls
          matchDetails={matchDetails}
          config={config}
          setMatchEvent={setMatchEvent}
          setConfig={setConfig}
        />
      )}
      <OverlayProvider width={1920} height={1080} connectionStatus={connectionStatus}>
        {connectionStatus === 'connecting' && (
          <div className="connecting-animation">Conectando con el servidor de mensajería...</div>
        )}
        {connectionStatus === 'handshake-pending' && (
          <div className="connecting-animation">Conectado al servidor de mensajería. Comunicando con la aplicación de control...</div>
        )}
        {connectionStatus === 'handshake-success' && (
          <div className="success-message">Comunicación establecida!</div>
        )}

        {matchData != null && config != null && matchDetails != null && (
          <>
            <ErrorBoundary name="ScoreboardRouter">
              <ScoreboardRouter matchDetails={matchDetails} matchData={matchData} scoreboardConfig={config.scoreboard} matchEvent={matchEvent} />
            </ErrorBoundary>
            <ErrorBoundary name="MatchupPresentation">
              <MatchupPresentation matchDetails={matchDetails} enabled={config.matchup.enabled} />
            </ErrorBoundary>
            <ErrorBoundary name="LowerThirdMatchup">
              <LowerThirdMatchup matchDetails={matchDetails} enabled={config.lowerThird.enabled} />
            </ErrorBoundary>
            <ErrorBoundary name="SocialMediaLowerThird">
              <SocialMediaLowerThird socialMediaConfig={config.socialMedia} />
            </ErrorBoundary>
            <ErrorBoundary name="TeamComparisonTable">
              <TeamComparisonTable matchDetails={matchDetails} enabled={config.teamComparison.enabled} />
            </ErrorBoundary>
            <ErrorBoundary name="AfterMatchStats">
              <AfterMatchStats matchDetails={matchDetails} matchData={matchData} afterMatchConfig={config.afterMatch} />
            </ErrorBoundary>
            <ErrorBoundary name="SponsorsPanel">
              <SponsorsPanel sponsorsConfig={config.sponsors} />
            </ErrorBoundary>
            <ErrorBoundary name="SubscribeAnimation">
              <SubscribeAnimation config={config.subscribe} />
            </ErrorBoundary>
            <ErrorBoundary name="Lineup">
              <Lineup matchDetails={matchDetails} config={config.lineup} />
            </ErrorBoundary>
          </>
        )}
      </OverlayProvider>
    </>
  );
}

export default App;
