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
  logoUrl: string;
  callToActionText: string;
  buttonColor: string;
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

// RuntimeConfig — live operator toggles sent on every change via updateConfig.
// Same sections as OverlayConfig but without the static broadcaster identity fields.
export interface RuntimeConfig {
  scoreboard: ScoreboardConfig;
  matchup: { enabled: boolean };
  lowerThird: { enabled: boolean };
  socialMedia: { enabled: boolean; position: string };
  teamComparison: { enabled: boolean };
  afterMatch: AfterMatchConfig;
  sponsors: { enabled: boolean };
  subscribe: { enabled: boolean; position: string };
  lineup: LineupConfig;
}

// ThemeTokens — operator-customisable appearance tokens sent via overlaySetup.
export interface ThemeColors {
  background?: string;  // panel background        default: #34495e
  text?: string;        // primary text             default: #ecf0f1
  secondary?: string;   // secondary/muted text     default: #bdc3c7
  primary?: string;     // accent (borders, scores) default: #3498db
  accent?: string;      // highlight (names, sets)  default: #f1c40f
  serving?: string;     // serving indicator        default: #2ecc71
}

export interface ThemeTokens {
  colors?: ThemeColors;
  font?: string;      // CSS font-family string   default: Arial, sans-serif
  radius?: string;    // base border-radius        default: 8px
  animation?: string; // base transition duration  default: 0.5s
}

// OverlaySetup — static broadcaster identity sent once at handshake and on explicit save.
export interface OverlaySetup {
  socialMedia: { channels: SocialChannel[] };
  sponsors: { imageUrls: string[]; displayTime: number };
  subscribe: { logoUrl: string; callToActionText: string; buttonColor: string };
  theme: ThemeTokens;
}
