export enum MarketType {
  FUTURES = 'FUTURES',
  SPOT = 'SPOT',
  OPTIONS = 'OPTIONS',
}

export enum TimeFrame {
  SCALPING = 'SCALPING', // 1m - 15m
  INTRADAY = 'INTRADAY', // 1h - 4h
  SWING = 'SWING',       // 1d - 1w
  LONG_TERM = 'LONG_TERM' // 1M+
}

export enum RiskProfile {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE',
}

export enum AnalysisMode {
  SPECIFIC = 'SPECIFIC', // Analyze a specific ticker
  DISCOVERY = 'DISCOVERY' // Find best opportunities
}

export enum MarketSegment {
  ALL = 'ALL_MARKET',
  TOP_25 = 'TOP_25_CAP',
  DEFI = 'DEFI_SECTOR',
  AI = 'AI_NARRATIVE',
  MEME = 'MEME_COINS',
  L1_L2 = 'LAYER1_LAYER2'
}

export interface PromptConfig {
  mode: AnalysisMode;
  coin: string;
  segment: MarketSegment;
  marketType: MarketType;
  timeFrame: TimeFrame;
  riskProfile: RiskProfile;
  indicators: string[];
  exchanges: string[];
  includeFundamental: boolean;
  includeSentiment: boolean;
  chartImage?: string | null; // Base64 string of the uploaded chart
}

export interface GeneratedResult {
  prompt: string;
  analysis?: string;
  groundingSources?: Array<{ uri: string; title: string }>;
}