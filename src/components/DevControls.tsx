import React from 'react';
import type { MatchDetails } from '../types/matchDetails';
import type { MatchEvent } from '../types/matchData';
import type { OverlayConfig } from '../types/config';

const POSITIONS = ['top', 'top-left', 'top-right', 'bottom', 'bottom-right', 'bottom-left', 'center'];

interface DevControlsProps {
  matchDetails: MatchDetails;
  config: OverlayConfig;
  setMatchEvent: React.Dispatch<React.SetStateAction<MatchEvent | null>>;
  setConfig: React.Dispatch<React.SetStateAction<OverlayConfig | null>>;
}

const DevControls = ({ matchDetails, config, setMatchEvent, setConfig }: DevControlsProps) => {
  const triggerMatchEvent = (eventType: string, eventDetails: { text: string; team: string }) => {
    setMatchEvent({ timestamp: Date.now(), type: eventType, details: eventDetails });
  };

  const toggleComponent = (key: keyof OverlayConfig) => {
    setConfig((prev) => prev ? ({
      ...prev,
      [key]: { ...(prev[key] as object), enabled: !(prev[key] as { enabled: boolean }).enabled },
    }) : prev);
  };

  const setSection = <S extends keyof OverlayConfig, K extends keyof OverlayConfig[S]>(
    section: S,
    key: K,
    value: OverlayConfig[S][K],
  ) => {
    setConfig((prev) => prev ? ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }) : prev);
  };

  const PositionSelect = ({ id, section }: { id: string; section: keyof OverlayConfig }) => (
    <select
      id={id}
      value={(config[section] as { position: string }).position}
      onChange={(e) => setSection(section, 'position' as keyof OverlayConfig[typeof section], e.target.value as OverlayConfig[typeof section][keyof OverlayConfig[typeof section]])}
    >
      {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  );

  return (
    <div className="controls">
      <button onClick={() => toggleComponent('scoreboard')}>
        Toggle Scoreboard (Enabled: {config.scoreboard.enabled.toString()})
      </button>
      <button onClick={() => setSection('scoreboard', 'type', config.scoreboard.type === 'classic' ? 'vertical-table' : 'classic')}>
        Switch Scoreboard Style (Current: {config.scoreboard.type})
      </button>
      <label htmlFor="position-select" style={{ marginLeft: '15px' }}>Position:</label>
      <PositionSelect id="position-select" section="scoreboard" />
      {config.scoreboard.type === 'vertical-table' && (
        <button onClick={() => setSection('scoreboard', 'showHistory', !config.scoreboard.showHistory)}>
          Toggle History (Current: {config.scoreboard.showHistory.toString()})
        </button>
      )}
      <button onClick={() => triggerMatchEvent('referee-call', { text: 'Fault', team: matchDetails.teams.teamA })}>
        Fault
      </button>
      <button onClick={() => triggerMatchEvent('timeout', { text: 'Timeout', team: matchDetails.teams.teamA })}>
        Timeout
      </button>
      <button onClick={() => triggerMatchEvent('substitution', { text: 'Substitution', team: matchDetails.teams.teamA })}>
        Player Substitution
      </button>
      <button onClick={() => toggleComponent('matchup')}>
        Toggle Matchup ({config.matchup.enabled.toString()})
      </button>
      <button onClick={() => toggleComponent('lowerThird')}>
        Toggle LowerThird ({config.lowerThird.enabled.toString()})
      </button>
      <button onClick={() => toggleComponent('socialMedia')}>
        Toggle SocialMedia ({config.socialMedia.enabled.toString()})
      </button>
      <PositionSelect id="socialmedia-position-select" section="socialMedia" />
      <button onClick={() => toggleComponent('teamComparison')}>
        Toggle TeamComparison ({config.teamComparison.enabled.toString()})
      </button>
      <button onClick={() => toggleComponent('afterMatch')}>
        Toggle AfterMatch ({config.afterMatch.enabled.toString()})
      </button>
      <button onClick={() => setSection('afterMatch', 'showStats', !config.afterMatch.showStats)}>
        Toggle AfterMatch stats ({config.afterMatch.showStats.toString()})
      </button>
      <button onClick={() => toggleComponent('sponsors')}>
        Toggle SponsorsPanel ({config.sponsors.enabled.toString()})
      </button>
      <button onClick={() => toggleComponent('subscribe')}>
        Toggle Subscribe ({config.subscribe.enabled.toString()})
      </button>
      <PositionSelect id="subscribe-position-select" section="subscribe" />
      <button onClick={() => toggleComponent('lineup')}>
        Toggle Lineup ({config.lineup.enabled.toString()})
      </button>
      <button onClick={() => setSection('lineup', 'showStats', !config.lineup.showStats)}>
        Toggle Lineup stats ({config.lineup.showStats.toString()})
      </button>
    </div>
  );
};

export default DevControls;
