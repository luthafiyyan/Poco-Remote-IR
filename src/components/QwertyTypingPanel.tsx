import React, { useState, useEffect, useRef } from 'react';
import {
  KeyboardLayoutId,
  BrandProfile,
  AutoTypeStep,
  KeyboardLayoutDef
} from '../types/ir';
import { KEYBOARD_LAYOUTS, planAutoTypeSequence, findCharPosition } from '../utils/tvKeyboardPathfinder';
import {
  Search,
  Mic,
  MicOff,
  Send,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';

interface QwertyTypingPanelProps {
  activeBrand: BrandProfile;
  onSendCommand: (hex: string, name: string) => void;
  onSendRawPattern: (frequency: number, rawPattern: string, name: string) => void;
  soundEnabled: boolean;
  onPlaySound: (type: 'click' | 'nav' | 'key' | 'success') => void;
  onShowToast: (msg: string) => void;
  onAddLog: (msg: string) => void;
  currentTvCursor: { row: number; col: number };
  onUpdateTvCursor: (row: number, col: number) => void;
}

export const QwertyTypingPanel: React.FC<QwertyTypingPanelProps> = ({
  activeBrand,
  onSendCommand,
  soundEnabled,
  onPlaySound,
  onShowToast,
  onAddLog,
  currentTvCursor,
  onUpdateTvCursor,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedLayoutId, setSelectedLayoutId] = useState<KeyboardLayoutId>('youtube_grid');
  const [typingSpeedMs, setTypingSpeedMs] = useState<number>(200); // 160ms, 200ms, 300ms
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [directTypingMode, setDirectTypingMode] = useState<boolean>(true);

  // Auto-typing execution state
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoTypeSteps, setAutoTypeSteps] = useState<AutoTypeStep[]>([]);
  const cancelTypingRef = useRef(false);
  const pauseTypingRef = useRef(false);

  const activeLayout: KeyboardLayoutDef = KEYBOARD_LAYOUTS[selectedLayoutId];

  // Voice Recognition support check
  const hasVoiceRecognition = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const startVoiceSearch = () => {
    if (!hasVoiceRecognition) {
      onShowToast('Fitur Voice Recognition tidak didukung di browser ini.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        onShowToast('🎙️ Mendengarkan suara...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        onShowToast(`Suara terdeteksi: "${transcript}"`);
        onPlaySound('success');
      };

      recognition.onerror = (err: any) => {
        onShowToast(`Gagal suara: ${err.error || 'Terjadi kesalahan'}`);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err: any) {
      onShowToast(`Mic error: ${err.message}`);
      setIsListeningVoice(false);
    }
  };

  /**
   * Helper: Mengirim perintah arah navigasi TV
   */
  const sendNavDirection = (direction: 'up' | 'down' | 'left' | 'right' | 'ok' | 'back') => {
    const cmdMap: Record<string, string | undefined> = {
      up: activeBrand.commands.up?.hex,
      down: activeBrand.commands.down?.hex,
      left: activeBrand.commands.left?.hex,
      right: activeBrand.commands.right?.hex,
      ok: activeBrand.commands.ok?.hex,
      back: activeBrand.commands.back?.hex,
    };

    const hex = cmdMap[direction];
    if (hex) {
      onSendCommand(hex, `${activeBrand.shortName} ${direction.toUpperCase()}`);
    }
  };

  /**
   * Mengirimkan perpindahan satu karakter langsung ke TV
   */
  const handleSingleKeySend = async (char: string) => {
    // 1. Tambahkan ke input box lokal
    setInputText(prev => prev + char);
    onPlaySound('key');

    // 2. Jika Direct Mode aktif, gerakkan kursor TV ke karakter tersebut & tekan OK
    if (directTypingMode) {
      const targetPos = findCharPosition(char, activeLayout);
      if (!targetPos) return;

      const { steps } = planAutoTypeSequence(char, activeLayout, currentTvCursor);
      if (steps.length > 0) {
        const step = steps[0];
        for (const move of step.moves) {
          sendNavDirection(move);
          await new Promise(r => setTimeout(r, typingSpeedMs));
        }
        onUpdateTvCursor(targetPos.row, targetPos.col);
      }
    }
  };

  /**
   * Memulai proses pengetikan otomatis seluruh kalimat ke TV via IR
   */
  const startAutoTypingToTv = async () => {
    if (!inputText.trim()) {
      onShowToast('Ketik kalimat atau judul dulu.');
      return;
    }

    const { steps, totalMoves } = planAutoTypeSequence(inputText, activeLayout, currentTvCursor);
    if (steps.length === 0) {
      onShowToast('Tidak ada karakter yang cocok dengan layout keyboard TV ini.');
      return;
    }

    setAutoTypeSteps(steps);
    setCurrentStepIndex(0);
    setIsAutoTyping(true);
    setIsPaused(false);
    cancelTypingRef.current = false;
    pauseTypingRef.current = false;

    onShowToast(`🚀 Mengetik ${steps.length} huruf (${totalMoves} gerakan IR)...`);
    onAddLog(`[AUTO-TYPIST] Memulai pengetikan: "${inputText}" (${steps.length} char, ${totalMoves} IR pulses)`);

    let curPos = { ...currentTvCursor };

    for (let s = 0; s < steps.length; s++) {
      if (cancelTypingRef.current) break;

      while (pauseTypingRef.current) {
        await new Promise(r => setTimeout(r, 200));
        if (cancelTypingRef.current) break;
      }
      if (cancelTypingRef.current) break;

      setCurrentStepIndex(s);
      const step = steps[s];

      for (const move of step.moves) {
        if (cancelTypingRef.current) break;

        sendNavDirection(move);
        await new Promise(r => setTimeout(r, typingSpeedMs));
      }

      curPos = { ...step.to };
      onUpdateTvCursor(curPos.row, curPos.col);
    }

    if (!cancelTypingRef.current) {
      onShowToast(`✅ Selesai mengetik: "${inputText}" di TV!`);
      onPlaySound('success');
      onAddLog(`[AUTO-TYPIST] Pengetikan selesai sukses.`);
    } else {
      onShowToast(`⏹️ Pengetikan dibatalkan.`);
    }

    setIsAutoTyping(false);
  };

  const cancelAutoTyping = () => {
    cancelTypingRef.current = true;
    setIsAutoTyping(false);
    setIsPaused(false);
  };

  const togglePauseTyping = () => {
    const nextState = !isPaused;
    pauseTypingRef.current = nextState;
    setIsPaused(nextState);
  };

  // Preset YouTube & TV Browser
  const YOUTUBE_PRESETS = [
    'Lofi Beats',
    'Review Gadget',
    'Trailer Film 2026',
    'Podcast',
    'Lagu Pop',
    'Tutorial Coding',
    'Berita Terkini',
    'Gaming Live'
  ];

  const BROWSER_SHORTCUTS = [
    'https://',
    'www.',
    '.com',
    '.id',
    'youtube.com',
    'google.com',
    '/',
    '@'
  ];

  return (
    <div className="w-full flex flex-col space-y-3">
      
      {/* Configuration Bar: Layout & Typing Speed */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
        
        {/* Layout Selector */}
        <div className="flex-1 min-w-0">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Layout Keyboard TV
          </label>
          <select
            value={selectedLayoutId}
            onChange={(e) => setSelectedLayoutId(e.target.value as KeyboardLayoutId)}
            className="w-full h-7 bg-white/[0.06] border border-white/10 rounded-lg px-2 text-[11px] text-white outline-none cursor-pointer focus:border-amber-400"
          >
            {Object.values(KEYBOARD_LAYOUTS).map(l => (
              <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed Selector */}
        <div className="w-28 shrink-0">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Kecepatan IR
          </label>
          <select
            value={typingSpeedMs}
            onChange={(e) => setTypingSpeedMs(Number(e.target.value))}
            className="w-full h-7 bg-white/[0.06] border border-white/10 rounded-lg px-2 text-[11px] text-white outline-none cursor-pointer focus:border-amber-400"
          >
            <option value={150} className="bg-slate-900 text-white">Cepat (150ms)</option>
            <option value={200} className="bg-slate-900 text-white">Normal (200ms)</option>
            <option value={300} className="bg-slate-900 text-white">Santai (300ms)</option>
            <option value={450} className="bg-slate-900 text-white">Akurat (450ms)</option>
          </select>
        </div>

      </div>

      {/* Main Input Suite: Search Box, Mic Voice, Auto-Type Button */}
      <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-lg space-y-2.5">
        
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  startAutoTypingToTv();
                }
              }}
              placeholder="Ketik teks / cari di YouTube atau browser TV..."
              className="w-full h-10 bg-white/[0.06] border border-white/15 rounded-xl pl-9 pr-9 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-medium"
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Voice Search Button */}
          {hasVoiceRecognition && (
            <button
              onClick={startVoiceSearch}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isListeningVoice
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_15px_#f43f5e]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border-white/10'
              }`}
              title="Ketik dengan suara (Speech-to-Text)"
            >
              {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          {/* Send / Auto-Type Button */}
          {!isAutoTyping ? (
            <button
              onClick={startAutoTypingToTv}
              disabled={!inputText.trim()}
              className="h-10 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/25 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Kirim dan ketikkan otomatis ke TV via IR"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>KIRIM</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={togglePauseTyping}
                className="h-10 px-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : 'PAUSE'}
              </button>
              <button
                onClick={cancelAutoTyping}
                className="h-10 px-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            </div>
          )}
        </div>

        {/* Auto-Typing Active Progress Bar */}
        {isAutoTyping && (
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Mengirim Huruf: "{autoTypeSteps[currentStepIndex]?.char}" ({currentStepIndex + 1}/{autoTypeSteps.length})
              </span>
              <span className="font-mono text-slate-400 text-[9.5px]">
                {Math.round(((currentStepIndex + 1) / autoTypeSteps.length) * 100)}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
                style={{
                  width: `${((currentStepIndex + 1) / autoTypeSteps.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* TV Grid Cursor Position & Direct Typist Toggle */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Kursor TV: Baris {currentTvCursor.row}, Kolom {currentTvCursor.col}</span>
            <button
              onClick={() => {
                onUpdateTvCursor(0, 0);
                onShowToast('Kursor direset ke posisi awal (Top-Left)');
              }}
              className="text-amber-400 hover:underline cursor-pointer ml-1"
            >
              Reset ke (0,0)
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={directTypingMode}
              onChange={(e) => setDirectTypingMode(e.target.checked)}
              className="rounded accent-amber-400"
            />
            <span className="text-slate-300 font-medium">Ketik Langsung Per Tombol</span>
          </label>
        </div>

      </div>

      {/* Quick Preset Buttons (YouTube & Browser) */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
          <span className="text-slate-500 font-semibold shrink-0 text-[9px] uppercase tracking-wider">
            YouTube:
          </span>
          {YOUTUBE_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setInputText(p);
                onShowToast(`Pilih: ${p}`);
              }}
              className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-slate-200 whitespace-nowrap active:scale-95 transition-all cursor-pointer font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
          <span className="text-slate-500 font-semibold shrink-0 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-2.5 h-2.5" /> URL:
          </span>
          {BROWSER_SHORTCUTS.map((url) => (
            <button
              key={url}
              onClick={() => {
                setInputText(prev => prev + url);
                onPlaySound('key');
              }}
              className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono text-[10px] whitespace-nowrap active:scale-95 transition-all cursor-pointer"
            >
              {url}
            </button>
          ))}
        </div>
      </div>

      {/* Ergonomic On-Screen QWERTY Keyboard */}
      <div className="p-2.5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-1.5 select-none">
        
        {/* Row 0: Numbers 1 2 3 4 5 6 7 8 9 0 */}
        <div className="flex justify-center gap-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(k => (
            <button
              key={k}
              onClick={() => handleSingleKeySend(k)}
              className="h-8.5 min-w-[26px] flex-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:bg-amber-400 active:text-black border border-white/10 text-slate-200 font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Row 1: Q W E R T Y U I O P */}
        <div className="flex justify-center gap-1">
          {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map(k => (
            <button
              key={k}
              onClick={() => handleSingleKeySend(k)}
              className="h-9 min-w-[26px] flex-1 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Row 2: A S D F G H J K L */}
        <div className="flex justify-center gap-1 px-2">
          {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map(k => (
            <button
              key={k}
              onClick={() => handleSingleKeySend(k)}
              className="h-9 min-w-[26px] flex-1 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Row 3: Z X C V B N M + BKSP */}
        <div className="flex justify-center gap-1">
          {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map(k => (
            <button
              key={k}
              onClick={() => handleSingleKeySend(k)}
              className="h-9 min-w-[26px] flex-1 rounded-xl bg-white/[0.07] hover:bg-white/[0.15] active:bg-amber-400 active:text-black border border-white/10 text-white font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm"
            >
              {k}
            </button>
          ))}
          <button
            onClick={() => {
              setInputText(prev => prev.slice(0, -1));
              onPlaySound('key');
              sendNavDirection('back');
            }}
            className="h-9 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 font-bold text-xs active:scale-90 transition-all cursor-pointer flex items-center justify-center"
            title="Hapus / Backspace di TV"
          >
            ⌫
          </button>
        </div>

        {/* Row 4: .com, SPASI, ENTER */}
        <div className="flex justify-center gap-1 pt-0.5">
          <button
            onClick={() => handleSingleKeySend('.')}
            className="h-9 px-3 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            .
          </button>

          <button
            onClick={() => {
              setInputText(prev => prev + '.com');
              onPlaySound('key');
            }}
            className="h-9 px-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-[11px] font-semibold text-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            .com
          </button>

          <button
            onClick={() => handleSingleKeySend(' ')}
            className="h-9 flex-1 rounded-xl bg-white/[0.09] hover:bg-white/[0.16] active:bg-amber-400 active:text-black border border-white/15 text-white font-bold text-xs tracking-widest active:scale-95 transition-all cursor-pointer"
          >
            SPASI
          </button>

          <button
            onClick={() => {
              onPlaySound('nav');
              sendNavDirection('ok');
              onShowToast('↵ OK / Enter dikirim ke TV');
            }}
            className="h-9 px-3.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 active:bg-amber-400 text-amber-300 active:text-black border border-amber-400/40 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>ENTER</span>
            <span>↵</span>
          </button>
        </div>

      </div>

      {/* Integrated Mini-Thumb D-Pad for Instant Autocomplete & Suggestion Selection */}
      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Navigasi Kursor TV
          </span>
          <span className="text-[10px] text-slate-400">
            Geser pilihan rekomendasi video / hasil pencarian
          </span>
        </div>

        {/* Thumb Direction Cluster */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => sendNavDirection('left')}
            className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:bg-amber-400 active:text-black border border-white/10 flex items-center justify-center text-slate-200 transition-all active:scale-90 cursor-pointer"
            aria-label="Kiri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => sendNavDirection('up')}
              className="w-9 h-8 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:bg-amber-400 active:text-black border border-white/10 flex items-center justify-center text-slate-200 transition-all active:scale-90 cursor-pointer"
              aria-label="Atas"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => sendNavDirection('down')}
              className="w-9 h-8 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:bg-amber-400 active:text-black border border-white/10 flex items-center justify-center text-slate-200 transition-all active:scale-90 cursor-pointer"
              aria-label="Bawah"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => sendNavDirection('right')}
            className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] active:bg-amber-400 active:text-black border border-white/10 flex items-center justify-center text-slate-200 transition-all active:scale-90 cursor-pointer"
            aria-label="Kanan"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => sendNavDirection('ok')}
            className="h-9 px-3 rounded-xl bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-400/25 active:scale-90 transition-all cursor-pointer ml-1"
          >
            PILIH
          </button>

          <button
            onClick={() => sendNavDirection('back')}
            className="w-9 h-9 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-slate-300 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title="Kembali / Back di TV"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
