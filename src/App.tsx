import React, { useState, useEffect } from 'react';
import {
  hexToSamsungRaw,
  analyzeSamsungNec,
  playTactileClick,
  IR_CARRIER_FREQ,
  SAMSUNG_COMMANDS
} from './utils/samsungIr';
import { STANDALONE_HTML_CODE } from './data/standaloneHtmlString';
import { ANDROID_FILES } from './data/androidFiles';
import {
  Power,
  Tv,
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
  Radio,
  Keyboard,
  Play,
  Pause,
  RotateCcw as RewindIcon,
  RotateCw as FwdIcon,
  Search,
  Download,
  Copy,
  Check,
  Code2,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Bridge simulation
  const [isSimulatingBridge, setIsSimulatingBridge] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState<{ name: string; hex: string } | null>(null);

  // Drawers
  const [isQwertyOpen, setIsQwertyOpen] = useState(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState(false);

  // YouTube QWERTY state
  const [ytSearchText, setYtSearchText] = useState('');
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'kotlin' | 'manifest'>('html');

  // Logs stream
  const [logs, setLogs] = useState<string[]>([
    `[READY] Remote Samsung Smart TV siap pada carrier 38 kHz (Poco X7 Pro).`
  ]);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isSimulatingBridge) {
      (window as unknown as { AndroidIR?: unknown }).AndroidIR = {
        hasIrEmitter: () => true,
        transmitIR: (_freq: number, _pattern: string) => true,
      };
    } else {
      delete (window as unknown as { AndroidIR?: unknown }).AndroidIR;
    }
  }, [isSimulatingBridge]);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  /**
   * Main Transmit function
   */
  const handleTransmit = (hex: string, name: string) => {
    // 1. Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    // 2. Sound click
    if (soundEnabled) {
      const isPower = name.toLowerCase().includes('power');
      const isNav = ['up', 'down', 'left', 'right', 'ok'].some(k => name.toLowerCase().includes(k));
      playTactileClick(isPower ? 'power' : isNav ? 'nav' : 'click');
    }

    // 3. Hardware IR diode flash
    setIsTransmitting(true);
    setTimeout(() => setIsTransmitting(false), 140);

    // 4. NECx2 encoding
    const rawPattern = hexToSamsungRaw(hex);
    const pulseCount = rawPattern.split(',').length;
    setLastCommand({ name, hex });

    // 5. Native bridge or browser simulation
    const hasBridge = typeof (window as unknown as { AndroidIR?: { transmitIR?: Function } }).AndroidIR?.transmitIR === 'function';
    if (hasBridge) {
      try {
        (window as unknown as { AndroidIR: { transmitIR: (f: number, p: string) => boolean } }).AndroidIR.transmitIR(
          IR_CARRIER_FREQ,
          rawPattern
        );
        showToast(`📡 [IR] ${name}`);
        addLog(`[TRANSMIT-OK] ${name} (${hex}) -> 38kHz, ${pulseCount} pulsa terkirim via ConsumerIrManager.`);
      } catch (err: unknown) {
        showToast(`⚠️ Gagal: ${(err as Error).message}`);
        addLog(`[ERROR] ${(err as Error).message}`);
      }
    } else {
      showToast(`⚡ [SIMULASI] ${name}`);
      addLog(`[SIMULASI] ${name} | HEX: ${hex} | Pulsa: ${pulseCount} elemen.`);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([STANDALONE_HTML_CODE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download index.html berhasil');
  };

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none relative overflow-x-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Floating Action Button for Android Studio Source Code Modal */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2">
        <button
          onClick={handleDownloadHtml}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Download single-file index.html"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">index.html</span>
        </button>

        <button
          onClick={() => setIsAndroidCodeModalOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Lihat Kode Android Studio (MainActivity.kt & Manifest)"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Android Studio</span>
        </button>
      </div>

      {/* ============================================================
          FOCUSED SAMSUNG SMART TV REMOTE (POCO X7 PRO)
          ============================================================ */}
      <div className="w-full max-w-[390px] h-[100dvh] max-h-[920px] flex flex-col justify-between py-2 relative">
        
        {/* Header Bar: Brand, Hardware Status, IR LED Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              SAMSUNG SMART TV
            </span>
            <span className="text-[9.5px] text-slate-400 font-medium">
              Poco X7 Pro · IR Blaster (38 kHz)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Suara klik aktif' : 'Suara dimatikan'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Hardware IR LED Diode on Poco Chassis */}
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                isTransmitting
                  ? 'bg-rose-500 border-white shadow-[0_0_16px_#f43f5e,0_0_26px_#ec4899] scale-125'
                  : 'bg-zinc-800 border-zinc-600 shadow-inner'
              }`}
              title="Sensor IR Blaster Poco X7 Pro"
            >
              <div className={`w-1 h-1 rounded-full ${isTransmitting ? 'bg-white' : 'bg-rose-500/30'}`} />
            </div>

            {/* Bridge Status Badge */}
            <button
              onClick={() => {
                setIsSimulatingBridge(!isSimulatingBridge);
                showToast(isSimulatingBridge ? 'Mode: Browser Simulasi' : 'Mode: AndroidIR Bridge Aktif');
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-semibold transition-all cursor-pointer"
              title="Klik untuk mengubah mode simulasi"
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

        {/* Main Glassmorphic Remote Panel */}
        <div className="flex-1 bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-3.5 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] relative">
          
          {/* Row 1: Power, Numpad 123, QWERTY YouTube, Source */}
          <div className="grid grid-cols-4 gap-2">
            {/* Power Button (Red Glow) */}
            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.power.hex, SAMSUNG_COMMANDS.power.name)}
              className="h-12 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/40 text-rose-400 flex flex-col items-center justify-center transition-all active:scale-[0.93] active:shadow-[0_0_20px_rgba(244,63,94,0.45)] cursor-pointer"
            >
              <Power className="w-4 h-4" />
              <span className="text-[8.5px] font-bold tracking-wider mt-0.5">POWER</span>
            </button>

            {/* 123 Numpad */}
            <button
              onClick={() => {
                setIsQwertyOpen(false);
                setIsNumpadOpen(true);
              }}
              className="h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <span className="text-xs font-bold tracking-widest text-slate-300">1 2 3</span>
              <span className="text-[8.5px] font-semibold text-slate-400 mt-0.5">NUMPAD</span>
            </button>

            {/* QWERTY Keyboard Button untuk YouTube */}
            <button
              onClick={() => {
                setIsNumpadOpen(false);
                setIsQwertyOpen(true);
              }}
              className="h-12 rounded-2xl bg-red-600/15 hover:bg-red-600/25 active:bg-red-600/35 border border-red-500/40 text-red-400 flex flex-col items-center justify-center transition-all active:scale-[0.93] active:shadow-[0_0_18px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-red-400" />
              <span className="text-[8.5px] font-bold text-red-300 tracking-wider mt-0.5">QWERTY</span>
            </button>

            {/* Source */}
            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.source.hex, SAMSUNG_COMMANDS.source.name)}
              className="h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span className="text-[8.5px] font-semibold tracking-wider mt-0.5">SOURCE</span>
            </button>
          </div>

          {/* YouTube Playback Control Bar (Rewind 10s, Play, Pause, Fast-Forward 10s) */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/30 rounded-2xl border border-white/5">
            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.rewind.hex, 'Rewind (10s)')}
              className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/5 flex items-center justify-center gap-1 text-[10px] text-slate-300 active:text-sky-300 active:scale-95 transition-all cursor-pointer"
              title="Mundur 10 detik di YouTube"
            >
              <RewindIcon className="w-3.5 h-3.5" />
              <span className="font-mono text-[9px]">-10s</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.play.hex, 'Play Video')}
              className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-emerald-500/20 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-emerald-400 active:scale-95 transition-all cursor-pointer"
              title="Putar Video YouTube"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-[9px]">PLAY</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.pause.hex, 'Pause Video')}
              className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-amber-500/20 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-amber-400 active:scale-95 transition-all cursor-pointer"
              title="Jeda Video YouTube"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-[9px]">PAUSE</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.fastForward.hex, 'Fast-Forward (10s)')}
              className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/5 flex items-center justify-center gap-1 text-[10px] text-slate-300 active:text-sky-300 active:scale-95 transition-all cursor-pointer"
              title="Maju 10 detik di YouTube"
            >
              <span className="font-mono text-[9px]">+10s</span>
              <FwdIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 2: Circular D-Pad Controller */}
          <div className="flex items-center justify-center py-1">
            <div className="relative w-48 h-48 rounded-full bg-white/[0.03] border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6),0_8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center">
              
              {/* Up */}
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.up.hex, SAMSUNG_COMMANDS.up.name)}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Up"
              >
                <ChevronUp className="w-7 h-7" />
              </button>

              {/* Left */}
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.left.hex, SAMSUNG_COMMANDS.left.name)}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Left"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* OK Center Button (Cyan/Blue Accent Glow) */}
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.ok.hex, SAMSUNG_COMMANDS.ok.name)}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-600/20 hover:from-sky-500/40 hover:to-blue-600/30 active:from-sky-500/50 active:to-blue-600/40 border border-sky-400/50 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/20 active:scale-[0.92] active:shadow-[0_0_24px_rgba(14,165,233,0.6)] active:border-sky-300 transition-all cursor-pointer z-20 flex items-center justify-center"
              >
                <span>OK</span>
              </button>

              {/* Right */}
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.right.hex, SAMSUNG_COMMANDS.right.name)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-16 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Right"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Down */}
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.down.hex, SAMSUNG_COMMANDS.down.name)}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-12 flex items-center justify-center text-slate-300 hover:text-white active:text-sky-300 active:scale-[0.88] transition-all cursor-pointer z-10"
                aria-label="Down"
              >
                <ChevronDown className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Row 3: Navigation Grid (Back, Home, Menu, Exit) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.back.hex, SAMSUNG_COMMANDS.back.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">BACK</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.home.hex, SAMSUNG_COMMANDS.home.name)}
              className="h-11 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:bg-sky-500/30 border border-sky-400/30 text-sky-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">HOME</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.menu.hex, SAMSUNG_COMMANDS.menu.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">MENU</span>
            </button>

            <button
              onClick={() => handleTransmit(SAMSUNG_COMMANDS.exit.hex, SAMSUNG_COMMANDS.exit.name)}
              className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.14] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-[0.93] cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span className="text-[8px] font-bold tracking-wider mt-0.5">EXIT</span>
            </button>
          </div>

          {/* Row 4: Rocker Volume, Mute di Tengah, Channel */}
          <div className="grid grid-cols-3 gap-2.5 items-center">
            
            {/* Volume Rocker Pill */}
            <div className="h-26 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1 shadow-inner">
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.volUp.hex, SAMSUNG_COMMANDS.volUp.name)}
                className="w-full h-9 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Volume Up"
              >
                +
              </button>
              <span className="text-[8.5px] font-bold text-slate-400 tracking-wider">VOL</span>
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.volDown.hex, SAMSUNG_COMMANDS.volDown.name)}
                className="w-full h-9 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Volume Down"
              >
                −
              </button>
            </div>

            {/* Center: Mute Button & Carrier Info */}
            <div className="flex flex-col items-center justify-center gap-1">
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.mute.hex, SAMSUNG_COMMANDS.mute.name)}
                className="w-13 h-13 rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:bg-amber-500/20 border border-white/10 active:border-amber-400 text-slate-200 active:text-amber-300 flex flex-col items-center justify-center transition-all active:scale-[0.92] active:shadow-[0_0_16px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <VolumeX className="w-4 h-4" />
                <span className="text-[7.5px] font-bold mt-0.5">MUTE</span>
              </button>
              <span className="text-[8.5px] font-mono text-slate-500">
                38 kHz
              </span>
            </div>

            {/* Channel Rocker Pill */}
            <div className="h-26 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1 shadow-inner">
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.chUp.hex, SAMSUNG_COMMANDS.chUp.name)}
                className="w-full h-9 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Channel Up"
              >
                ∧
              </button>
              <span className="text-[8.5px] font-bold text-slate-400 tracking-wider">CH</span>
              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.chDown.hex, SAMSUNG_COMMANDS.chDown.name)}
                className="w-full h-9 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.2] border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-[0.92] transition-all cursor-pointer"
                aria-label="Channel Down"
              >
                ∨
              </button>
            </div>

          </div>

          {/* ============================================================
               DRAWER: QWERTY KEYBOARD UNTUK YOUTUBE
               ============================================================ */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-[#0c101c]/98 backdrop-blur-3xl border-t border-white/15 rounded-t-[30px] p-4 shadow-2xl transition-transform duration-300 z-50 ${
              isQwertyOpen ? 'translate-y-0' : 'translate-y-[105%]'
            }`}
          >
            {/* Grab Handle */}
            <div
              onClick={() => setIsQwertyOpen(false)}
              className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2.5 cursor-pointer"
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-red-400 tracking-wider uppercase flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Keyboard Pencarian YouTube TV
              </span>
              <button
                onClick={() => setIsQwertyOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup ✕
              </button>
            </div>

            {/* Input Cepat Keyboard HP */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={ytSearchText}
                onChange={(e) => setYtSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTransmit(SAMSUNG_COMMANDS.ok.hex, `Cari: ${ytSearchText}`);
                    showToast(`🔍 Cari: "${ytSearchText}"`);
                  }
                }}
                placeholder="Ketik judul video di sini..."
                className="flex-1 h-9 bg-white/[0.07] border border-white/15 rounded-xl px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              />
              <button
                onClick={() => {
                  if (ytSearchText.trim()) {
                    handleTransmit(SAMSUNG_COMMANDS.ok.hex, `Cari: ${ytSearchText}`);
                    showToast(`🔍 Mencari: "${ytSearchText}" di TV`);
                  }
                }}
                className="px-3.5 h-9 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-red-600/30"
              >
                <Search className="w-3.5 h-3.5" />
                <span>CARI</span>
              </button>
            </div>

            {/* QWERTY Row 1: Q W E R T Y U I O P */}
            <div className="flex justify-center gap-1 mb-1.5">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(k => (
                <button
                  key={k}
                  onClick={() => {
                    setYtSearchText(prev => prev + k);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                  }}
                  className="h-8.5 min-w-[28px] flex-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.25] border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* QWERTY Row 2: A S D F G H J K L */}
            <div className="flex justify-center gap-1 mb-1.5 px-2">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(k => (
                <button
                  key={k}
                  onClick={() => {
                    setYtSearchText(prev => prev + k);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                  }}
                  className="h-8.5 min-w-[28px] flex-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.25] border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* QWERTY Row 3: Z X C V B N M + Backspace */}
            <div className="flex justify-center gap-1 mb-1.5">
              {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(k => (
                <button
                  key={k}
                  onClick={() => {
                    setYtSearchText(prev => prev + k);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                  }}
                  className="h-8.5 min-w-[28px] flex-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.25] border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer"
                >
                  {k}
                </button>
              ))}
              <button
                onClick={() => {
                  setYtSearchText(prev => prev.slice(0, -1));
                  if (!ytSearchText) {
                    handleTransmit(SAMSUNG_COMMANDS.back.hex, 'Back / Hapus');
                  }
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
                }}
                className="h-8.5 px-3 rounded-lg bg-white/[0.14] hover:bg-white/[0.2] active:bg-white/[0.3] border border-white/15 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer"
                title="Hapus / Backspace"
              >
                ⌫
              </button>
            </div>

            {/* QWERTY Row 4: Clear, Space, Enter */}
            <div className="flex justify-center gap-1 mb-2">
              <button
                onClick={() => setYtSearchText('')}
                className="h-8.5 px-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-[10px] text-slate-400 font-semibold active:scale-95 transition-all cursor-pointer"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setYtSearchText(prev => prev + ' ');
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                }}
                className="h-8.5 flex-1 max-w-[150px] rounded-lg bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.25] border border-white/10 text-white font-bold text-[11px] tracking-wider active:scale-95 transition-all cursor-pointer"
              >
                SPASI
              </button>

              <button
                onClick={() => handleTransmit(SAMSUNG_COMMANDS.ok.hex, 'Enter / Search')}
                className="h-8.5 px-4 rounded-lg bg-sky-500/30 hover:bg-sky-500/40 active:bg-sky-500/50 border border-sky-400/40 text-sky-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                ENTER ↵
              </button>
            </div>

            {/* Preset Cepat YouTube */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <span className="text-slate-500 font-medium shrink-0">Preset:</span>
              {['Musik', 'Podcast', 'Review Poco X7', 'Berita', 'Shorts', 'Lofi Beats'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setYtSearchText(tag);
                    showToast(`Preset: ${tag}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================
               DRAWER: NUMPAD 123
               ============================================================ */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-[#0c101c]/98 backdrop-blur-3xl border-t border-white/15 rounded-t-[30px] p-4 shadow-2xl transition-transform duration-300 z-50 ${
              isNumpadOpen ? 'translate-y-0' : 'translate-y-[105%]'
            }`}
          >
            <div
              onClick={() => setIsNumpadOpen(false)}
              className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 cursor-pointer"
            />

            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
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
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num1.hex, '1')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">1</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num2.hex, '2')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">2</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num3.hex, '3')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">3</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num4.hex, '4')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">4</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num5.hex, '5')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">5</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num6.hex, '6')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">6</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num7.hex, '7')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">7</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num8.hex, '8')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">8</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num9.hex, '9')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">9</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.source.hex, 'Source')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-semibold text-amber-400 active:scale-[0.93] transition-all">SRC</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.num0.hex, '0')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 font-bold text-base active:scale-[0.93] transition-all">0</button>
              <button onClick={() => handleTransmit(SAMSUNG_COMMANDS.back.hex, 'Return')} className="h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-semibold text-sky-400 active:scale-[0.93] transition-all">RET</button>
            </div>
          </div>

        </div>

        {/* Footer: Log Ticker & Toggle */}
        <div className="pt-2 px-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono truncate max-w-[240px]">
            {lastCommand ? `${lastCommand.name} (${lastCommand.hex})` : 'Siap · Standby'}
          </span>
          <button
            onClick={() => setIsLogOpen(!isLogOpen)}
            className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
          >
            {isLogOpen ? 'Tutup Log' : 'Log IR'}
          </button>
        </div>

        {/* Collapsible Log Stream */}
        {isLogOpen && (
          <div className="mt-1 p-2 rounded-xl bg-black/90 border border-white/10 font-mono text-[9px] text-sky-300 max-h-20 overflow-y-auto leading-relaxed">
            {logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}

      </div>

      {/* ============================================================
          MODAL: KODE ANDROID STUDIO (MAINACTIVITY.KT & MANIFEST)
          ============================================================ */}
      {isAndroidCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Kode Wrapper Android Studio (Poco X7 Pro)</h3>
              </div>
              <button
                onClick={() => setIsAndroidCodeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 my-3">
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'html' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                index.html
              </button>
              <button
                onClick={() => setActiveCodeTab('kotlin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'kotlin' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                MainActivity.kt
              </button>
              <button
                onClick={() => setActiveCodeTab('manifest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'manifest' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                AndroidManifest.xml
              </button>
            </div>

            {/* Code Box */}
            <div className="flex-1 overflow-auto bg-black/70 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 max-h-[50vh]">
              <pre className="whitespace-pre">
                <code>
                  {activeCodeTab === 'html' && STANDALONE_HTML_CODE}
                  {activeCodeTab === 'kotlin' && ANDROID_FILES.mainActivity}
                  {activeCodeTab === 'manifest' && ANDROID_FILES.androidManifest}
                </code>
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-400">
                {activeCodeTab === 'html' && 'Letakkan di: app/src/main/assets/index.html'}
                {activeCodeTab === 'kotlin' && 'Letakkan di: app/src/main/java/.../MainActivity.kt'}
                {activeCodeTab === 'manifest' && 'Letakkan di: app/src/main/AndroidManifest.xml'}
              </span>

              <div className="flex items-center gap-2">
                {activeCodeTab === 'html' && (
                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download index.html</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const text = activeCodeTab === 'html'
                      ? STANDALONE_HTML_CODE
                      : activeCodeTab === 'kotlin'
                      ? ANDROID_FILES.mainActivity
                      : ANDROID_FILES.androidManifest;
                    handleCopyCode(text, activeCodeTab);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {copiedCodeKey === activeCodeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
