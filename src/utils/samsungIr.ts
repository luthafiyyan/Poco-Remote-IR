import { IrPulseAnalysis, SamsungCommand } from '../types/ir';

export const SAMSUNG_COMMANDS: Record<string, SamsungCommand> = {
  power: { id: 'power', name: 'Power', hex: '0xE0E040BF', category: 'power', description: 'Power Toggle (On/Off)' },
  source: { id: 'source', name: 'Source', hex: '0xE0E0807F', category: 'system', description: 'Input Source Toggle' },
  volUp: { id: 'volUp', name: 'Volume +', hex: '0xE0E0E01F', category: 'volume', description: 'Increase Audio Volume' },
  volDown: { id: 'volDown', name: 'Volume -', hex: '0xE0E0D02F', category: 'volume', description: 'Decrease Audio Volume' },
  mute: { id: 'mute', name: 'Mute', hex: '0xE0E0F00F', category: 'volume', description: 'Toggle Sound Mute' },
  chUp: { id: 'chUp', name: 'Channel +', hex: '0xE0E048B7', category: 'channel', description: 'Next Channel' },
  chDown: { id: 'chDown', name: 'Channel -', hex: '0xE0E008F7', category: 'channel', description: 'Previous Channel' },
  up: { id: 'up', name: 'Up', hex: '0xE0E006F9', category: 'nav', description: 'Navigate Up' },
  down: { id: 'down', name: 'Down', hex: '0xE0E08679', category: 'nav', description: 'Navigate Down' },
  left: { id: 'left', name: 'Left', hex: '0xE0E0A659', category: 'nav', description: 'Navigate Left' },
  right: { id: 'right', name: 'Right', hex: '0xE0E046B9', category: 'nav', description: 'Navigate Right' },
  ok: { id: 'ok', name: 'OK / Enter', hex: '0xE0E016E9', category: 'nav', description: 'Select / Confirm Action' },
  back: { id: 'back', name: 'Back / Return', hex: '0xE0E01AE5', category: 'nav', description: 'Return to Previous Screen' },
  home: { id: 'home', name: 'Home (Smart Hub)', hex: '0xE0E09E61', category: 'system', description: 'Open Tizen Smart Hub' },
  menu: { id: 'menu', name: 'Menu / Settings', hex: '0xE0E058A7', category: 'system', description: 'TV Settings Menu' },
  exit: { id: 'exit', name: 'Exit', hex: '0xE0E0B44B', category: 'nav', description: 'Exit Current Menu' },
  play: { id: 'play', name: 'Play', hex: '0xE0E0E21D', category: 'media', description: 'Play Video' },
  pause: { id: 'pause', name: 'Pause', hex: '0xE0E052AD', category: 'media', description: 'Pause Video' },
  stop: { id: 'stop', name: 'Stop', hex: '0xE0E0629D', category: 'media', description: 'Stop Video' },
  rewind: { id: 'rewind', name: 'Rewind', hex: '0xE0E0A25D', category: 'media', description: 'Rewind Video' },
  fastForward: { id: 'fastForward', name: 'Fast Forward', hex: '0xE0E012ED', category: 'media', description: 'Fast Forward Video' },
  num1: { id: 'num1', name: 'Digit 1', hex: '0xE0E020DF', category: 'numpad', description: 'Digit 1' },
  num2: { id: 'num2', name: 'Digit 2', hex: '0xE0E0A05F', category: 'numpad', description: 'Digit 2' },
  num3: { id: 'num3', name: 'Digit 3', hex: '0xE0E0609F', category: 'numpad', description: 'Digit 3' },
  num4: { id: 'num4', name: 'Digit 4', hex: '0xE0E010EF', category: 'numpad', description: 'Digit 4' },
  num5: { id: 'num5', name: 'Digit 5', hex: '0xE0E0906F', category: 'numpad', description: 'Digit 5' },
  num6: { id: 'num6', name: 'Digit 6', hex: '0xE0E050AF', category: 'numpad', description: 'Digit 6' },
  num7: { id: 'num7', name: 'Digit 7', hex: '0xE0E030CF', category: 'numpad', description: 'Digit 7' },
  num8: { id: 'num8', name: 'Digit 8', hex: '0xE0E0B04F', category: 'numpad', description: 'Digit 8' },
  num9: { id: 'num9', name: 'Digit 9', hex: '0xE0E0708F', category: 'numpad', description: 'Digit 9' },
  num0: { id: 'num0', name: 'Digit 0', hex: '0xE0E08877', category: 'numpad', description: 'Digit 0' },
};

