import React, { useState } from 'react';
import { SAMSUNG_COMMANDS } from '../utils/samsungIr';
import {
  Power,
  Tv,
  Grid3X3,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Menu,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Radio,
  Sparkles,
  Activity,
  Volume
} from 'lucide-react';

interface PocoChassisProps {
  onSendCommand: (hex: string, name: string) => void;
  isSimulatingBridge: boolean;
  onToggleBridgeSimulation: () => void;
  onOpenOscilloscope: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isTransmitting: boolean;
  lastCommand: { name: string; hex: string } | null;
}

export const PocoChassis: React.FC<PocoChassisProps> = ({
  onSendCommand,
  isSimulatingBridge,
  onToggleBridgeSimulation,
  onOpenOscilloscope,
  soundEnabled,
  onToggleSound,
  isTransmitting,
  lastCommand,
}) => {
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const handlePress = (hex: string, name: string) => {
    onSendCommand(hex, name);
  };

  return (
    <div className="relative w-full max-w-[380px] mx-auto select-none">
      
      {/* Poco X7 Pro Smartphone Outer Chassis */}
      <div className="relative bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3.5 rounded-[46px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(255,255,255,0.12)] border border-white/10 flex flex-col">
        
        {/* Phone Frame Rim Reflections */}
        <div className="absolute inset-0 rounded-[46px] pointer-events-none ring-1 ring-inset ring-white/15" />
        
        {/* Top Edge: IR Blaster Diode, Speaker, Front Punch Hole Camera */}
        <div className="relative w-full h-7 flex items-center justify-between px-6 z-20">
          
          {/* Left: Punch-hole front camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 border border-zinc-700/80 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
          </div>

          {/* Center: Earpiece speaker slit */}
          <div className="w-14 h-1 bg-zinc-700/60 rounded-full" />

          {/* Right: POCO IR BLASTER SENSOR DIODE */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                isTransmitting
                  ? 'bg-rose-500 border-white shadow-[0_0_16px_#f43f5e,0_0_28px_#ec4899] scale-125'
                  : 'bg-zinc-800 border-zinc-600/70 shadow-inner'
              }`}
              title="Poco X7 Pro IR Blaster Emitter (38kHz)"
            >
              <div
                className={`w-1 h-1 rounded-full ${
                  isTransmitting ? 'bg-white' : 'bg-rose-500/30'
                }`}
              />
            </div>
            <span className="text-[8px] font-mono font-bold tracking-tighter text-zinc-400">
              IR
            </span>
          </div>

        </div>

        {/* AMOLED Screen Area (20:9 Aspect Ratio Container) */}
        <div className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#182035] via-[#0d1220] to-[#05070c] p-3 text-slate-100 flex flex-col justify-between border border-white/10 shadow-2xl min-h-[690px]">
          
          {/* Background Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/15 via-transparent to-transparent pointer-events-none" />

          {/* 1. Header Bar: Status & Hardware Detection */}
          <div className="relative z-10 flex items-center justify-between p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-sky-400" />
                SAMSUNG SMART TV
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                Poco X7 Pro · IR Blaster
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={soundEnabled ? 'Klik suara aktif' : 'Klik suara senyap'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Oscilloscope trigger */}
              <button
                onClick={onOpenOscilloscope}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors"
                title="Buka Oscilloscope Pulsa NECx2"
              >
                <Activity className="w-3.5 h-3.5" />
              </button>

              {/* Bridge Status Toggle Badge */}
              <button
                onClick={onToggleBridgeSimulation}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-semibold transition-all"
                title="Klik untuk mengubah status simulasi bridge AndroidIR"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSimulatingBridge
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                  }`}
                />
                <span className={isSimulatingBridge ? 'text-emerald-300' : 'text-amber-300'}>
                  {isSimulatingBridge ? 'Android IR' : 'Simulasi'}
                </span>
              </button>
            </div>
          </div>

          {/* 2. Top Row: Power & Source & Numpad Drawer */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5 my-1">
            {/* Power Button (Red Glow) */}
            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.power.hex, SAMSUNG_COMMANDS.power.name)}
              className="h-13 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/40 text-rose-400 flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.93] active:shadow-[0_0_20px_rgba(244,63,94,0.45)] group cursor-pointer"
            >
              <Power className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-[9px] font-bold tracking-wider mt-0.5">POWER</span>
            </button>

            {/* Numpad Sheet Trigger */}
            <button
              onClick={() => setIsNumpadOpen(true)}
              className="h-13 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.93] cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4 text-sky-400" />
              <span className="text-[9px] font-semibold tracking-wider mt-0.5">NUMPAD</span>
            </button>

            {/* Source Button */}
            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.source.hex, SAMSUNG_COMMANDS.source.name)}
              className="h-13 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all duration-100 active:scale-[0.93] cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-semibold tracking-wider mt-0.5">SOURCE</span>
            </button>
          </div>

          {/* 3. Circular D-Pad Controller */}
          <div className="relative z-10 flex items-center justify-center py-2">
            <div className="relative w-48 h-48 rounded-full bg-white/[0.03] border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6),0_8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center">
              
              {/* Up */}
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.up.hex, SAMSUNG_COMMANDS.up.name)}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Up"
              >
                <ChevronUp className="w-7 h-7" />
              </button>

              {/* Left */}
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.left.hex, SAMSUNG_COMMANDS.left.name)}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Left"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* OK Center Button (Cyan/Blue Accent Glow) */}
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.ok.hex, SAMSUNG_COMMANDS.ok.name)}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-600/20 hover:from-sky-500/40 hover:to-blue-600/30 active:from-sky-500/50 active:to-blue-600/40 border border-sky-400/50 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/20 active:scale-[0.92] active:shadow-[0_0_24px_rgba(14,165,233,0.6)] active:border-sky-300 transition-all cursor-pointer z-20 flex items-center justify-center"
              >
                <span>OK</span>
              </button>

              {/* Right */}
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.right.hex, SAMSUNG_COMMANDS.right.name)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Right"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Down */}
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.down.hex, SAMSUNG_COMMANDS.down.name)}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Down"
              >
                <ChevronDown className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* 4. Navigation Grid Row (Back, Home, Menu, Exit) */}
          <div className="relative z-10 grid grid-cols-4 gap-2 my-1">
            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.back.hex, SAMSUNG_COMMANDS.back.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">BACK</span>
            </button>

            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.home.hex, SAMSUNG_COMMANDS.home.name)}
              className="h-11 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:bg-sky-500/30 border border-sky-400/30 text-sky-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">HOME</span>
            </button>

            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.menu.hex, SAMSUNG_COMMANDS.menu.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">MENU</span>
            </button>

            <button
              onClick={() => handlePress(SAMSUNG_COMMANDS.exit.hex, SAMSUNG_COMMANDS.exit.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">EXIT</span>
            </button>
          </div>

          {/* 5. Rocker Area: Volume (+ / -), Center Mute, Channel (Up / Down) */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5 items-center my-1">
            
            {/* Volume Rocker Pill */}
            <div className="h-28 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1.5 shadow-inner">
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.volUp.hex, SAMSUNG_COMMANDS.volUp.name)}
                className="w-full h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Volume Up"
              >
                +
              </button>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">VOL</span>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.volDown.hex, SAMSUNG_COMMANDS.volDown.name)}
                className="w-full h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Volume Down"
              >
                −
              </button>
            </div>

            {/* Center: Mute Button & Carrier Info */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.mute.hex, SAMSUNG_COMMANDS.mute.name)}
                className="w-14 h-14 rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-500/20 border border-white/10 active:border-amber-400 text-slate-200 active:text-amber-300 flex flex-col items-center justify-center transition-all active:scale-[0.92] active:shadow-[0_0_16px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <VolumeX className="w-5 h-5" />
                <span className="text-[8px] font-bold mt-0.5">MUTE</span>
              </button>
              <span className="text-[9px] font-mono text-slate-400">
                38 kHz
              </span>
            </div>

            {/* Channel Rocker Pill */}
            <div className="h-28 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1.5 shadow-inner">
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.chUp.hex, SAMSUNG_COMMANDS.chUp.name)}
                className="w-full h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Channel Up"
              >
                ∧
              </button>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider">CH</span>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.chDown.hex, SAMSUNG_COMMANDS.chDown.name)}
                className="w-full h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Channel Down"
              >
                ∨
              </button>
            </div>

          </div>

          {/* 6. Footer Status & Debug Log Bar */}
          <div className="relative z-10 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-mono truncate max-w-[200px]">
              {lastCommand ? `${lastCommand.name} (${lastCommand.hex})` : 'Standby · Ready'}
            </span>
            <button
              onClick={() => setIsDebugOpen(!isDebugOpen)}
              className="text-sky-400 hover:text-sky-300 underline font-medium"
            >
              {isDebugOpen ? 'Tutup Log' : 'Log IR'}
            </button>
          </div>

          {/* Mini Debug Panel */}
          {isDebugOpen && (
            <div className="relative z-10 mt-1 p-2 rounded-xl bg-black/80 border border-white/10 font-mono text-[9px] text-sky-300 max-h-16 overflow-y-auto leading-relaxed">
              <div>[SYSTEM] Poco X7 Pro IR Driver @ 38000 Hz</div>
              <div>[PROTOCOL] Samsung NECx2 (32-bit: Leader 4.5ms, Bit 560µs)</div>
              {lastCommand && (
                <div>[LAST-TX] {lastCommand.name} &gt; {lastCommand.hex} (67 pulsa)</div>
              )}
            </div>
          )}

          {/* 7. Numpad Drawer (Bottom Sheet) */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-[#0d1220]/95 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl p-4 shadow-2xl transition-transform duration-300 z-50 ${
              isNumpadOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Grab handle */}
            <div
              onClick={() => setIsNumpadOpen(false)}
              className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 cursor-pointer"
            />

            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                Tombol Angka
              </span>
              <button
                onClick={() => setIsNumpadOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num1.hex, '1')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                1
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num2.hex, '2')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                2
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num3.hex, '3')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                3
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num4.hex, '4')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                4
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num5.hex, '5')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                5
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num6.hex, '6')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                6
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num7.hex, '7')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                7
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num8.hex, '8')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                8
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num9.hex, '9')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                9
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.source.hex, 'Source')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-semibold text-amber-400 active:scale-[0.93] transition-all"
              >
                SRC
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.num0.hex, '0')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all"
              >
                0
              </button>
              <button
                onClick={() => handlePress(SAMSUNG_COMMANDS.back.hex, 'Return')}
                className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-semibold text-sky-400 active:scale-[0.93] transition-all"
              >
                RET
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
