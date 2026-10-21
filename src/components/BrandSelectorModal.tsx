import React, { useState } from 'react';
import { BrandProfile, DeviceCategory } from '../types/ir';
import { BRANDS } from '../data/brands';
import {
  Tv,
  Monitor,
  Search,
  Check,
  X,
  Radio,
  Zap,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface BrandSelectorModalProps {
  currentBrandId: string;
  onSelectBrand: (brandId: string) => void;
  onTestSignal: (brand: BrandProfile) => void;
  onClose: () => void;
}

export const BrandSelectorModal: React.FC<BrandSelectorModalProps> = ({
  currentBrandId,
  onSelectBrand,
  onTestSignal,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | DeviceCategory>('all');
  const [testSuccessBrandId, setTestSuccessBrandId] = useState<string | null>(null);

  const brandList = Object.values(BRANDS);

  const filteredBrands = brandList.filter(brand => {
    const matchesCategory = filterCategory === 'all' || brand.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      brand.name.toLowerCase().includes(query) ||
      brand.shortName.toLowerCase().includes(query) ||
      brand.modelExamples.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleTest = (e: React.MouseEvent, brand: BrandProfile) => {
    e.stopPropagation();
    onTestSignal(brand);
    setTestSuccessBrandId(brand.id);
    setTimeout(() => setTestSuccessBrandId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-white/15 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Pilih Merk TV / Monitor
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {brandList.length} Merk
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Didukung IR Blaster bawaan Poco & Xiaomi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="my-3 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari merk TV atau monitor (Samsung, LG, Polytron, Xiaomi...)"
              className="w-full h-10 bg-white/[0.06] border border-white/15 rounded-xl pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterCategory === 'all'
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
              }`}
            >
              Semua Perangkat
            </button>
            <button
              onClick={() => setFilterCategory('tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterCategory === 'tv'
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Smart TV</span>
            </button>
            <button
              onClick={() => setFilterCategory('monitor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterCategory === 'monitor'
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Monitor PC</span>
            </button>
          </div>
        </div>

        {/* Brand Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
          {filteredBrands.map((brand) => {
            const isSelected = brand.id === currentBrandId;
            const isTested = testSuccessBrandId === brand.id;

            return (
              <div
                key={brand.id}
                onClick={() => {
                  onSelectBrand(brand.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/30'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md"
                    style={{
                      backgroundColor: brand.badgeColor ? `${brand.badgeColor}25` : 'rgba(255,255,255,0.1)',
                      color: brand.badgeColor || '#fff',
                      border: `1px solid ${brand.badgeColor ? `${brand.badgeColor}60` : 'rgba(255,255,255,0.2)'}`
                    }}
                  >
                    {brand.category === 'tv' ? <Tv className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{brand.name}</span>
                      {brand.popularInIndonesia && (
                        <span className="text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                          Populer ID
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {brand.modelExamples}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[9.5px] font-mono text-slate-400">
                      <span className="text-amber-300">{brand.frequency / 1000} kHz</span>
                      <span>·</span>
                      <span className="uppercase text-slate-300">{brand.protocol.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{Object.keys(brand.commands).length} Tombol</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Test Button */}
                  <button
                    onClick={(e) => handleTest(e, brand)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isTested
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10 active:scale-95'
                    }`}
                    title="Uji coba sinyal tombol Mute ke TV ini"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTested ? 'Terkirim!' : 'Tes Mute'}</span>
                  </button>

                  {/* Selection Indicator */}
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Notes */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Poco & Xiaomi otomatis menyesuaikan frekuensi carrier saat berganti merk.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
