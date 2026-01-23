// src/App.js
import React, { useState, useEffect } from 'react';
import { OverlayProvider } from './contexts/OverlayContext';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import MatchupPresentation from './MatchupPresentation';
import LowerThirdMatchup from './LowerThirdMatchup';
import TeamComparisonTable from './TeamComparisonTable';
import AfterMatchStats from './AfterMatchStats';
import SocialMediaLowerThird from './SocialMediaLowerThird';
import io from 'socket.io-client';
import './App.css';
import SponsorsPanel from './SponsorsPanel';

const initialMatchDetails = {
  teams: { teamA: 'Equipo Local Demo', teamB: 'Equipo Visitante Demo' },
  teamLogos: {
    teamA: 'logo192.png',
    teamB: 'logo.svg'
  },
  teamColors: {
    teamA: '#007BFF',
    teamB: '#FF5733'
  },
  matchHeader: 'CATEGORIA - Division',
  extendedInfo: 'Fase - Jornada X',
  stadium: 'Pabellón donde se juega, Ciudad',
  competitionLogo: 'sample_logo.jpg',
  maxSets: 5,
  stats: {
    teamA: {
      ranking: 0, competitionPoints: 0, matchesPlayed: 0, totalMatchesWon: 0, won3Points: 0, won2Points: 0, totalMatchesLost: 0, lost1Point: 0, lost0Points: 0, totalPointsScored: 0, totalPointsReceived: 0,
    },
    teamB: {
      ranking: 0, competitionPoints: 0, matchesPlayed: 0, totalMatchesWon: 0, won3Points: 0, won2Points: 0, totalMatchesLost: 0, lost1Point: 0, lost0Points: 0, totalPointsScored: 0, totalPointsReceived: 0,
    }
  },
};

const initialMatchData = {
  scores: { teamA: 0, teamB: 0 },
  setsWon: { teamA: 1, teamB: 1 },
  setScores: [{ teamA: 25, teamB: 23 }, { teamA: 23, teamB: 25 },],
  currentServer: null,
  ballPossession: null,
  matchStarted: false,
  timeouts: { teamA: 0, teamB: 0 },
  statistics: {
    teamA: {},
    teamB: {},
  },
  currentSetStats: {
    teamA: {},
    teamB: {},
  },
  winner: null,
  matchEvent: {
    timestamp: Date.now(),
    type: null,
    details: null,
  },
};

