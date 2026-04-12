// src/mockData.ts — default data used when no socket key is present (dev mode)
import type { MatchDetails } from './types/matchDetails';
import type { MatchData } from './types/matchData';
import type { OverlayConfig, RuntimeConfig, OverlaySetup } from './types/config';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL as string;

export const initialMatchDetails: MatchDetails = {
  teams: { teamA: 'Equipo Local Demo', teamB: 'Equipo Visitante Demo' },
  teamLogos: {
    teamA: 'logo192.png',
    teamB: 'logo.svg',
  },
  teamColors: {
    teamA: '#007BFF',
    teamB: '#FF5733',
  },
  matchHeader: 'CATEGORIA - Division',
  extendedInfo: 'Fase - Jornada X',
  stadium: 'Pabellón donde se juega, Ciudad',
  competitionLogo: 'sample_logo.jpg',
  maxSets: 5,
  stats: {
    teamA: {
      ranking: 0, competitionPoints: 0, matchesPlayed: 0, totalMatchesWon: 0, won3Points: 0,
      won2Points: 0, totalMatchesLost: 0, lost1Point: 0, lost0Points: 0,
      totalPointsScored: 0, totalPointsReceived: 0,
    },
    teamB: {
      ranking: 0, competitionPoints: 0, matchesPlayed: 0, totalMatchesWon: 0, won3Points: 0,
      won2Points: 0, totalMatchesLost: 0, lost1Point: 0, lost0Points: 0,
      totalPointsScored: 0, totalPointsReceived: 0,
    },
  },
  players: {
    teamA: [
      { number: 1, name: 'playerA1' }, { number: 2, name: 'playerA2' },
      { number: 3, name: 'playerA3' }, { number: 4, name: 'playerA4' },
      { number: 5, name: 'playerA5' }, { number: 6, name: 'playerA6' },
      { number: 1, name: 'playerA1' }, { number: 2, name: 'playerA2' },
      { number: 3, name: 'playerA3' }, { number: 4, name: 'playerA4' },
      { number: 5, name: 'playerA5' }, { number: 6, name: 'playerA6' },
    ],
    teamB: [
      { number: 1, name: 'playerB1' }, { number: 2, name: 'playerB2' },
      { number: 3, name: 'playerB3' }, { number: 4, name: 'playerB4' },
      { number: 5, name: 'playerB5' }, { number: 6, name: 'playerB6' },
      { number: 7, name: 'playerB1' }, { number: 2, name: 'playerB2' },
      { number: 3, name: 'playerB3' }, { number: 4, name: 'playerB4' },
      { number: 5, name: 'playerB5' }, { number: 6, name: 'playerB6' },
    ],
  },
};

export const initialMatchData: MatchData = {
  scores: { teamA: 0, teamB: 0 },
  setsWon: { teamA: 1, teamB: 1 },
  setScores: [{ teamA: 25, teamB: 23 }, { teamA: 23, teamB: 25 }],
  currentServer: null,
  ballPossession: null,
  matchStarted: false,
  timeouts: { teamA: 0, teamB: 0 },
  statistics: { teamA: {}, teamB: {} },
  currentSetStats: { teamA: {}, teamB: {} },
  winner: null,
};

export const initialRuntimeConfig: RuntimeConfig = {
  scoreboard: { enabled: false, showHistory: true, type: 'classic', position: 'top' },
  matchup: { enabled: false },
  lowerThird: { enabled: false },
  socialMedia: { enabled: false, position: 'top-left' },
  teamComparison: { enabled: false },
  afterMatch: { enabled: false, showStats: true },
  sponsors: { enabled: false },
  subscribe: { enabled: false, position: 'center' },
  lineup: { enabled: false, showStats: true },
};

export const initialOverlaySetup: OverlaySetup = {
  socialMedia: {
    channels: [
      { network: 'YouTube',   handle: 'YourChannelName',        icon: `${SOCKET_SERVER_URL}/images/networks/Youtube_logo.png` },
      { network: 'TikTok',    handle: 'YourTikTokHandle',       icon: `${SOCKET_SERVER_URL}/images/networks/tiktok-logo.png` },
      { network: 'Instagram', handle: 'YourInstagram',          icon: `${SOCKET_SERVER_URL}/images/networks/Instagram-Gradient-Logo.png` },
      { network: 'Twitch',    handle: 'YourTwitchChannel',      icon: `${SOCKET_SERVER_URL}/images/networks/twitch-logo.png` },
      { network: 'Facebook',  handle: 'YourFacebook',           icon: `${SOCKET_SERVER_URL}/images/networks/Facebook_Logo.png` },
      { network: 'Web',       handle: 'http://yourwebsite.com', icon: `${SOCKET_SERVER_URL}/images/networks/web.png` },
    ],
  },
  sponsors: {
    imageUrls: ['sponsors-1.png', 'sponsors-2.png', 'sponsors-3.png'],
    displayTime: 4000,
  },
  subscribe: {
    logoUrl: 'cv_alcala.jpg',
    callToActionText: 'SUSCRÍBETE',
    buttonColor: '#ff0000',
  },
  theme: {},
};

// Merged convenience export for dev mode (no socket key).
export const initialConfig: OverlayConfig = {
  ...initialRuntimeConfig,
  socialMedia: { ...initialRuntimeConfig.socialMedia, ...initialOverlaySetup.socialMedia },
  sponsors: { ...initialRuntimeConfig.sponsors, ...initialOverlaySetup.sponsors },
  subscribe: { ...initialRuntimeConfig.subscribe, ...initialOverlaySetup.subscribe },
};