export const IR_CARRIER_FREQ = 38000; // 38kHz

/**
 * Mengonversi kode HEX Samsung 32-bit menjadi string durasi mikrodetik NECx2.
 * Mengikuti spesifikasi:
 * - Header Mark: 4500 us, Header Space: 4500 us
 * - Bit Mark: 560 us
 * - Bit '1' Space: 1690 us
 * - Bit '0' Space: 560 us
 * - Stop Bit: 560 us
 */
export function hexToSamsungRaw(hexCode: string | number): string {
  let numVal: number;
  if (typeof hexCode === 'string') {
    numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
  } else {
    numVal = Number(hexCode);
  }

  const HDR_MARK = 4500;
  const HDR_SPACE = 4500;
  const BIT_MARK = 560;
  const BIT_ONE_SPACE = 1690;
  const BIT_ZERO_SPACE = 560;
  const STOP_BIT = 560;

  const pattern: number[] = [HDR_MARK, HDR_SPACE];

  for (let i = 31; i >= 0; i--) {
    const bit = (numVal >>> i) & 1;
    pattern.push(BIT_MARK);
    pattern.push(bit === 1 ? BIT_ONE_SPACE : BIT_ZERO_SPACE);
  }

  pattern.push(STOP_BIT);
  return pattern.join(',');
}

/**
 * Menganalisis pulsa dan membedah struktur protokol Samsung NECx2
 */
export function analyzeSamsungNec(hexCode: string | number, buttonName: string = 'Command'): IrPulseAnalysis {
  let numVal: number;
  if (typeof hexCode === 'string') {
    numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
  } else {
    numVal = Number(hexCode);
  }

  const rawCommaString = hexToSamsungRaw(hexCode);
  const pulses = rawCommaString.split(',').map(Number);
  const totalDurationUs = pulses.reduce((acc, curr) => acc + curr, 0);

  const hexString = '0x' + (numVal >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const binaryString = (numVal >>> 0).toString(2).padStart(32, '0');

  const byte0 = (numVal >>> 24) & 0xff;
  const byte1 = (numVal >>> 16) & 0xff;
  const byte2 = (numVal >>> 8) & 0xff;
  const byte3 = numVal & 0xff;

  const vendorCode = `0x${byte0.toString(16).toUpperCase().padStart(2, '0')}${byte1.toString(16).toUpperCase().padStart(2, '0')}`;
  const commandCode = `0x${byte2.toString(16).toUpperCase().padStart(2, '0')}`;
  const invertedCode = `0x${byte3.toString(16).toUpperCase().padStart(2, '0')}`;
  const isValidChecksum = (byte2 ^ byte3) === 0xff;

  const now = new Date();
  const timestamp = now.toLocaleTimeString('id-ID', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

  return {
    hex: typeof hexCode === 'string' ? hexCode : hexString,
    normalizedHex: hexString,
    binary: binaryString,
    vendorCode,
    commandCode,
    invertedCode,
    isValidChecksum,
    frequency: IR_CARRIER_FREQ,
    pulseCount: pulses.length,
    totalDurationMs: Math.round((totalDurationUs / 1000) * 10) / 10,
    pulses,
    rawCommaString,
    timestamp,
    buttonName,
  };
}

// Web Audio tactile click feedback synthesizer
let audioCtx: AudioContext | null = null;

export function playTactileClick(type: 'click' | 'power' | 'nav' = 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'power') {
      // Deeper double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'nav') {
      // Crisp subtle pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Standard mechanical tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // AudioContext might be blocked or unavailable, ignore silently
  }
}
