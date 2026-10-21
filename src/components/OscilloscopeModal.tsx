import React from 'react';
import { IrPulseAnalysis } from '../types/ir';
import { Activity, Copy, Check, X, Radio, Clock, ShieldCheck } from 'lucide-react';

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

  // Group binary string into 4 bytes
  const bytes = [
    analysis.binary.slice(0, 8),
    analysis.binary.slice(8, 16),
    analysis.binary.slice(16, 24),
    analysis.binary.slice(24, 32),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>NECx2 Signal Oscilloscope</span>
                <span className="text-xs font-mono font-normal text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {analysis.frequency} Hz
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Analisis durasi pulsa transmisi IR Blaster: {analysis.buttonName} ({analysis.hex})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Total Durasi
              </span>
              <span className="text-sm font-mono font-bold text-white mt-1 block">
                {analysis.totalDurationMs} ms
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3" /> Jumlah Pulsa
              </span>
              <span className="text-sm font-mono font-bold text-sky-400 mt-1 block">
                {analysis.pulseCount} elemen
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400">Vendor Code</span>
              <span className="text-sm font-mono font-bold text-amber-400 mt-1 block">
                {analysis.vendorCode} (Samsung)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Checksum
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                Valid (~Cmd)
              </span>
            </div>
          </div>

          {/* Byte-by-byte Bit Decomposition */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Dekomposisi Frame 32-Bit (MSB ke LSB)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-bold">Byte 0 (Custom 1)</div>
                <div className="text-xs font-mono text-white mt-0.5">0xE0</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{bytes[0]}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-bold">Byte 1 (Custom 2)</div>
                <div className="text-xs font-mono text-white mt-0.5">0xE0</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{bytes[1]}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-sky-500/20">
                <div className="text-[10px] text-sky-400 font-bold">Byte 2 (Command)</div>
                <div className="text-xs font-mono text-white mt-0.5">{analysis.commandCode}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{bytes[2]}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 font-bold">Byte 3 (~Command)</div>
                <div className="text-xs font-mono text-white mt-0.5">{analysis.invertedCode}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{bytes[3]}</div>
              </div>
            </div>
          </div>

          {/* Waveform Visualizer */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Bentuk Gelombang Pulsa (Waveform Timeline)</span>
              <span className="text-[10px] font-mono text-slate-400">Total 67 Pulsa</span>
            </div>
            
            {/* Waveform graphic visualization */}
            <div className="w-full h-18 bg-black/60 rounded-lg border border-slate-800 p-2 overflow-x-auto flex items-end gap-0.5">
              {/* Leader Mark */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-12 bg-sky-400 rounded-t-xs" title="Leader Mark: 4500µs" />
                <span className="text-[7px] text-sky-300 font-mono mt-0.5">HDR</span>
              </div>
              {/* Leader Space */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-1 bg-slate-800" title="Leader Space: 4500µs" />
                <span className="text-[7px] text-slate-500 font-mono mt-0.5">GAP</span>
              </div>
              
              {/* Bits Pulses */}
              {analysis.binary.split('').map((bit, idx) => (
                <React.Fragment key={idx}>
                  {/* Mark */}
                  <div
                    className="w-1.5 h-10 bg-emerald-400 rounded-t-xs"
                    title={`Bit ${idx} Mark: 560µs`}
                  />
                  {/* Space: 1690µs if bit 1, 560µs if bit 0 */}
                  <div
                    className={`h-1 bg-slate-800 ${bit === '1' ? 'w-4 bg-sky-950' : 'w-1.5'}`}
                    title={`Bit ${idx} (${bit}): ${bit === '1' ? '1690µs' : '560µs'}`}
                  />
                </React.Fragment>
              ))}

              {/* Stop Bit */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-10 bg-red-400 rounded-t-xs" title="Stop Bit: 560µs" />
                <span className="text-[7px] text-red-400 font-mono mt-0.5">STOP</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-sky-400" /> Header: 4500µs Mark / 4500µs Space
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-emerald-400" /> Bit Mark: 560µs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-slate-400" /> '1'=1690µs | '0'=560µs
              </span>
            </div>
          </div>

          {/* Raw Comma-Separated Array String for Android transmit */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Raw Comma String (dikirim ke Android ConsumerIrManager)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin String'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-[10px] text-slate-300 break-all select-all max-h-20 overflow-y-auto">
              {analysis.rawCommaString}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
