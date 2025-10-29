// src/App.js
import React from 'react';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import MatchupPresentation from './MatchupPresentation';
import LowerThirdMatchup from './LowerThirdMatchup';
import './App.css';

// Placeholder images for demonstration
// import teamALogo from 'https://www.todovoleibol.com/images/escudos/cv-alcala.jpg'; 
// import teamBLogo from 'https://www.todovoleibol.com/images/escudos/cde-manzanares-voley.jpg';

function App() {
  const matchData = {
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
    },
    competition: '1ª División Autonómica Preferente',
    competitionLogo: 'https://fmvoley.com/images/logo.svg', // Add this line
    category: 'Liga Regular - Jornada 15',
    location: 'Pabellón Demetrio Lozano, Alcalá de Henares',
  };
    const scoreboardConfig = {
    position: 'bottom-right' // 'top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'
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
      </div>
  );
}

export default App;
