import { BrandProfile, IrCommand, IrPulseAnalysis } from '../types/ir';

/**
 * Standard NEC Protocol 32-bit (digunakan oleh Toshiba, LG, Xiaomi, TCL, Polytron, Sharp, Hisense, Coocaa, ASUS, HP, Lenovo):
 * - Header Mark: 9000 us, Header Space: 4500 us
 * - 4 Bytes: [Address, Inverted_Address, Command, Inverted_Command]
 * - SETIAP BYTE DITRANSMISIKAN LSB FIRST (Bit 0 s/d Bit 7) sesuai spesifikasi resmi NEC / Renesas
 * - Bit Mark: 560 us
 * - Bit '1' Space: 1690 us
 * - Bit '0' Space: 560 us
 * - Stop Bit: 560 us
 */
export function hexToStandardNecRaw(hexCode: string | number): string {
  let numVal: number;
  if (typeof hexCode === 'string') {
    numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
  } else {
    numVal = Number(hexCode);
  }

  const HDR_MARK = 9000;
  const HDR_SPACE = 4500;
  const BIT_MARK = 560;
  const BIT_ONE_SPACE = 1690;
  const BIT_ZERO_SPACE = 560;
  const STOP_BIT = 560;

  const pattern: number[] = [HDR_MARK, HDR_SPACE];

  // 4 bytes: [Byte 0 (MSB of 32-bit), Byte 1, Byte 2, Byte 3 (LSB of 32-bit)]
  // Setiap byte dikirimkan LSB-first (bit 0 lebih dulu) ke IR diode
  for (let byteIdx = 0; byteIdx < 4; byteIdx++) {
    const shift = (3 - byteIdx) * 8;
    const byteVal = (numVal >>> shift) & 0xff;
    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const bit = (byteVal >>> bitIdx) & 1;
      pattern.push(BIT_MARK);
      pattern.push(bit === 1 ? BIT_ONE_SPACE : BIT_ZERO_SPACE);
    }
  }

  pattern.push(STOP_BIT);
  return pattern.join(',');
}

/**
 * Samsung NEC Protocol 32-bit (digunakan Samsung TV & Smart Monitor):
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

  for (let byteIdx = 0; byteIdx < 4; byteIdx++) {
    const shift = (3 - byteIdx) * 8;
    const byteVal = (numVal >>> shift) & 0xff;
    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const bit = (byteVal >>> bitIdx) & 1;
      pattern.push(BIT_MARK);
      pattern.push(bit === 1 ? BIT_ONE_SPACE : BIT_ZERO_SPACE);
    }
  }

  pattern.push(STOP_BIT);
  return pattern.join(',');
}

/**
 * Sony SIRC Protocol (12-bit & 15-bit, Carrier 40 kHz):
 * - Header Mark: 2400 us, Space: 600 us
 * - Bit '1': Mark 1200 us, Space 600 us
 * - Bit '0': Mark 600 us, Space 600 us
 * - Ditransmisikan LSB first
 */
export function hexToSonySircRaw(hexCode: string | number, bits: number = 12): string {
  let numVal: number;
  if (typeof hexCode === 'string') {
    numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
  } else {
    numVal = Number(hexCode);
  }

  const HDR_MARK = 2400;
  const SPACE = 600;
  const ONE_MARK = 1200;
  const ZERO_MARK = 600;

  const pattern: number[] = [HDR_MARK, SPACE];

  // SIRC mengirimkan LSB first
  for (let i = 0; i < bits; i++) {
    const bit = (numVal >>> i) & 1;
    pattern.push(bit === 1 ? ONE_MARK : ZERO_MARK);
    if (i < bits - 1) {
      pattern.push(SPACE);
    }
  }

  return pattern.join(',');
}

/**
 * Panasonic / Kaseikyo 48-bit (Carrier 37 kHz):
 * - Header Mark: 3500 us, Space: 1750 us
 * - Bit '1': Mark 430 us, Space 1300 us
 * - Bit '0': Mark 430 us, Space 430 us
 * - Stop bit: Mark 430 us
 */
export function hexToPanasonicRaw(hexCode: string | number): string {
  const hexStr = (typeof hexCode === 'string' ? hexCode.replace(/^0x/i, '') : hexCode.toString(16)).padStart(12, '0');
  
  const HDR_MARK = 3500;
  const HDR_SPACE = 1750;
  const BIT_MARK = 430;
  const ONE_SPACE = 1300;
  const ZERO_SPACE = 430;
  const STOP_BIT = 430;

  const pattern: number[] = [HDR_MARK, HDR_SPACE];

  for (let i = 0; i < 12; i += 2) {
    const byteVal = parseInt(hexStr.substr(i, 2), 16) || 0;
    for (let b = 0; b < 8; b++) {
      const bit = (byteVal >>> b) & 1;
      pattern.push(BIT_MARK);
      pattern.push(bit === 1 ? ONE_SPACE : ZERO_SPACE);
    }
  }

  pattern.push(STOP_BIT);
  return pattern.join(',');
}

/**
 * Universal Generator: Menghasilkan pola pulsa mikrodetik dan carrier frequency
 * yang sesuai dengan brand dan protokol perangkat.
 */
export function generateRawIrPattern(brand: BrandProfile, command: IrCommand): {
  rawPattern: string;
  frequency: number;
  pulseCount: number;
} {
  if (command.raw) {
    const pulses = command.raw.split(',').length;
    return {
      rawPattern: command.raw,
      frequency: brand.frequency,
      pulseCount: pulses,
    };
  }

  let patternStr: string;

  switch (brand.protocol) {
    case 'samsung_nec':
      patternStr = hexToSamsungRaw(command.hex);
      break;
    case 'sony_sirc': {
      const hexClean = command.hex.replace(/^0x/i, '');
      const bitCount = hexClean.length > 3 ? 15 : 12;
      patternStr = hexToSonySircRaw(command.hex, bitCount);
      break;
    }
    case 'panasonic_kaseikyo':
      patternStr = hexToPanasonicRaw(command.hex);
      break;
    case 'nec':
    default:
      patternStr = hexToStandardNecRaw(command.hex);
      break;
  }

  const pulseCount = patternStr.split(',').length;

  return {
    rawPattern: patternStr,
    frequency: brand.frequency,
    pulseCount,
  };
}

/**
 * Menganalisis pulsa untuk tampilan Oscilloscope dan debugger hardware
 */
export function analyzeIrPulse(hexCode: string | number, brand: BrandProfile, buttonName: string = 'Command'): IrPulseAnalysis {
  let numVal: number;
  if (typeof hexCode === 'string') {
    numVal = parseInt(hexCode.replace(/^0x/i, ''), 16);
  } else {
    numVal = Number(hexCode);
  }

  const dummyCmd: IrCommand = { id: 'temp', name: buttonName, hex: String(hexCode), category: 'nav' };
  const { rawPattern, frequency, pulseCount } = generateRawIrPattern(brand, dummyCmd);
  
  const pulses = rawPattern.split(',').map(Number);
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
    frequency,
    pulseCount,
    totalDurationMs: Math.round((totalDurationUs / 1000) * 10) / 10,
    pulses,
    rawCommaString: rawPattern,
    timestamp,
    buttonName,
    brandName: brand.name,
    protocolName: brand.protocol.toUpperCase(),
  };
}

// Web Audio tactile click feedback synthesizer
let audioCtx: AudioContext | null = null;

export function playTactileClick(type: 'click' | 'power' | 'nav' | 'key' | 'success' = 'click') {
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'nav') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'key') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.025);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  } catch {
    // AudioContext might be blocked or unavailable, ignore silently
  }
}
