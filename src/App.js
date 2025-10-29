// src/App.js
import React from 'react';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import MatchupPresentation from './MatchupPresentation'; // New import
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

  return (
    <div>
      <Scoreboard matchData={matchData} />
      <VerticalTableScoreboard matchData={matchData} />
      <MatchupPresentation matchData={matchData} />
      </div>
  );
}

export default App;
