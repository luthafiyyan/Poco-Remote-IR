export type DeviceCategory = 'tv' | 'monitor';

export type IrProtocolType = 'nec' | 'samsung_nec' | 'sony_sirc' | 'panasonic_kaseikyo';

export interface IrCommand {
  id: string;
  name: string;
  hex: string;
  category: 'power' | 'nav' | 'media' | 'volume' | 'channel' | 'numpad' | 'system' | 'color' | 'app';
  description?: string;
  raw?: string;
}

// Backward compatibility alias
export type SamsungCommand = IrCommand;

export interface BrandProfile {
  id: string;
  name: string;
  shortName: string;
  category: DeviceCategory;
  modelExamples: string;
  protocol: IrProtocolType;
  frequency: number; // e.g. 38000, 40000, 36700
  commands: Record<string, IrCommand>;
  badgeColor?: string;
  popularInIndonesia?: boolean;
  notes?: string;
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
  brandName: string;
  protocolName: string;
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
  activeBrandId: string;
  searchQuery: string;
  cursorRow: number;
  cursorCol: number;
}

export type KeyboardLayoutId = 'youtube_grid' | 'browser_qwerty' | 'alphabetical_grid';

export interface KeyboardLayoutDef {
  id: KeyboardLayoutId;
  name: string;
  description: string;
  grid: string[][];
  spacePos: { row: number; col: number };
  backspacePos: { row: number; col: number };
  enterPos: { row: number; col: number };
}

export interface AutoTypeStep {
  char: string;
  moves: ('up' | 'down' | 'left' | 'right' | 'ok')[];
  from: { row: number; col: number };
  to: { row: number; col: number };
}
