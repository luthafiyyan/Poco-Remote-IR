import React from 'react';
import { TvState } from '../types/ir';
import {
  Volume2,
  VolumeX,
  Tv,
  Film,
  Compass,
  Radio,
  Sliders,
  Sparkles,
  Wifi,
  Power
} from 'lucide-react';

interface VirtualTvProps {
  state: TvState;
}

const CHANNELS_DATA: Record<number, { title: string; genre: string; program: string; bg: string }> = {
  1: { title: 'Netflix 4K', genre: 'Streaming', program: 'Cyberpunk Neo-Tokyo · Episode 4', bg: 'from-red-950 via-zinc-950 to-black' },
  2: { title: 'YouTube UHD', genre: 'Tech Video', program: 'Poco X7 Pro Hardware Teardown & IR Test', bg: 'from-amber-950 via-zinc-950 to-neutral-950' },
  3: { title: 'HBO Max', genre: 'Sci-Fi Cinema', program: 'Dune: Part Two · IMAX HDR10+', bg: 'from-violet-950 via-slate-950 to-black' },
  4: { title: 'Disney+ Hotstar', genre: 'Action Series', program: 'The Mandalorian · Chapter 24', bg: 'from-blue-950 via-slate-950 to-zinc-950' },
  5: { title: 'TVRI HD', genre: 'National Broadcast', program: 'Warta Nasional & Teknologi Indonesia', bg: 'from-emerald-950 via-zinc-950 to-black' },
  6: { title: 'CNN Live HD', genre: 'World News', program: 'Global Tech Breakthroughs 2026', bg: 'from-rose-950 via-neutral-950 to-black' },
  7: { title: 'ESPN Sports', genre: 'Live Sports', program: 'UEFA Champions League Final Replay', bg: 'from-teal-950 via-zinc-950 to-black' },
  8: { title: 'NatGeo 4K', genre: 'Wildlife Doc', program: 'Amazon Rainforest: Hidden Canopy', bg: 'from-green-950 via-zinc-950 to-neutral-950' },
  9: { title: 'Spotify TV', genre: 'Music & Visuals', program: 'Lo-Fi Chill Beats to Relax / Study', bg: 'from-indigo-950 via-zinc-950 to-black' },
  0: { title: 'Samsung Art Mode', genre: 'Ambient Gallery', program: 'Starry Night · Ultra-Matte Canvas', bg: 'from-sky-950 via-neutral-950 to-black' },
};

const SMART_APPS = [
  { name: 'Netflix', color: 'bg-red-600' },
  { name: 'YouTube', color: 'bg-red-500' },
  { name: 'Disney+', color: 'bg-blue-600' },
  { name: 'Prime Video', color: 'bg-sky-500' },
  { name: 'Spotify', color: 'bg-emerald-500' },
  { name: 'Web Browser', color: 'bg-slate-700' },
];

