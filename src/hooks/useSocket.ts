import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { initialMatchDetails, initialMatchData, initialRuntimeConfig, initialOverlaySetup } from '../mockData';
import type { MatchDetails } from '../types/matchDetails';
import type { MatchData, MatchEvent } from '../types/matchData';
import type { OverlayConfig, RuntimeConfig, OverlaySetup } from '../types/config';
import { applyTheme } from '../theme/tokens';

function preloadOverlayImages(setup: OverlaySetup): void {
  setup.sponsors.imageUrls.forEach(url => { new Image().src = url; });
  setup.socialMedia.channels.forEach(ch => { if (ch.icon) new Image().src = ch.icon; });
}

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL as string;

function mergeConfig(runtime: RuntimeConfig, setup: OverlaySetup): OverlayConfig {
  return {
    ...runtime,
    socialMedia: { ...runtime.socialMedia, channels: setup.socialMedia.channels },
    sponsors: { ...runtime.sponsors, imageUrls: setup.sponsors.imageUrls, displayTime: setup.sponsors.displayTime },
    subscribe: { ...runtime.subscribe, ...setup.subscribe },
  };
}

export function useSocket() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig | null>(null);
  const [overlaySetup, setOverlaySetup] = useState<OverlaySetup | null>(null);
  const [matchEvent, setMatchEvent] = useState<MatchEvent | null>(null);
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
      setRuntimeConfig(initialRuntimeConfig);
      setOverlaySetup(initialOverlaySetup);
      if (initialOverlaySetup.theme) applyTheme(initialOverlaySetup.theme);
      preloadOverlayImages(initialOverlaySetup);
      return;
    }

    setConnectionStatus('connecting');
    const socket = io(SOCKET_SERVER_URL, { query: { key: extractedKey } });

    socket.on('connect', () => {
      console.log(`Socket.io connected — client id: ${socket.id}`);
      setConnectionStatus('handshake-pending');
      socket.emit('handshake', { message: 'Hello from OverlayApp!' });
    });

    socket.on('handshake-response', (data: { matchDetails: MatchDetails; matchData: MatchData; runtimeConfig: RuntimeConfig; overlaySetup: OverlaySetup }) => {
      if (statusRef.current !== 'handshake-pending') {
        console.warn('Ignored handshake-response: status is not handshake-pending');
        return;
      }
      console.log('Handshake response received:', data);
      setConnectionStatus('handshake-success');
      setTimeout(() => setConnectionStatus('handshake-success-displayed'), 5000);
      setMatchDetails(data.matchDetails);
      setMatchData(data.matchData);
      setRuntimeConfig(data.runtimeConfig);
      setOverlaySetup(data.overlaySetup);
      if (data.overlaySetup.theme) applyTheme(data.overlaySetup.theme);
      preloadOverlayImages(data.overlaySetup);
    });

    socket.on('matchDetails', (data: MatchDetails) => {
      console.log('matchDetails received:', JSON.stringify(data));
      setMatchDetails(data);
    });

    socket.on('matchData', (data: MatchData) => {
      console.log('matchData received:', JSON.stringify(data));
      setMatchData(data);
    });

    socket.on('updateConfig', (data: RuntimeConfig) => {
      console.log('updateConfig received:', JSON.stringify(data));
      setRuntimeConfig(data);
    });

    socket.on('overlaySetup', (data: OverlaySetup) => {
      console.log('overlaySetup received:', JSON.stringify(data));
      setOverlaySetup(data);
      if (data.theme) applyTheme(data.theme);
      preloadOverlayImages(data);
    });

    socket.on('matchEvent', (data: MatchEvent) => {
      console.log('matchEvent received:', JSON.stringify(data));
      setMatchEvent(data);
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

  const config: OverlayConfig | null = runtimeConfig && overlaySetup
    ? mergeConfig(runtimeConfig, overlaySetup)
    : null;

  return { matchDetails, matchData, config, matchEvent, setMatchEvent, setConfig: setRuntimeConfig, connectionStatus };
}
