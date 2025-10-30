// src/App.js
import React from 'react';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import MatchupPresentation from './MatchupPresentation';
import LowerThirdMatchup from './LowerThirdMatchup';
import TeamComparisonTable from './TeamComparisonTable';
import AfterMatchStats from './AfterMatchStats';
import './App.css';

// Placeholder images for demonstration
// import teamALogo from 'https://www.todovoleibol.com/images/escudos/cv-alcala.jpg'; 
// import teamBLogo from 'https://www.todovoleibol.com/images/escudos/cde-manzanares-voley.jpg';

function App() {
  const finalScoreA = 2; // Team A sets won
  const finalScoreB = 1; // Team B sets won

  const winner = finalScoreA > finalScoreB ? 'teamA' : 'teamB';

  const matchData = {
    teamA: {
      logo: 'https://www.todovoleibol.com/images/escudos/cv-alcala.jpg',
      name: 'CV Alcalá Glauka Viajes A',
      score: 21,
      sets: finalScoreA,
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
      sets: finalScoreB,
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
    winner: winner, // Add the winner info
  };
    const scoreboardConfig = {
    position: 'top' // 'top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'
  };
    const verticalConfig = {
    position: 'top-left' // Example position for the vertical scoreboard
  };
  // const [panelData, setPanelData] = useState(null);

  // const handleAction = (icon, textLine1, textLine2) => {
  //   setPanelData({ icon, textLine1, textLine2 });
  //   setTimeout(() => setPanelData(null), 5000);
  // };
  
  return (
    <div>
      <Scoreboard 
        matchData={matchData}
        scoreboardConfig={scoreboardConfig} // Pass the config as a prop
        // onShowDropline={handleAction} 
        />
      <VerticalTableScoreboard matchData={matchData} scoreboardConfig={verticalConfig} />
      <MatchupPresentation matchData={matchData} />
      <LowerThirdMatchup matchData={matchData} />
      <TeamComparisonTable matchData={matchData} />
      <AfterMatchStats matchData={matchData} />
      </div>
  );
}

export default App;
