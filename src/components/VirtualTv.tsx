import React from 'react';
import { TvState, BrandProfile } from '../types/ir';
import { KEYBOARD_LAYOUTS } from '../utils/tvKeyboardPathfinder';
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
  Power,
  Search,
  Monitor
} from 'lucide-react';

interface VirtualTvProps {
  state: TvState;
  brand: BrandProfile;
}

const CHANNELS_DATA: Record<number, { title: string; genre: string; program: string; bg: string }> = {
  1: { title: 'Netflix 4K', genre: 'Streaming', program: 'Cyberpunk Neo-Tokyo · Episode 4', bg: 'from-red-950 via-zinc-950 to-black' },
  2: { title: 'YouTube UHD', genre: 'Pencarian YouTube', program: 'Poco IR Remote Smart Typist Mode', bg: 'from-amber-950 via-zinc-950 to-neutral-950' },
  3: { title: 'HBO Max', genre: 'Sci-Fi Cinema', program: 'Dune: Part Two · IMAX HDR10+', bg: 'from-violet-950 via-slate-950 to-black' },
  4: { title: 'Disney+ Hotstar', genre: 'Action Series', program: 'The Mandalorian · Chapter 24', bg: 'from-blue-950 via-slate-950 to-zinc-950' },
  5: { title: 'TVRI HD', genre: 'National Broadcast', program: 'Warta Nasional & Teknologi Indonesia', bg: 'from-emerald-950 via-zinc-950 to-black' },
  6: { title: 'CNN Live HD', genre: 'World News', program: 'Global Tech Breakthroughs 2026', bg: 'from-rose-950 via-neutral-950 to-black' },
  7: { title: 'ESPN Sports', genre: 'Live Sports', program: 'UEFA Champions League Final Replay', bg: 'from-teal-950 via-zinc-950 to-black' },
  8: { title: 'NatGeo 4K', genre: 'Wildlife Doc', program: 'Amazon Rainforest: Hidden Canopy', bg: 'from-green-950 via-zinc-950 to-neutral-950' },
  9: { title: 'Spotify TV', genre: 'Music & Visuals', program: 'Lo-Fi Chill Beats to Relax / Study', bg: 'from-indigo-950 via-zinc-950 to-black' },
  0: { title: 'Smart Art Mode', genre: 'Ambient Gallery', program: 'Starry Night · Ultra-Matte Canvas', bg: 'from-sky-950 via-neutral-950 to-black' },
};

const SMART_APPS = [
  { name: 'YouTube', color: 'bg-red-500' },
  { name: 'Netflix', color: 'bg-red-600' },
  { name: 'Web Browser', color: 'bg-sky-600' },
  { name: 'Disney+', color: 'bg-blue-600' },
  { name: 'Prime Video', color: 'bg-sky-500' },
  { name: 'Spotify', color: 'bg-emerald-500' },
];

