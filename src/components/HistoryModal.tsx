import React, { useState } from 'react';
import { Clock, Bookmark, Search, Trash2, ArrowRight, X, Terminal } from 'lucide-react';
import { DebugSession, AnalysisResult } from '../types/debug';
import { storage } from '../services/storage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentSessions: DebugSession[];
  savedFixes: AnalysisResult[];
  onSelectSession: (session: DebugSession) => void;
  onSelectSavedFix: (fix: AnalysisResult) => void;
  onDeleteSession: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  recentSessions,
  savedFixes,
  onSelectSession,
  onSelectSavedFix,
  onDeleteSession,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = recentSessions.filter((s) =>
    (s.title + ' ' + s.language + ' ' + (s.result?.errorType || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSaved = savedFixes.filter((f) =>
    (f.errorType + ' ' + f.language + ' ' + f.rootCause).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-dark-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Debug Session History & Saved Fixes</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className="p-4 border-b border-white/5 bg-dark-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-dark-900 p-1 border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'recent' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Sessions ({recentSessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'saved' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved Fixes ({savedFixes.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full rounded-xl bg-dark-900 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
          {activeTab === 'recent' ? (
            filteredSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic">No recent debug sessions found</div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="glass-card p-3 rounded-xl border border-white/5 hover:border-brand-500/40 flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex-1 truncate cursor-pointer" onClick={() => { onSelectSession(session); onClose(); }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{session.result?.errorType || session.title}</span>
                      <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] uppercase font-mono">{session.language}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{session.result?.summary || session.errorText}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{session.timestamp}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { onSelectSession(session); onClose(); }}
                      className="p-1.5 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white transition-all"
                      title="Load Session"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredSaved.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic">No saved fixes found</div>
            ) : (
              filteredSaved.map((fix) => (
                <div
                  key={fix.id}
                  onClick={() => { onSelectSavedFix(fix); onClose(); }}
                  className="glass-card p-4 rounded-xl border border-white/5 hover:border-amber-500/40 cursor-pointer space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">{fix.errorType}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] uppercase font-mono">{fix.language}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{fix.summary}</p>
                  <div className="p-2 rounded bg-dark-900 font-mono text-[11px] text-emerald-400 border border-emerald-500/20 truncate">
                    {fix.suggestedFix}
                  </div>
                </div>
              ))
            )
          )}
        </div>

      </div>
    </div>
  );
};
