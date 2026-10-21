import React from 'react';
import { IrPulseAnalysis } from '../types/ir';
import { Activity, Copy, Check, X, Radio, Clock, ShieldCheck, Zap } from 'lucide-react';

interface OscilloscopeModalProps {
  analysis: IrPulseAnalysis | null;
  onClose: () => void;
}

export const OscilloscopeModal: React.FC<OscilloscopeModalProps> = ({ analysis, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!analysis) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.rawCommaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group binary string into 4 bytes if 32 bits
  const bytes = [];
  for (let i = 0; i < analysis.binary.length; i += 8) {
    bytes.push(analysis.binary.slice(i, i + 8));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0c101d] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>IR Pulse Oscilloscope</span>
                <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {analysis.frequency / 1000} kHz · {analysis.protocolName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {analysis.brandName}: {analysis.buttonName} ({analysis.hex})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-slate-200">
          
          {/* Signal Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400" /> Carrier Freq
              </span>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {analysis.frequency.toLocaleString()} Hz
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" /> Jumlah Pulsa
              </span>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {analysis.pulseCount} Elemen
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> Total Durasi
              </span>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {analysis.totalDurationMs} ms
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-violet-400" /> Validitas Checksum
              </span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                {analysis.isValidChecksum ? 'VALID ✓' : 'STANDAR'}
              </div>
            </div>
          </div>

          {/* Binary Representation */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              Struktur Biner ({analysis.binary.length} bit):
            </span>
            <div className="flex flex-wrap gap-2">
              {bytes.map((byte, idx) => (
                <div key={idx} className="bg-black/60 px-2.5 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
                  <span className="text-[9px] text-slate-500 block">Byte {idx}</span>
                  <span className="text-amber-300 tracking-wider font-bold">{byte}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Comma String for Android ConsumerIrManager */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Pola Pulsa Mikrodetik (Array Android ConsumerIrManager):
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Pola'}</span>
              </button>
            </div>
            <div className="bg-black/80 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto break-all leading-relaxed">
              {analysis.rawCommaString}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ditransmisikan pada: {analysis.timestamp}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
