import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { initialMatchDetails, initialMatchData, initialConfig } from '../mockData';
import type { MatchDetails } from '../types/matchDetails';
import type { MatchData } from '../types/matchData';
import type { OverlayConfig } from '../types/config';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL as string;

export function useSocket() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const statusRef = useRef('disconnected');

  useEffect(() => {
    statusRef.current = connectionStatus;
  }, [connectionStatus]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const extractedKey = urlParams.get('key');

    if (!extractedKey) {
      console.error('No key found in URL — using mock data');
      setConnectionStatus('no-connection');
      setMatchDetails(initialMatchDetails);
      setMatchData(initialMatchData);
      setConfig(initialConfig);
      return;
    }

    setConnectionStatus('connecting');
    const socket = io(SOCKET_SERVER_URL, { query: { key: extractedKey } });

    socket.on('connect', () => {
      console.log(`Socket.io connected — client id: ${socket.id}`);
      setConnectionStatus('handshake-pending');
      socket.emit('handshake', { message: 'Hello from OverlayApp!' });
    });

    socket.on('handshake-response', (data: { matchDetails: MatchDetails; matchData: MatchData; config: OverlayConfig }) => {
      if (statusRef.current !== 'handshake-pending') {
        console.warn('Ignored handshake-response: status is not handshake-pending');
        return;
      }
      console.log('Handshake response received:', data);
      setConnectionStatus('handshake-success');
      setTimeout(() => setConnectionStatus('handshake-success-displayed'), 5000);
      setMatchDetails(data.matchDetails);
      setMatchData(data.matchData);
      setConfig(data.config);
    });

    socket.on('matchDetails', (data: MatchDetails) => {
      console.log('matchDetails received:', JSON.stringify(data));
      setMatchDetails(data);
    });

    socket.on('matchData', (data: MatchData) => {
      console.log('matchData received:', JSON.stringify(data));
      setMatchData(data);
    });

    socket.on('updateConfig', (data: OverlayConfig) => {
      console.log('updateConfig received:', JSON.stringify(data));
      setConfig(data);
    });

    socket.on('reload', () => {
      console.log('Reload received!');
      window.location.reload();
    });

    socket.on('message', (data: unknown) => console.log('Message received:', data));
    socket.on('disconnect', () => console.log('Socket.io disconnected'));
    socket.on('error', (error: unknown) => console.error('Socket.io error:', error));

    return () => { socket.disconnect(); };
  }, []);

  return { matchDetails, matchData, config, setMatchData, setConfig, connectionStatus };
}
