import React, { useState } from 'react';
import { Copy, Check, Split, AlignJustify } from 'lucide-react';

interface CodeDiffViewerProps {
  originalCode: string;
  fixedCode: string;
  language: string;
  onApplyFix?: () => void;
  onExplainFix?: () => void;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  originalCode,
  fixedCode,
  language,
  onApplyFix,
  onExplainFix,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const originalLines = originalCode.split('\n');
  const fixedLines = fixedCode.split('\n');

  return (
    <div className="rounded-2xl border border-white/10 bg-dark-900 overflow-hidden shadow-2xl">
      
      {/* Diff Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-850 border-b border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">BEFORE / AFTER CODE DIFF</span>
          <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono capitalize">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-dark-900 p-0.5 border border-white/5">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1 rounded ${viewMode === 'split' ? 'bg-dark-750 text-white' : 'text-slate-400'}`}
              title="Split View"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`p-1 rounded ${viewMode === 'unified' ? 'bg-dark-750 text-white' : 'text-slate-400'}`}
              title="Unified View"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Fix' : 'Copy Fix'}</span>
          </button>
        </div>
      </div>

      {/* Diff Code View */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 font-mono text-xs overflow-x-auto">
          {/* Left Column: Original */}
          <div className="p-4 bg-dark-950/60">
            <div className="text-[11px] font-semibold text-rose-400 pb-2 border-b border-rose-500/20 mb-3 flex items-center gap-1.5">
              <span>CURRENT CODE (BROKEN)</span>
            </div>
            <div className="space-y-1">
              {originalLines.map((line, idx) => (
                <div key={idx} className="flex gap-3 text-slate-400">
                  <span className="w-6 text-right select-none text-slate-600 text-[10px]">{idx + 1}</span>
                  <span className="whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Suggested Fix */}
          <div className="p-4 bg-emerald-950/10">
            <div className="text-[11px] font-semibold text-emerald-400 pb-2 border-b border-emerald-500/20 mb-3 flex items-center gap-1.5">
              <span>SUGGESTED FIX (RESOLVED)</span>
            </div>
            <div className="space-y-1">
              {fixedLines.map((line, idx) => (
                <div key={idx} className="flex gap-3 text-emerald-300 bg-emerald-500/10 rounded px-1">
                  <span className="w-6 text-right select-none text-emerald-600 text-[10px]">{idx + 1}</span>
                  <span className="whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="p-4 font-mono text-xs space-y-1 overflow-x-auto">
          <div className="text-slate-400 text-[11px] pb-2 border-b border-white/10 mb-3">UNIFIED DIFF VIEW</div>
          {originalLines.map((line, idx) => (
            <div key={'orig-' + idx} className="diff-removed px-2 py-0.5 text-rose-300 flex items-center gap-3">
              <span className="w-4 select-none font-bold text-rose-500">-</span>
              <span className="whitespace-pre-wrap">{line}</span>
            </div>
          ))}
          {fixedLines.map((line, idx) => (
            <div key={'fix-' + idx} className="diff-added px-2 py-0.5 text-emerald-300 flex items-center gap-3">
              <span className="w-4 select-none font-bold text-emerald-500">+</span>
              <span className="whitespace-pre-wrap">{line}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="p-3 bg-dark-850 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {onApplyFix && (
            <button
              onClick={onApplyFix}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-sm"
            >
              Apply Fix Review
            </button>
          )}
          {onExplainFix && (
            <button
              onClick={onExplainFix}
              className="px-4 py-2 rounded-xl bg-dark-750 text-slate-200 border border-white/10 hover:text-white hover:bg-dark-700 transition-all"
            >
              Explain Fix Deep-Dive
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400 italic">Review before accepting code mutations</span>
      </div>

    </div>
  );
};
