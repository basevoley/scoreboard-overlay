export interface ScoreboardConfig {
  enabled: boolean;
  showHistory: boolean;
  type: 'classic' | 'vertical-table';
  position: string;
}

export interface SocialChannel {
  network: string;
  handle: string;
  icon: string;
}

export interface SocialMediaConfig {
  enabled: boolean;
  position: string;
  channels: SocialChannel[];
}

export interface AfterMatchConfig {
  enabled: boolean;
  showStats: boolean;
}

export interface SponsorsConfig {
  enabled: boolean;
  imageUrls: string[];
  displayTime: number;
}

export interface SubscribeConfig {
  enabled: boolean;
  position: string;
}

export interface LineupConfig {
  enabled: boolean;
  showStats: boolean;
}

export interface OverlayConfig {
  scoreboard: ScoreboardConfig;
  matchup: { enabled: boolean };
  lowerThird: { enabled: boolean };
  socialMedia: SocialMediaConfig;
  teamComparison: { enabled: boolean };
  afterMatch: AfterMatchConfig;
  sponsors: SponsorsConfig;
  subscribe: SubscribeConfig;
  lineup: LineupConfig;
}
