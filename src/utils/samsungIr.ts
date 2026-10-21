import { IrPulseAnalysis, SamsungCommand } from '../types/ir';
import { BRANDS } from '../data/brands';
import { hexToSamsungRaw as rawGen, analyzeIrPulse, playTactileClick as clickGen } from './irProtocols';

export const SAMSUNG_COMMANDS: Record<string, SamsungCommand> = BRANDS.samsung.commands;

export const IR_CARRIER_FREQ = 38000; // 38kHz

export function hexToSamsungRaw(hexCode: string | number): string {
  return rawGen(hexCode);
}

export function analyzeSamsungNec(hexCode: string | number, buttonName: string = 'Command'): IrPulseAnalysis {
  return analyzeIrPulse(hexCode, BRANDS.samsung, buttonName);
}

export function playTactileClick(type: 'click' | 'power' | 'nav' = 'click') {
  clickGen(type);
}
