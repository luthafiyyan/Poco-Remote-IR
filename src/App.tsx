import React, { useState, useEffect } from 'react';
import {
  BrandProfile,
  IrPulseAnalysis,
  TvState,
} from './types/ir';
import { BRANDS, DEFAULT_BRAND_ID } from './data/brands';
import {
  generateRawIrPattern,
  analyzeIrPulse,
  playTactileClick,
} from './utils/irProtocols';
import { BrandSelectorModal } from './components/BrandSelectorModal';
import { QwertyTypingPanel } from './components/QwertyTypingPanel';
import { OscilloscopeModal } from './components/OscilloscopeModal';
import { VirtualTv } from './components/VirtualTv';
import { ANDROID_FILES } from './data/androidFiles';
import { STANDALONE_HTML_CODE } from './data/standaloneHtmlString';
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
  Activity,
  Sliders,
  Sparkles,
  Layers,
  Monitor,
  Radio,
  Maximize2,
  Smartphone,
  Info,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export default function App() {
  // Brand selection
  const [activeBrandId, setActiveBrandId] = useState<string>(DEFAULT_BRAND_ID);
  const activeBrand: BrandProfile = BRANDS[activeBrandId] || BRANDS[DEFAULT_BRAND_ID];

  // Active view tab: 'remote' | 'keyboard' | 'numpad' | 'tv'
  const [activeTab, setActiveTab] = useState<'remote' | 'keyboard' | 'numpad' | 'tv'>('remote');

  // Modals
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isOscilloscopeOpen, setIsOscilloscopeOpen] = useState(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState(false);
  const [isHardwareInfoOpen, setIsHardwareInfoOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Hardware feedback & Android IR detection
  const [hasNativeAndroidIR, setHasNativeAndroidIR] = useState<boolean>(() => {
    return typeof (window as any).AndroidIR?.transmitIR === 'function';
  });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState<{ name: string; hex: string; freq: number } | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<IrPulseAnalysis | null>(null);

  // TV State Simulation
  const [tvState, setTvState] = useState<TvState>({
    isPowered: true,
    volume: 18,
    isMuted: false,
    channel: 2, // YouTube UHD
    source: 'TV',
    isSmartHubOpen: false,
    isMenuOpen: false,
    selectedAppIndex: 0,
    notification: null,
    activeBrandId: DEFAULT_BRAND_ID,
    searchQuery: '',
    cursorRow: 0,
    cursorCol: 0,
  });

  // Android Studio code tabs
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'kotlin' | 'manifest'>('html');
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Logs stream
  const [logs, setLogs] = useState<string[]>([
    `[READY] Poco Universal IR Remote aktif. Carrier: ${activeBrand.frequency / 1000} kHz (${activeBrand.name}).`
  ]);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // PWA Installation
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Deteksi jika sudah berjalan dalam mode standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      addLog('[PWA] Event beforeinstallprompt siap. Tombol Instal aktif.');
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredInstallPrompt(null);
      showToast('🎉 Aplikasi Poco Remote berhasil diinstal!');
      addLog('[PWA] Aplikasi berhasil dipasang di layar utama.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Menginstal aplikasi ke layar utama...');
      }
      setDeferredInstallPrompt(null);
    } else {
      showToast('Buka menu browser (⋮) lalu pilih "Instal Aplikasi" / "Tambahkan ke Layar Utama"');
    }
  };

  useEffect(() => {
    const hasBridge = typeof (window as any).AndroidIR?.transmitIR === 'function';
    setHasNativeAndroidIR(hasBridge);
    if (hasBridge) {
      addLog('[HARDWARE IR] Terhubung ke ConsumerIrManager native Poco/Xiaomi.');
    } else {
      addLog('[MODE WEB] Berjalan di browser/PWA. Lampu IR fisik Poco butuh izin APK Android.');
    }
  }, []);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  /**
   * Main Transmit function: supports any brand & frequency
   */
  const handleTransmit = (hex: string, name: string) => {
    // 1. Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }

    // 2. Sound click
    if (soundEnabled) {
      const isPower = name.toLowerCase().includes('power');
      const isNav = ['up', 'down', 'left', 'right', 'ok'].some(k => name.toLowerCase().includes(k));
      playTactileClick(isPower ? 'power' : isNav ? 'nav' : 'click');
    }

    // 3. Hardware IR diode pulse animation
    setIsTransmitting(true);
    setTimeout(() => setIsTransmitting(false), 130);

    // 4. Generate pulse sequence according to active brand & protocol
    const dummyCmd = { id: name, name, hex, category: 'nav' as const };
    const { rawPattern, frequency, pulseCount } = generateRawIrPattern(activeBrand, dummyCmd);

    setLastCommand({ name, hex, freq: frequency });

    // Store analysis for Oscilloscope
    const analysis = analyzeIrPulse(hex, activeBrand, name);
    setCurrentAnalysis(analysis);

    // 5. Update Virtual TV state if applicable
    updateTvStateForCommand(name);

    // 6. Transmit via native Android ConsumerIrManager or browser simulation
    const hasBridge = typeof (window as any).AndroidIR?.transmitIR === 'function';
    if (hasBridge) {
      try {
        const res = (window as any).AndroidIR.transmitIR(frequency, rawPattern);
        if (res !== false) {
          showToast(`📡 [IR FISIK] ${activeBrand.shortName}: ${name}`);
          addLog(`[IR FISIK OK] ${activeBrand.shortName} | ${name} (${hex}) -> ${frequency / 1000}kHz, ${pulseCount} pulsa dipancarkan.`);
        } else {
          showToast(`⚠️ Hardware IR gagal transmit`);
          addLog(`[ERROR] ConsumerIrManager melaporkan gagal kirim.`);
        }
      } catch (err: any) {
        showToast(`⚠️ Transmit Error: ${err.message}`);
        addLog(`[ERROR] ${err.message}`);
      }
    } else {
      showToast(`⚡ [Mode Web] ${activeBrand.shortName}: ${name}`);
      addLog(`[MODE WEB] ${activeBrand.shortName} | ${name} (${hex}) dihitung (${pulseCount} pulsa). Browser tidak bisa menembakkan lampu IR fisik (butuh APK).`);
    }
  };

  /**
   * Update virtual TV simulation
   */
  const updateTvStateForCommand = (cmdName: string) => {
    const lower = cmdName.toLowerCase();

    if (lower.includes('power')) {
      setTvState(prev => ({ ...prev, isPowered: !prev.isPowered }));
    } else if (lower.includes('vol') && lower.includes('+')) {
      setTvState(prev => ({ ...prev, volume: Math.min(100, prev.volume + 2), isMuted: false }));
    } else if (lower.includes('vol') && (lower.includes('-') || lower.includes('down'))) {
      setTvState(prev => ({ ...prev, volume: Math.max(0, prev.volume - 2), isMuted: false }));
    } else if (lower.includes('mute')) {
      setTvState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    } else if (lower.includes('ch') && lower.includes('+')) {
      setTvState(prev => ({ ...prev, channel: (prev.channel % 9) + 1 }));
    } else if (lower.includes('ch') && (lower.includes('-') || lower.includes('down'))) {
      setTvState(prev => ({ ...prev, channel: prev.channel <= 1 ? 9 : prev.channel - 1 }));
    } else if (lower.includes('home')) {
      setTvState(prev => ({ ...prev, isSmartHubOpen: !prev.isSmartHubOpen }));
    } else if (lower.includes('menu')) {
      setTvState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
    } else if (lower.includes('source') || lower.includes('input')) {
      const sources = ['TV', 'HDMI 1', 'HDMI 2', 'USB', 'AV'];
      setTvState(prev => {
        const nextIdx = (sources.indexOf(prev.source) + 1) % sources.length;
        return { ...prev, source: sources[nextIdx] };
      });
    } else if (lower.includes('up')) {
      setTvState(prev => ({ ...prev, cursorRow: Math.max(0, prev.cursorRow - 1) }));
    } else if (lower.includes('down')) {
      setTvState(prev => ({ ...prev, cursorRow: Math.min(5, prev.cursorRow + 1) }));
    } else if (lower.includes('left')) {
      setTvState(prev => ({ ...prev, cursorCol: Math.max(0, prev.cursorCol - 1) }));
    } else if (lower.includes('right')) {
      setTvState(prev => ({ ...prev, cursorCol: Math.min(5, prev.cursorCol + 1) }));
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
    showToast('Download standalone index.html berhasil');
  };

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 select-none relative overflow-x-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900/95 backdrop-blur-xl border border-amber-400/40 text-amber-300 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================
          MAIN CHASSIS CONTAINER (POCO CYBERPUNK / OLED DARK THEME)
          ============================================================ */}
      <div className="w-full max-w-[420px] flex flex-col justify-start py-1 relative">
        
        {/* Top Poco Chassis Notch: Camera, Speaker & IR Blaster LED */}
        <div className="relative w-full h-8 flex items-center justify-between px-5 py-1 mb-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          
          {/* Front Camera Notch */}
          <div className="w-3 h-3 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-sky-950" />
          </div>

          {/* Earpiece slit */}
          <div className="w-12 h-1 bg-zinc-700/60 rounded-full" />

          {/* HARDWARE IR BLASTER LED DIODE */}
          <div className="flex items-center gap-1.5" title="Hardware IR Blaster Poco / Xiaomi">
            <span className="text-[9px] font-mono font-bold text-amber-400/90 tracking-wider">
              POCO IR
            </span>
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                isTransmitting
                  ? 'bg-rose-500 border-white shadow-[0_0_16px_#f43f5e,0_0_28px_#fbbf24] scale-125'
                  : 'bg-zinc-800 border-zinc-600 shadow-inner'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${isTransmitting ? 'bg-white' : 'bg-rose-500/30'}`} />
            </div>
          </div>
        </div>

        {/* Brand & Device Selector Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-2.5">
          
          {/* Clickable Brand Selector Pill */}
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-left transition-all active:scale-95 cursor-pointer"
            title="Klik untuk mengganti merk TV atau Monitor"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor: activeBrand.badgeColor ? `${activeBrand.badgeColor}30` : '#334155',
                color: activeBrand.badgeColor || '#fff',
                border: `1px solid ${activeBrand.badgeColor ? `${activeBrand.badgeColor}70` : '#475569'}`
              }}
            >
              {activeBrand.category === 'tv' ? <Tv className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1">
                {activeBrand.shortName}
                <span className="text-[10px] text-amber-400">▾</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {activeBrand.frequency / 1000} kHz · {activeBrand.protocol.replace('_', ' ')}
              </span>
            </div>
          </button>

          {/* Quick Controls: Install, Sound & Native Bridge Status */}
          <div className="flex items-center gap-1.5">
            {/* PWA Install Button (Inline & Non-intrusive) */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="px-2 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                title="Instal aplikasi ke layar utama HP Poco"
              >
                <Smartphone className="w-3 h-3 stroke-[2.5]" />
                <span className="hidden sm:inline">Instal</span>
              </button>
            )}

            {/* Audio Feedback Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? 'Suara dimatikan' : 'Suara klik aktif');
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Suara klik aktif' : 'Suara dimatikan'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Bridge Status */}
            {hasNativeAndroidIR ? (
              <button
                onClick={() => setIsHardwareInfoOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[9.5px] font-semibold transition-all cursor-pointer text-emerald-400"
                title="Hardware IR Blaster Native Aktif"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                <span>IR Fisik Aktif</span>
              </button>
            ) : (
              <button
                onClick={() => setIsHardwareInfoOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[9.5px] font-semibold transition-all cursor-pointer text-amber-300"
                title="Klik untuk panduan menyalakan lampu IR fisik Poco"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span>Web IR</span>
                <Info className="w-3 h-3 text-amber-400" />
              </button>
            )}
          </div>

        </div>

        {/* Mode Navigation Tabs: Remote / Qwerty / Numpad / Virtual TV */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-2xl border border-white/10 mb-2.5">
          <button
            onClick={() => setActiveTab('remote')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'remote'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Remote</span>
          </button>

          <button
            onClick={() => setActiveTab('keyboard')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'keyboard'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>QWERTY</span>
          </button>

          <button
            onClick={() => setActiveTab('numpad')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'numpad'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="font-mono text-[11px]">1 2 3</span>
            <span>Numpad</span>
          </button>

          <button
            onClick={() => setActiveTab('tv')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tv'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Layar TV</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: CLASSIC UNIVERSAL REMOTE VIEW
            ============================================================ */}
        {activeTab === 'remote' && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-4">
            
            {/* Row 1: Power, Qwerty Shortcut, Source/Input, Menu */}
            <div className="grid grid-cols-4 gap-2">
              {/* Power Button */}
              <button
                onClick={() => handleTransmit(activeBrand.commands.power.hex, `${activeBrand.shortName} Power`)}
                className="h-12 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/40 text-rose-400 flex flex-col items-center justify-center transition-all active:scale-90 active:shadow-[0_0_20px_rgba(244,63,94,0.45)] cursor-pointer"
                title="Power On / Off"
              >
                <Power className="w-4 h-4" />
                <span className="text-[8.5px] font-bold tracking-wider mt-0.5">POWER</span>
              </button>

              {/* Direct QWERTY Switch */}
              <button
                onClick={() => setActiveTab('keyboard')}
                className="h-12 rounded-2xl bg-amber-400/15 hover:bg-amber-400/25 active:bg-amber-400/35 border border-amber-400/40 text-amber-300 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
                title="Buka Mode Keyboard QWERTY untuk Mengetik"
              >
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span className="text-[8.5px] font-bold tracking-wider mt-0.5">QWERTY</span>
              </button>

              {/* Source / Input */}
              <button
                onClick={() => handleTransmit(activeBrand.commands.source.hex, `${activeBrand.shortName} Source`)}
                className="h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span className="text-[8.5px] font-semibold tracking-wider mt-0.5">SOURCE</span>
              </button>

              {/* Menu / Settings */}
              <button
                onClick={() => handleTransmit(activeBrand.commands.menu.hex, `${activeBrand.shortName} Menu`)}
                className="h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 text-slate-200 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <Menu className="w-4 h-4 text-slate-300" />
                <span className="text-[8.5px] font-semibold tracking-wider mt-0.5">MENU</span>
              </button>
            </div>

            {/* YouTube & Media Playback Control Bar */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button
                onClick={() => handleTransmit(activeBrand.commands.rewind?.hex || activeBrand.commands.left.hex, 'Rewind (-10s)')}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-slate-300 cursor-pointer"
                title="Mundur 10 detik"
              >
                <RewindIcon className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px]">-10s</span>
              </button>

              <button
                onClick={() => handleTransmit(activeBrand.commands.play?.hex || activeBrand.commands.ok.hex, 'Play')}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-emerald-400 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-[9px]">PLAY</span>
              </button>

              <button
                onClick={() => handleTransmit(activeBrand.commands.pause?.hex || activeBrand.commands.ok.hex, 'Pause')}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-amber-400 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-[9px]">PAUSE</span>
              </button>

              <button
                onClick={() => handleTransmit(activeBrand.commands.fastForward?.hex || activeBrand.commands.right.hex, 'Fast-Forward (+10s)')}
                className="h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/5 flex items-center justify-center gap-1 text-[10px] text-slate-300 cursor-pointer"
                title="Maju 10 detik"
              >
                <span className="font-mono text-[9px]">+10s</span>
                <FwdIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular D-Pad Controller */}
            <div className="flex items-center justify-center py-1">
              <div className="relative w-52 h-52 rounded-full bg-white/[0.03] border border-white/10 shadow-[inset_0_2px_14px_rgba(0,0,0,0.7),0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
                
                {/* Up */}
                <button
                  onClick={() => handleTransmit(activeBrand.commands.up.hex, `${activeBrand.shortName} Up`)}
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-18 h-14 flex items-center justify-center text-slate-300 hover:text-white active:text-amber-400 active:scale-85 transition-all cursor-pointer z-10"
                  aria-label="Up"
                >
                  <ChevronUp className="w-8 h-8" />
                </button>

                {/* Left */}
                <button
                  onClick={() => handleTransmit(activeBrand.commands.left.hex, `${activeBrand.shortName} Left`)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-14 h-18 flex items-center justify-center text-slate-300 hover:text-white active:text-amber-400 active:scale-85 transition-all cursor-pointer z-10"
                  aria-label="Left"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                {/* OK Center Button (Poco Yellow Glow) */}
                <button
                  onClick={() => handleTransmit(activeBrand.commands.ok.hex, `${activeBrand.shortName} OK`)}
                  className="w-22 h-22 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-base tracking-wider shadow-lg shadow-amber-400/30 active:scale-90 active:shadow-[0_0_28px_rgba(251,191,36,0.8)] transition-all cursor-pointer z-20 flex items-center justify-center border border-amber-300"
                >
                  <span>OK</span>
                </button>

                {/* Right */}
                <button
                  onClick={() => handleTransmit(activeBrand.commands.right.hex, `${activeBrand.shortName} Right`)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-14 h-18 flex items-center justify-center text-slate-300 hover:text-white active:text-amber-400 active:scale-85 transition-all cursor-pointer z-10"
                  aria-label="Right"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Down */}
                <button
                  onClick={() => handleTransmit(activeBrand.commands.down.hex, `${activeBrand.shortName} Down`)}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-18 h-14 flex items-center justify-center text-slate-300 hover:text-white active:text-amber-400 active:scale-85 transition-all cursor-pointer z-10"
                  aria-label="Down"
                >
                  <ChevronDown className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Navigation Grid (Back, Home, Exit) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTransmit(activeBrand.commands.back.hex, `${activeBrand.shortName} Back`)}
                className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-300" />
                <span className="text-[8px] font-bold tracking-wider mt-0.5">BACK</span>
              </button>

              <button
                onClick={() => handleTransmit(activeBrand.commands.home.hex, `${activeBrand.shortName} Home`)}
                className="h-11 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 active:bg-amber-400/35 border border-amber-400/40 text-amber-300 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span className="text-[8px] font-bold tracking-wider mt-0.5">HOME</span>
              </button>

              <button
                onClick={() => handleTransmit(activeBrand.commands.exit?.hex || activeBrand.commands.back.hex, `${activeBrand.shortName} Exit`)}
                className="h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 text-slate-300 flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-300" />
                <span className="text-[8px] font-bold tracking-wider mt-0.5">EXIT</span>
              </button>
            </div>

            {/* Rocker Volume, Mute di Tengah, Channel */}
            <div className="grid grid-cols-3 gap-2.5 items-center">
              
              {/* Volume Rocker */}
              <div className="h-28 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1 shadow-inner">
                <button
                  onClick={() => handleTransmit(activeBrand.commands.volUp.hex, `${activeBrand.shortName} Vol +`)}
                  className="w-full h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  +
                </button>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">VOL</span>
                <button
                  onClick={() => handleTransmit(activeBrand.commands.volDown.hex, `${activeBrand.shortName} Vol -`)}
                  className="w-full h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  −
                </button>
              </div>

              {/* Center: Mute Button */}
              <div className="flex flex-col items-center justify-center gap-1.5">
                <button
                  onClick={() => handleTransmit(activeBrand.commands.mute.hex, `${activeBrand.shortName} Mute`)}
                  className="w-14 h-14 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:bg-rose-500/30 border border-white/10 text-slate-200 active:text-rose-400 flex flex-col items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer"
                  title="Mute Volume"
                >
                  <VolumeX className="w-5 h-5 text-rose-400" />
                  <span className="text-[8px] font-bold mt-0.5">MUTE</span>
                </button>
                <span className="text-[8.5px] font-mono text-slate-500">
                  {activeBrand.frequency / 1000} kHz
                </span>
              </div>

              {/* Channel Rocker */}
              <div className="h-28 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-between p-1 shadow-inner">
                <button
                  onClick={() => handleTransmit(activeBrand.commands.chUp.hex, `${activeBrand.shortName} Ch +`)}
                  className="w-full h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  ∧
                </button>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">CH</span>
                <button
                  onClick={() => handleTransmit(activeBrand.commands.chDown.hex, `${activeBrand.shortName} Ch -`)}
                  className="w-full h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-base flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  ∨
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================
            TAB 2: REDESIGNED QWERTY KEYBOARD & TV TYPIST SUITE
            ============================================================ */}
        {activeTab === 'keyboard' && (
          <div className="animate-in fade-in duration-150">
            <QwertyTypingPanel
              activeBrand={activeBrand}
              onSendCommand={handleTransmit}
              onSendRawPattern={(freq, pattern, name) => {
                const hasBridge = typeof (window as any).AndroidIR?.transmitIR === 'function';
                if (hasBridge) {
                  (window as any).AndroidIR.transmitIR(freq, pattern);
                }
                showToast(`📡 ${name}`);
              }}
              soundEnabled={soundEnabled}
              onPlaySound={playTactileClick}
              onShowToast={showToast}
              onAddLog={addLog}
              currentTvCursor={{ row: tvState.cursorRow, col: tvState.cursorCol }}
              onUpdateTvCursor={(row, col) => {
                setTvState(prev => ({ ...prev, cursorRow: row, cursorCol: col }));
              }}
            />
          </div>
        )}

        {/* ============================================================
            TAB 3: NUMPAD & COLOR SMART KEYS
            ============================================================ */}
        {activeTab === 'numpad' && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex flex-col space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tombol Angka & Fitur Tambahan
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {activeBrand.shortName}
              </span>
            </div>

            {/* 3x4 Digits Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => {
                const cmdKey = `num${digit}`;
                const cmd = activeBrand.commands[cmdKey];
                return (
                  <button
                    key={digit}
                    onClick={() => {
                      if (cmd) handleTransmit(cmd.hex, `Angka ${digit}`);
                    }}
                    className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 font-bold text-lg active:scale-90 transition-all cursor-pointer"
                  >
                    {digit}
                  </button>
                );
              })}

              {/* Source Shortcut */}
              <button
                onClick={() => handleTransmit(activeBrand.commands.source.hex, 'Source')}
                className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-bold text-amber-400 active:scale-90 transition-all cursor-pointer"
              >
                SRC
              </button>

              {/* 0 */}
              <button
                onClick={() => {
                  const cmd0 = activeBrand.commands.num0;
                  if (cmd0) handleTransmit(cmd0.hex, 'Angka 0');
                }}
                className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-amber-400 active:text-black border border-white/10 font-bold text-lg active:scale-90 transition-all cursor-pointer"
              >
                0
              </button>

              {/* Return */}
              <button
                onClick={() => handleTransmit(activeBrand.commands.back.hex, 'Back')}
                className="h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.2] border border-white/10 text-xs font-bold text-sky-400 active:scale-90 transition-all cursor-pointer"
              >
                RET
              </button>
            </div>

            {/* Smart Color Buttons (Merah, Hijau, Kuning, Biru) */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const cmd = activeBrand.commands.red || activeBrand.commands.num1;
                  handleTransmit(cmd.hex, 'Warna Merah (A)');
                }}
                className="h-9 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-500/50 text-red-400 font-bold text-xs active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              >
                A
              </button>

              <button
                onClick={() => {
                  const cmd = activeBrand.commands.green || activeBrand.commands.num2;
                  handleTransmit(cmd.hex, 'Warna Hijau (B)');
                }}
                className="h-9 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-500/50 text-emerald-400 font-bold text-xs active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              >
                B
              </button>

              <button
                onClick={() => {
                  const cmd = activeBrand.commands.yellow || activeBrand.commands.num3;
                  handleTransmit(cmd.hex, 'Warna Kuning (C)');
                }}
                className="h-9 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 font-bold text-xs active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              >
                C
              </button>

              <button
                onClick={() => {
                  const cmd = activeBrand.commands.blue || activeBrand.commands.num4;
                  handleTransmit(cmd.hex, 'Warna Biru (D)');
                }}
                className="h-9 rounded-xl bg-blue-500/25 hover:bg-blue-500/35 border border-blue-500/50 text-blue-400 font-bold text-xs active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              >
                D
              </button>
            </div>

          </div>
        )}

        {/* ============================================================
            TAB 4: VIRTUAL TV SIMULATOR
            ============================================================ */}
        {activeTab === 'tv' && (
          <div className="animate-in fade-in duration-150">
            <VirtualTv state={tvState} brand={activeBrand} />
          </div>
        )}

        {/* Footer: Transmission Log Stream & Status Ticker */}
        <div className="pt-2 px-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono truncate max-w-[180px]">
            {lastCommand
              ? `${lastCommand.name} (${lastCommand.hex})`
              : `${activeBrand.name} · Siap`}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (!currentAnalysis) {
                  const defaultCmd = activeBrand.commands.power || Object.values(activeBrand.commands)[0];
                  setCurrentAnalysis(analyzeIrPulse(defaultCmd.hex, activeBrand, defaultCmd.name));
                }
                setIsOscilloscopeOpen(true);
              }}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title="Analisis Gelombang Pulsa IR"
            >
              Oskiloskop
            </button>
            <button
              onClick={() => setIsAndroidCodeModalOpen(true)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title="Kode Android Studio"
            >
              Android Studio
            </button>
            <button
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              {isLogOpen ? 'Tutup Log' : 'Log IR'}
            </button>
          </div>
        </div>

        {/* Collapsible Log Stream */}
        {isLogOpen && (
          <div className="mt-1 p-2 rounded-xl bg-black/90 border border-white/10 font-mono text-[9px] text-amber-300 max-h-24 overflow-y-auto leading-relaxed">
            {logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}

      </div>

      {/* ============================================================
          MODALS: BRAND SELECTOR, OSCILLOSCOPE, ANDROID CODE
          ============================================================ */}

      {/* Brand Selector Modal */}
      {isBrandModalOpen && (
        <BrandSelectorModal
          currentBrandId={activeBrandId}
          onSelectBrand={(id) => {
            setActiveBrandId(id);
            const newBrand = BRANDS[id];
            showToast(`Berganti ke: ${newBrand.name}`);
            addLog(`[BRAND-SWITCH] Perangkat aktif: ${newBrand.name} (${newBrand.frequency / 1000} kHz, ${newBrand.protocol})`);
          }}
          onTestSignal={(brand) => {
            const muteCmd = brand.commands.mute || brand.commands.power;
            const { rawPattern, frequency } = generateRawIrPattern(brand, muteCmd);
            const hasBridge = typeof (window as any).AndroidIR?.transmitIR === 'function';
            if (hasBridge) {
              (window as any).AndroidIR.transmitIR(frequency, rawPattern);
            }
            showToast(`📡 Tes Sinyal Mute -> ${brand.shortName} (${frequency / 1000} kHz)`);
            addLog(`[TEST-SIGNAL] ${brand.name} | Mute (${muteCmd.hex}) -> ${frequency / 1000} kHz`);
          }}
          onClose={() => setIsBrandModalOpen(false)}
        />
      )}

      {/* Oscilloscope Modal */}
      {isOscilloscopeOpen && (
        <OscilloscopeModal
          analysis={currentAnalysis}
          onClose={() => setIsOscilloscopeOpen(false)}
        />
      )}

      {/* Hardware Diagnostics & Android IR Info Modal */}
      {isHardwareInfoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl max-w-lg w-full p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Status Hardware IR Blaster HP</h3>
              </div>
              <button
                onClick={() => setIsHardwareInfoOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              {/* Status Banner */}
              <div className={`p-3.5 rounded-2xl border ${
                hasNativeAndroidIR
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasNativeAndroidIR ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`} />
                  <span>{hasNativeAndroidIR ? 'Hardware IR Terhubung (APK Native)' : 'Mode Browser Web / PWA (Simulasi)'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {hasNativeAndroidIR
                    ? 'Aplikasi berjalan di dalam WebView native dengan izin ConsumerIrManager. Lampu diode IR di ujung atas HP Poco akan memancarkan sinar inframerah fisik ke TV.'
                    : 'Aplikasi berjalan di web browser (Chrome/Edge/PWA). Karena kebijakan keamanan Android, browser web TIDAK memiliki izin sistem untuk menembakkan lampu IR fisik.'}
                </p>
              </div>

              {/* Kenapa Mi Remote Bisa tapi Browser Belum? */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Kenapa Mi Remote Berhasil, tapi Web Belum?
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Aplikasi bawaan <strong>Mi Remote</strong> adalah aplikasi <strong>Android Native (.APK)</strong> yang memiliki izin sistem <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">android.permission.TRANSMIT_IR</code>.
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sedangkan Web Browser / PWA dibatasi oleh sistem sandbox Android agar tidak bisa menyalakan lampu hardware tanpa wrapper native APK.
                </p>
              </div>

              {/* Cara Tes Lampu IR dengan Kamera */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Cara Tes Pancaran Lampu IR Fisik
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Arahkan lubang sensor hitam di atas HP Poco ke lensa kamera HP lain. Di aplikasi APK / Mi Remote, lampu IR akan memancarkan <strong>kedipan cahaya ungu terang</strong> di layar kamera saat tombol ditekan.
                </p>
              </div>

              {/* Solusi Agar HP Memancarkan IR Fisik */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-white">Cara Menembakkan IR Fisik Menggunakan Remote Ini:</h4>
                <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1 leading-relaxed">
                  <li>Buka tombol <strong>Kode Android Studio</strong> di bawah.</li>
                  <li>Kompilasi menjadi APK menggunakan <code className="text-amber-300">MainActivity.kt</code> & <code className="text-amber-300">AndroidManifest.xml</code> yang sudah kami sediakan.</li>
                  <li>Atau pasang file <code className="text-amber-300">index.html</code> ke dalam wrapper APK Android.</li>
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsHardwareInfoOpen(false);
                  setIsAndroidCodeModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold cursor-pointer hover:bg-amber-300 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                <span>Buka Kode APK Android</span>
              </button>

              <button
                onClick={() => setIsHardwareInfoOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Android Studio Code Modal */}
      {isAndroidCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Kode Wrapper Android Studio (Poco / Xiaomi IR)</h3>
              </div>
              <button
                onClick={() => setIsAndroidCodeModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 my-3">
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'html' ? 'bg-amber-400 text-black font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                index.html
              </button>
              <button
                onClick={() => setActiveCodeTab('kotlin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'kotlin' ? 'bg-amber-400 text-black font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                MainActivity.kt
              </button>
              <button
                onClick={() => setActiveCodeTab('manifest')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  activeCodeTab === 'manifest' ? 'bg-amber-400 text-black font-bold' : 'bg-slate-900 text-slate-400'
                }`}
              >
                AndroidManifest.xml
              </button>
            </div>

            {/* Code Box */}
            <div className="flex-1 overflow-auto bg-black/80 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-300 max-h-[50vh]">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold cursor-pointer"
                >
                  {copiedCodeKey === activeCodeTab ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
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
