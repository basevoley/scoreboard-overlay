import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { MatchDetails } from '../types/matchDetails';
import type { MatchData } from '../types/matchData';
import type { OverlaySetup } from '../types/config';
import { applyTheme } from '../theme/tokens';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL as string;

export type SpectatorStatus =
  | 'no-key'
  | 'connecting'
  | 'handshake-pending'
  | 'connected'
  | 'disconnected';

export function useSpectatorSocket() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [status, setStatus] = useState<SpectatorStatus>('connecting');
  const statusRef = useRef<SpectatorStatus>('connecting');

  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('key');
    if (!key) { setStatus('no-key'); return; }

    const socket = io(SOCKET_SERVER_URL, { query: { key } });

    socket.on('connect', () => {
      setStatus('handshake-pending');
      socket.emit('handshake', { message: 'Hello from SpectatorApp!' });
    });

    socket.on('handshake-response', (data: {
      matchDetails: MatchDetails;
      matchData: MatchData;
      overlaySetup?: OverlaySetup;
    }) => {
      if (statusRef.current !== 'handshake-pending') return;
      setMatchDetails(data.matchDetails);
      setMatchData(data.matchData);
      if (data.overlaySetup?.theme) applyTheme(data.overlaySetup.theme);
      setStatus('connected');
    });

    socket.on('matchDetails', (data: MatchDetails) => setMatchDetails(data));
    socket.on('matchData', (data: MatchData) => setMatchData(data));
    socket.on('overlaySetup', (data: OverlaySetup) => {
      if (data.theme) applyTheme(data.theme);
    });

    socket.on('disconnect', () => setStatus('disconnected'));

    return () => { socket.disconnect(); };
  }, []);

  return { matchDetails, matchData, status };
}
