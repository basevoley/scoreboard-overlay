// src/App.js
import React, { useState } from 'react';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import MatchupPresentation from './MatchupPresentation';
import LowerThirdMatchup from './LowerThirdMatchup';
import TeamComparisonTable from './TeamComparisonTable';
import AfterMatchStats from './AfterMatchStats';
import './App.css';

const initialMatchData = {
  teamA: {
    logo: 'https://www.todovoleibol.com/images/escudos/cv-alcala.jpg',
    name: 'CV Alcalá Glauka Viajes A',
    score: 21,
    sets: 2,
    setPoints: [
      { set: 1, points: 25 },
      { set: 2, points: 20 },
      { set: 3, points: 21 },
    ],
    isServing: true, // Team A is currently serving
    timeoutsUsed: 1, // Team A has used 1 timeout
    stats: {
      ranking: 2,
      matchesPlayed: 15,
      totalMatchesWon: 12,
      won3Points: 8,
      won2Points: 4,
      totalMatchesLost: 3,
      lost1Point: 2,
      lost0Points: 1,
      totalPointsScored: 345,
      totalPointsReceived: 298,
      // Post-match performance metrics
      servingAces: 5,
      servingFaults: 8,
      attacks: 80,
      attackKills: 45,
      blocks: 12,
      digs: 25,
    },
  },
  teamB: {
    logo: 'https://www.todovoleibol.com/images/escudos/cde-vb-villanueva-del-pardillo.jpg',
    name: 'CDE MANZANARES VOLEY A',
    score: 18,
    sets: 1,
    setPoints: [
      { set: 1, points: 23 },
      { set: 2, points: 25 },
      { set: 3, points: 18 },
    ],
    isServing: true, // Team B is not serving
    timeoutsUsed: 2, // Team B has used 2 timeouts
    stats: {
      ranking: 5,
      matchesPlayed: 15,
      totalMatchesWon: 10,
      won3Points: 7,
      won2Points: 3,
      totalMatchesLost: 5,
      lost1Point: 3,
      lost0Points: 2,
      totalPointsScored: 320,
      totalPointsReceived: 310,
      // Post-match performance metrics
      servingAces: 3,
      servingFaults: 6,
      attacks: 75,
      attackKills: 40,
      blocks: 15,
      digs: 22,
    },
  },
  competition: '1ª División Autonómica Preferente',
  competitionLogo: 'https://fmvoley.com/images/logo.svg', // Add this line
  category: 'Liga Regular - Jornada 15',
  location: 'Pabellón Demetrio Lozano, Alcalá de Henares',
  winner: 'teamA', //winner = finalScoreA > finalScoreB ? 'teamA' : 'teamB';
  matchEvent: {
    timestamp: Date.now(),
    type: null,
    details: null,
  },
};

const initialConfig = {
  scoreboard: {
    enabled: true,
    type: 'classic',
    position: 'top',
  },
  matchup: {
    enabled: false,
  },
  lowerThird: {
    enabled: false,
  },
  teamComparison: {
    enabled: false,
  },
  afterMatch: {
    enabled: false,
    showStats: false,
  },
};

function App() {
  const [matchData, setMatchData] = useState(initialMatchData);

  const [config, setConfig] = useState(initialConfig);

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

  const handleConfigUpdate = () => {
    // Example: Toggle the scoreboard enabled state
    setConfig(prevConfig => ({
      ...prevConfig,
      scoreboard: {
        ...prevConfig.scoreboard,
        enabled: !prevConfig.scoreboard.enabled,
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
  const handlePositionChange = (event) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      scoreboard: {
        ...prevConfig.scoreboard,
        position: event.target.value,
      },
    }));
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
    <div>
      <Scoreboard matchData={matchData} scoreboardConfig={config.scoreboard} />
      <VerticalTableScoreboard matchData={matchData} scoreboardConfig={config.scoreboard} />
        <MatchupPresentation matchData={matchData} enabled={config.matchup.enabled} />
        <LowerThirdMatchup matchData={matchData} enabled={config.lowerThird.enabled} />
        <TeamComparisonTable matchData={matchData} enabled={config.teamComparison.enabled} />
        <AfterMatchStats matchData={matchData} afterMatchConfig={config.afterMatch} />

      {/* Control buttons for demonstration */}
      <div className="controls">
        <button onClick={handleConfigUpdate}>
          Toggle Scoreboard Visibility (Enabled: {config.scoreboard.enabled.toString()})
        </button>
        <button onClick={handleToggleScoreboardType}>
          Switch Scoreboard Style (Current: {config.scoreboard.type})
        </button>
        <label htmlFor="position-select" style={{ marginLeft: '15px' }}>Position:</label>
        <select id="position-select" value={config.scoreboard.position} onChange={handlePositionChange}>
          <option value="top">Top</option>
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom">Bottom</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
        </select>
        <button onClick={() => triggerMatchEvent('referee-call', { text: 'Fault', team: 'Team A' })}>
          Fault
        </button>
        <button onClick={() => triggerMatchEvent('timeout', { text: 'Timeout', team: 'Team A' })}>
          Timeout
        </button>
        <button onClick={() => triggerMatchEvent('substitution', { player: 'Player 12', team: 'Team B' })}>
          Player Substitution
        </button>
        <button onClick={() => handleToggleComponent('matchup')}>
          Toggle Matchup ({config.matchup.enabled.toString()})
        </button>
        <button onClick={() => handleToggleComponent('lowerThird')}>
          Toggle LowerThird ({config.lowerThird.enabled.toString()})
        </button>
        <button onClick={() => handleToggleComponent('teamComparison')}>
          Toggle TeamComparison ({config.teamComparison.enabled.toString()})
        </button>
        <button onClick={() => handleToggleComponent('afterMatch')}>
          Toggle AfterMatch ({config.afterMatch.enabled.toString()})
        </button>
      </div>
    </div>
  );
}

export default App;
