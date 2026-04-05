import React from 'react';
import Scoreboard from './Scoreboard';
import VerticalTableScoreboard from './VerticalTableScoreboard';
import useDropline from '../../hooks/useDropline';
import type { MatchDetails } from '../../types/matchDetails';
import type { MatchData } from '../../types/matchData';
import type { ScoreboardConfig } from '../../types/config';

interface ScoreboardRouterProps {
  matchDetails: MatchDetails;
  matchData: MatchData;
  scoreboardConfig: ScoreboardConfig;
}

// Single entry point for both scoreboard variants.
// Owns the single useDropline instance so only one timer runs regardless of which variant is active.
// Both variants stay in the DOM for smooth fade transitions when switching type.
const ScoreboardRouter = ({ matchDetails, matchData, scoreboardConfig }: ScoreboardRouterProps) => {
  const { panelData, shouldAnimate } = useDropline(matchData.matchEvent);

  const sharedProps = { matchDetails, matchData, scoreboardConfig, panelData, shouldAnimate };

  return (
    <>
      <Scoreboard
        {...sharedProps}
        enabled={scoreboardConfig.enabled && scoreboardConfig.type === 'classic'}
      />
      <VerticalTableScoreboard
        {...sharedProps}
        enabled={scoreboardConfig.enabled && scoreboardConfig.type === 'vertical-table'}
      />
    </>
  );
};

export default ScoreboardRouter;
