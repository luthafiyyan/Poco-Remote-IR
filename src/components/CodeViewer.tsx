import React, { useState } from 'react';
import { ANDROID_FILES } from '../data/androidFiles';
import { Copy, Check, Download, FileCode, Smartphone, Layers, Terminal } from 'lucide-react';

interface CodeViewerProps {
  standaloneHtml: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ standaloneHtml }) => {
  const [activeTab, setActiveTab] = useState<'html' | 'kotlin' | 'manifest' | 'layout' | 'guide'>('html');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getCodeContent = () => {
    switch (activeTab) {
      case 'html':
        return standaloneHtml;
      case 'kotlin':
        return ANDROID_FILES.mainActivity;
      case 'manifest':
        return ANDROID_FILES.androidManifest;
      case 'layout':
        return ANDROID_FILES.activityMainXml;
      case 'guide':
        return ANDROID_FILES.setupGuide;
    }
  };

  const currentCode = getCodeContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedKey(activeTab);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'html'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>index.html (Single-File)</span>
          </button>

          <button
            onClick={() => setActiveTab('kotlin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'kotlin'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>MainActivity.kt</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'manifest'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AndroidManifest.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'layout'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>activity_main.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Panduan Poco X7 Pro</span>
          </button>
        </div>

        {/* Action Buttons: Copy & Download */}
        <div className="flex items-center gap-2">
          {activeTab === 'html' && (
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
              title="Download file index.html ke komputer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors shadow-sm"
          >
            {copiedKey === activeTab ? (
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

      {/* Code Display Area */}
      <div className="flex-1 p-4 overflow-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed selection:bg-sky-500/30 selection:text-white">
        <pre className="whitespace-pre overflow-x-auto">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {activeTab === 'html' && 'Letakkan file ini di: app/src/main/assets/index.html'}
          {activeTab === 'kotlin' && 'Letakkan file ini di: app/src/main/java/com/example/pocoirremote/MainActivity.kt'}
          {activeTab === 'manifest' && 'Letakkan file ini di: app/src/main/AndroidManifest.xml'}
          {activeTab === 'layout' && 'Letakkan file ini di: app/src/main/res/layout/activity_main.xml'}
          {activeTab === 'guide' && 'Xiaomi HyperOS / Android 14+ ConsumerIrManager Integration'}
        </span>
        <span className="text-slate-500 font-mono">
          {currentCode.split('\n').length} baris
        </span>
      </div>
    </div>
  );
};