const initialConfig = {
  scoreboard: {
    enabled: false,
    showHistory: true,
    type: 'classic',
    position: 'top',
  },
  matchup: {
    enabled: false,
  },
  lowerThird: {
    enabled: false,
  },
  socialMedia: {
    enabled: false,
    position: 'top-left',
    channels: [
      { network: 'YouTube', handle: 'YourChannelName', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png' },
      { network: 'TikTok', handle: 'YourTikTokHandle', icon: 'https://images.seeklogo.com/logo-png/34/2/tiktok-logo-png_seeklogo-340606.png' },
      { network: 'Instagram', handle: 'YourInstagram', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Instagram-Gradient-Logo-PNG.png' },
      { network: 'Twitch', handle: 'YourTwitchChannel', icon: 'https://images.seeklogo.com/logo-png/44/2/twitch-new-logo-png_seeklogo-447573.png' },
      { network: 'Facebook', handle: 'YourFacebook', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png' },
    ],
  },
  teamComparison: {
    enabled: false,
  },
  afterMatch: {
    enabled: false,
    showStats: true,
  },
  sponsors: {
    enabled: false,
    imageUrls: [
      // 'https://image.singular.live/63c1faa42c4533fdf366cc258ed847c5/images/2IhxI7aYt6kMejyz3Q6Vdf_w1953h551.png',
      // 'https://image.singular.live/63c1faa42c4533fdf366cc258ed847c5/images/3SElrO9xWs8gXjxfMbcV7i_w2161h445.png',
      // 'https://image.singular.live/63c1faa42c4533fdf366cc258ed847c5/images/1SBvSFDEg2nR1z0qMXI0kL_w755h242.png',
      'sponsors-1.png',
      'sponsors-2.png',
      'sponsors-3.png',
      // Añade más URLs según sea necesario
    ], displayTime: 4000,
  },
};

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL;

function App() {
  const [matchDetails, setMatchDetails] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const [config, setConfig] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected'


  useEffect(() => {
    // Extract the key from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const extractedKey = urlParams.get('key');

    if (extractedKey) {
      setConnectionStatus('connecting');

      // Connect to the Socket.io server using the extracted key
      const socketInstance = io(SOCKET_SERVER_URL, {
        query: { key: extractedKey },
      });

      socketInstance.on('connect', () => {
        console.log(`Socket.io connection established - client id: ${socketInstance.id}`);
        setConnectionStatus('handshake-pending');
        socketInstance.emit('handshake', { message: 'Hello from OverlayApp!' });
      });

      socketInstance.on('handshake-response', (data) => {
        console.log('Handshake response received:', data);
        setConnectionStatus('handshake-success');
        setTimeout(() => {
          setConnectionStatus('handshake-success-displayed');
        }, 5000);
        setMatchDetails(data.matchDetails);
        setMatchData(data.matchData);
        setConfig(data.config);
      });

      socketInstance.on('message', (data) => {
        console.log('Message received:', data);
      });

      socketInstance.on('matchDetails', (data) => {
        console.log('Message received:', JSON.stringify(data));
        setMatchDetails(data);
      });

      socketInstance.on('matchData', (data) => {
        console.log('Message received:', JSON.stringify(data));
        setMatchData(data);
      });

      socketInstance.on('updateConfig', (data) => {
        console.log('Message received:', JSON.stringify(data));
        setConfig(data);
      });

      socketInstance.on('reload', () => {
        console.log('Reload received!');
        window.location.reload();
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket.io connection closed');
      });

      socketInstance.on('error', (error) => {
        console.error('Socket.io error:', error);
      });

      // setSocket(socketInstance);

      // Cleanup function to disconnect the socket when the component unmounts
      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    } else {
      console.error('No key found in URL');
      setConnectionStatus('no-connection');
      setMatchDetails(initialMatchDetails);
      setMatchData(initialMatchData);
      setConfig(initialConfig);
    }
  }, []);




  // Function to simulate a new match event
  const triggerMatchEvent = (eventType, eventDetails) => {
    setMatchData((prevData) => ({
      ...prevData,
      matchEvent: {
        timestamp: Date.now(),
        type: eventType,
        details: eventDetails,
      },
    }));
  };

  const handleToggleScoreboardHistory = () => {
    // Example: Toggle the scoreboard enabled state
    setConfig(prevConfig => ({
      ...prevConfig,
      scoreboard: {
        ...prevConfig.scoreboard,
        showHistory: !prevConfig.scoreboard.showHistory,
      },
    }));
  };

  // Handler for the scoreboard type toggle button
  const handleToggleScoreboardType = () => {
    setConfig(prevConfig => ({
      ...prevConfig,
      scoreboard: {
        ...prevConfig.scoreboard,
        type: prevConfig.scoreboard.type === 'classic' ? 'vertical-table' : 'classic',
      },
    }));
  };

  // Handler for the position dropdown selector
  const handleSelectChange = (section, key, value) => {
    const updatedConfig = {
      ...config,
      [section]: {
        ...config[section],
        [key]: value,
      },
    };
    setConfig(updatedConfig);
  };
  // --- Generic Handler for toggling component visibility ---
  const handleToggleComponent = (componentName) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [componentName]: {
        ...prevConfig[componentName],
        enabled: !prevConfig[componentName].enabled,
      },
    }));
  };
  return (
    <>
      {/* Control buttons for demonstration */}
      {connectionStatus === 'no-connection' && (
        <div className="controls">
          <button onClick={() => handleToggleComponent('scoreboard')}>
            Toggle Scoreboard Visibility (Enabled: {config.scoreboard.enabled.toString()})
          </button>
          <button onClick={handleToggleScoreboardType}>
            Switch Scoreboard Style (Current: {config.scoreboard.type})
          </button>
          <label htmlFor="position-select" style={{ marginLeft: '15px' }}>Position:</label>
          <select id="position-select" value={config.scoreboard.position} onChange={(e) => handleSelectChange('scoreboard', 'position', e.target.value)}>
            <option value="top">Top</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom">Bottom</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="center">Center</option>
          </select>
          {config.scoreboard.type === 'vertical-table' && (
            <button onClick={handleToggleScoreboardHistory}>
              Toggle Scoreboard history (Current: {config.scoreboard.showHistory.toString()})
            </button>)}
          <button onClick={() => triggerMatchEvent('referee-call', { text: 'Fault', team: matchDetails.teams.teamA })}>
            Fault
          </button>
          <button onClick={() => triggerMatchEvent('timeout', { text: 'Timeout', team: matchDetails.teams.teamA })}>
            Timeout
          </button>
          <button onClick={() => triggerMatchEvent('substitution', { text: 'Subsitution', team: matchDetails.teams.teamA })}>
            Player Substitution
          </button>
          <button onClick={() => handleToggleComponent('matchup')}>
            Toggle Matchup ({config.matchup.enabled.toString()})
          </button>
          <button onClick={() => handleToggleComponent('lowerThird')}>
            Toggle LowerThird ({config.lowerThird.enabled.toString()})
          </button>
          <button onClick={() => handleToggleComponent('socialMedia')}>
            Toggle SocialMedia ({config.socialMedia.enabled.toString()})
          </button>
          <select id="socialmedia-position-select" value={config.socialMedia.position} onChange={(e) => handleSelectChange('socialMedia', 'position', e.target.value)}>
            <option value="top">Top</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom">Bottom</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="center">Center</option>
          </select>
          <button onClick={() => handleToggleComponent('teamComparison')}>
            Toggle TeamComparison ({config.teamComparison.enabled.toString()})
          </button>
          <button onClick={() => handleToggleComponent('afterMatch')}>
            Toggle AfterMatch ({config.afterMatch.enabled.toString()})
          </button>
          <button onClick={() => handleSelectChange('afterMatch', 'showStats', !config.afterMatch.showStats)}>
            Toggle AfterMatch stats ({config.afterMatch.showStats.toString()})
          </button>
          <button onClick={() => handleToggleComponent('sponsors')}>
            Toggle SponsorsPanel ({config.sponsors.enabled.toString()})
          </button>
        </div>
      )}
      <OverlayProvider width={1920} height={1080} connectionStatus={connectionStatus}>
        {connectionStatus === 'connecting' && <div className="connecting-animation">Conectando con el servidor de mensajería...</div>}
        {connectionStatus === 'handshake-pending' && <div className="connecting-animation">Conectado al servidor de mensajería. Comunicando con la aplicación de control...</div>}
        {connectionStatus === 'handshake-success' && <div className="success-message">Comunicación establecida!</div>}

        {matchData != null && (
          <>
            <Scoreboard matchDetails={matchDetails} matchData={matchData} scoreboardConfig={config.scoreboard} />
            <VerticalTableScoreboard matchDetails={matchDetails} matchData={matchData} scoreboardConfig={config.scoreboard} />
            <MatchupPresentation matchDetails={matchDetails} enabled={config.matchup.enabled} />
            <LowerThirdMatchup matchDetails={matchDetails} enabled={config.lowerThird.enabled} />
            <SocialMediaLowerThird socialMediaConfig={config.socialMedia} />
            <TeamComparisonTable matchDetails={matchDetails} enabled={config.teamComparison.enabled} />
            <AfterMatchStats matchDetails={matchDetails} matchData={matchData} afterMatchConfig={config.afterMatch} />
            <SponsorsPanel sponsorsConfig={config.sponsors} />
          </>
        )}
      </OverlayProvider>
    </>
  );
}

export default App;
