export interface SamsungCommand {
  id: string;
  name: string;
  hex: string;
  category: 'power' | 'nav' | 'media' | 'volume' | 'channel' | 'numpad' | 'system';
  description?: string;
}

export interface IrPulseAnalysis {
  hex: string;
  normalizedHex: string;
  binary: string;
  vendorCode: string;
  commandCode: string;
  invertedCode: string;
  isValidChecksum: boolean;
  frequency: number;
  pulseCount: number;
  totalDurationMs: number;
  pulses: number[];
  rawCommaString: string;
  timestamp: string;
  buttonName: string;
}

export interface TvState {
  isPowered: boolean;
  volume: number;
  isMuted: boolean;
  channel: number;
  source: string;
  isSmartHubOpen: boolean;
  isMenuOpen: boolean;
  selectedAppIndex: number;
  notification: string | null;
}