export const VirtualTv: React.FC<VirtualTvProps> = ({ state, brand }) => {
  const currentCh = CHANNELS_DATA[state.channel] || CHANNELS_DATA[1];
  const ytLayout = KEYBOARD_LAYOUTS.youtube_grid;

  return (
    <div className="w-full flex flex-col items-center">
      {/* TV Chassis Outer Frame */}
      <div className="w-full max-w-[620px] aspect-[16/9.5] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black p-2.5 rounded-2xl shadow-2xl border border-neutral-700/80 relative flex flex-col">
        
        {/* Bezel Screws / Brand Model Tag */}
        <div className="absolute top-1 left-2 text-[8px] text-amber-400 tracking-widest font-mono uppercase flex items-center gap-1">
          {brand.category === 'tv' ? <Tv className="w-2.5 h-2.5" /> : <Monitor className="w-2.5 h-2.5" />}
          <span>{brand.name} · {brand.frequency / 1000} kHz</span>
        </div>
        <div className="absolute top-1 right-2 flex items-center gap-1.5 text-[8px] text-neutral-400 font-mono">
          <Wifi className="w-2.5 h-2.5 text-emerald-400" />
          <span>IR READY</span>
        </div>

        {/* Display Panel */}
        <div className="relative flex-1 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-white/5 select-none shadow-inner">
          
          {!state.isPowered ? (
            // TV Turned OFF State
            <div className="flex flex-col items-center justify-center gap-2 text-neutral-600">
              <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950">
                <Power className="w-6 h-6 text-red-500/40" />
              </div>
              <span className="text-xs font-medium tracking-wide text-neutral-400">
                {brand.shortName} Standby Mode
              </span>
              <span className="text-[10px] text-neutral-600">Tekan tombol Power di remote untuk menyalakan</span>
            </div>
          ) : (
            // TV Turned ON State
            <div className={`w-full h-full bg-gradient-to-br ${currentCh.bg} p-4 md:p-6 flex flex-col justify-between relative transition-all duration-700 overflow-hidden`}>
              
              {/* Dynamic Screen Ambient Noise / Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />

              {/* Source Badge if not TV */}
              {state.source !== 'TV' && (
                <div className="absolute top-3 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-semibold text-amber-400 flex items-center gap-1.5 z-10">
                  <Tv className="w-3 h-3" />
                  <span>INPUT: {state.source}</span>
                </div>
              )}

              {/* Top Bar: Channel Banner & Audio HUD */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="bg-black/65 backdrop-blur-md border border-white/10 rounded-xl p-2 px-3 flex items-center gap-2.5 shadow-lg">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-xs font-bold">
                    {state.channel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">{currentCh.title}</span>
                      <span className="text-[8.5px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-400/30">
                        HDR10+
                      </span>
                    </div>
                    <div className="text-[9.5px] text-neutral-300 mt-0.5">{currentCh.program}</div>
                  </div>
                </div>

                {/* Audio HUD: Volume / Mute popover */}
                <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-lg">
                  {state.isMuted ? (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold animate-pulse">
                      <VolumeX className="w-4 h-4" />
                      <span>MUTED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <div className="w-14 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                          style={{ width: `${state.volume}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white w-5 text-right">
                        {state.volume}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Area: Simulated On-Screen TV Keyboard / Search Bar */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto">
                
                {/* Search Bar on TV Screen */}
                <div className="w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2 px-3 flex items-center gap-2 shadow-xl mb-2">
                  <Search className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-medium text-white flex-1 truncate">
                    {state.searchQuery || 'Telusuri di YouTube / Browser TV...'}
                  </span>
                  {state.searchQuery && (
                    <span className="text-[9px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">
                      CARI
                    </span>
                  )}
                </div>

                {/* Simulated Mini YouTube Grid On-Screen Keyboard */}
                <div className="bg-black/85 backdrop-blur-lg border border-white/15 rounded-xl p-2 shadow-2xl flex flex-col gap-0.5 scale-90 sm:scale-100">
                  {ytLayout.grid.slice(0, 5).map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1 justify-center">
                      {row.map((char, cIdx) => {
                        const isFocused = state.cursorRow === rIdx && state.cursorCol === cIdx;
                        return (
                          <div
                            key={cIdx}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                              isFocused
                                ? 'bg-amber-400 text-black shadow-[0_0_10px_#fbbf24] scale-110 font-black'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {char}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="text-[8px] text-center text-slate-400 pt-0.5">
                    Kursor aktif TV: Baris {state.cursorRow}, Kolom {state.cursorCol}
                  </div>
                </div>

              </div>

              {/* Bottom Ribbon: Smart Apps Hub */}
              {state.isSmartHubOpen && (
                <div className="relative z-20 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[9.5px] font-bold text-amber-400 tracking-wider uppercase">
                      {brand.shortName} Smart Hub
                    </span>
                    <span className="text-[8.5px] text-neutral-400">Gunakan D-Pad Remote</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {SMART_APPS.map((app, idx) => (
                      <div
                        key={app.name}
                        className={`shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                          state.selectedAppIndex === idx
                            ? 'bg-amber-400/30 border-amber-400 text-white shadow-lg scale-105'
                            : 'bg-white/5 border-white/10 text-neutral-300'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${app.color}`} />
                        <span className="text-[10px] font-medium whitespace-nowrap">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* TV Stand Base */}
        <div className="w-28 h-2 bg-neutral-700 mx-auto rounded-b-lg shadow-md mt-1" />
      </div>
    </div>
  );
};