export const VirtualTv: React.FC<VirtualTvProps> = ({ state }) => {
  const currentCh = CHANNELS_DATA[state.channel] || CHANNELS_DATA[1];

  return (
    <div className="w-full flex flex-col items-center">
      {/* TV Chassis Outer Frame */}
      <div className="w-full max-w-[620px] aspect-[16/9.5] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black p-2.5 rounded-2xl shadow-2xl border border-neutral-700/80 relative flex flex-col">
        
        {/* Bezel Screws / Metallic Edge */}
        <div className="absolute top-1 left-2 text-[8px] text-neutral-600 tracking-widest font-mono">
          SAMSUNG QLED 4K 144Hz
        </div>
        <div className="absolute top-1 right-2 flex items-center gap-1.5 text-[8px] text-neutral-500 font-mono">
          <Wifi className="w-2.5 h-2.5 text-emerald-500" />
          <span>CONNECTED</span>
        </div>

        {/* Display Panel */}
        <div className="relative flex-1 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/5 select-none shadow-inner">
          
          {!state.isPowered ? (
            // TV Turned OFF State
            <div className="flex flex-col items-center justify-center gap-3 text-neutral-600">
              <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950">
                <Power className="w-6 h-6 text-red-500/40" />
              </div>
              <span className="text-xs font-medium tracking-wide text-neutral-500">Standby Mode</span>
              <span className="text-[10px] text-neutral-600">Tekan tombol Power di remote untuk menyalakan</span>
            </div>
          ) : (
            // TV Turned ON State
            <div className={`w-full h-full bg-gradient-to-br ${currentCh.bg} p-6 flex flex-col justify-between relative transition-all duration-700 overflow-hidden`}>
              
              {/* Dynamic Screen Ambient Noise / Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />

              {/* Source Badge if not TV */}
              {state.source !== 'TV' && (
                <div className="absolute top-3 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-semibold text-sky-400 flex items-center gap-1.5 z-10">
                  <Tv className="w-3 h-3" />
                  <span>INPUT: {state.source}</span>
                </div>
              )}

              {/* Top Bar: Channel Banner */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="bg-black/65 backdrop-blur-md border border-white/10 rounded-xl p-2.5 px-3 flex items-center gap-3 shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {state.channel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">{currentCh.title}</span>
                      <span className="text-[9px] bg-sky-500/20 text-sky-300 font-semibold px-1.5 py-0.2 rounded border border-sky-500/30">
                        UHD HDR10+
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-300 mt-0.5">{currentCh.program}</div>
                  </div>
                </div>

                {/* Audio HUD: Volume / Mute popover */}
                <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-lg">
                  {state.isMuted ? (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold animate-pulse">
                      <VolumeX className="w-4 h-4" />
                      <span>MUTED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                          style={{ width: `${state.volume}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-white w-6 text-right">
                        {state.volume}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Area: Visual content showcase */}
              <div className="relative z-10 text-center flex flex-col items-center justify-center my-auto">
                <div className="inline-flex items-center gap-2 text-xs text-neutral-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{currentCh.genre}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                  {currentCh.program.split('·')[0]}
                </h3>
              </div>

              {/* Bottom Ribbon: Tizen Smart Hub (when active) */}
              {state.isSmartHubOpen && (
                <div className="relative z-20 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                      Tizen Smart Hub
                    </span>
                    <span className="text-[9px] text-neutral-400">Tekan D-Pad OK untuk membuka</span>
                  </div>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {SMART_APPS.map((app, idx) => (
                      <div
                        key={app.name}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                          state.selectedAppIndex === idx
                            ? 'bg-sky-500/30 border-sky-400 text-white shadow-lg shadow-sky-500/20 scale-105'
                            : 'bg-white/5 border-white/10 text-neutral-300'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${app.color}`} />
                        <span className="text-[11px] font-medium whitespace-nowrap">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Selector Overlay */}
              {state.isMenuOpen && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-in fade-in duration-200">
                  <div className="bg-neutral-900 border border-white/15 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                      <Sliders className="w-4 h-4 text-sky-400" />
                      <span>Pengaturan Cepat & Input TV</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-neutral-300">
                      <div className="p-2 rounded-lg bg-white/5 flex justify-between items-center">
                        <span>Mode Gambar:</span>
                        <span className="font-semibold text-sky-400">Filmmaker Mode (HDR)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 flex justify-between items-center">
                        <span>Output Suara:</span>
                        <span className="font-semibold text-emerald-400">eARC / Soundbar 5.1</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 flex justify-between items-center">
                        <span>Eco Sensor:</span>
                        <span className="text-neutral-400">Mati</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 flex justify-between items-center">
                        <span>Input Aktif:</span>
                        <span className="font-semibold text-amber-400">{state.source}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400 text-center mt-3">
                      Tekan EXIT di remote untuk menutup menu
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Toast Notification on TV Screen */}
          {state.notification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-lg border border-sky-500/40 px-4 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
              {state.notification}
            </div>
          )}

        </div>

        {/* TV Bottom Chin & Brand Logo */}
        <div className="h-6 flex items-center justify-center relative mt-1">
          <span className="text-[10px] font-extrabold tracking-[3px] text-neutral-400 hover:text-white transition-colors">
            SAMSUNG
          </span>
          {/* Hardware Standby LED */}
          <div
            className={`absolute right-4 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              !state.isPowered
                ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                : 'bg-emerald-500/40'
            }`}
            title={state.isPowered ? 'TV Active' : 'Standby LED'}
          />
        </div>

      </div>

      {/* Stand Base */}
      <div className="w-28 h-2.5 bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-b-lg shadow-md -mt-0.5 border-t border-white/10" />
      <div className="w-48 h-1.5 bg-neutral-800 rounded-full shadow-lg" />
    </div>
  );
};
