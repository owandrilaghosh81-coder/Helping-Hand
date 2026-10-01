import React, { useState, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  AlertCircle,
  FileSearch,
  ListFilter,
  Code2,
  Bug,
  Zap,
  ShieldAlert,
  TestTube,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { DevToolType } from '../types/debug';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'landing' | 'debugger' | 'tools') => void;
  onSelectTool: (tool: DevToolType) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewDebug: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectTool,
  onOpenSettings,
  onOpenHistory,
  onNewDebug,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'New Debugging Session', icon: <PlusCircle className="w-4 h-4 text-brand-400" />, action: () => { onNewDebug(); onNavigate('debugger'); onClose(); } },
    { label: 'Analyze Error Workspace', icon: <AlertCircle className="w-4 h-4 text-rose-400" />, action: () => { onNavigate('debugger'); onClose(); } },
    { label: 'Developer Tool: Code Analyzer', icon: <Code2 className="w-4 h-4 text-cyan-400" />, action: () => { onSelectTool('analyzer'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Stack Trace Analyzer', icon: <FileSearch className="w-4 h-4 text-indigo-400" />, action: () => { onSelectTool('stacktrace'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Log Analyzer', icon: <ListFilter className="w-4 h-4 text-emerald-400" />, action: () => { onSelectTool('log'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Bug Finder', icon: <Bug className="w-4 h-4 text-amber-400" />, action: () => { onSelectTool('bugfinder'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Code Optimizer', icon: <Zap className="w-4 h-4 text-blue-400" />, action: () => { onSelectTool('optimizer'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Security Scanner', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, action: () => { onSelectTool('security'); onNavigate('tools'); onClose(); } },
    { label: 'Developer Tool: Unit Test Generator', icon: <TestTube className="w-4 h-4 text-purple-400" />, action: () => { onSelectTool('unittest'); onNavigate('tools'); onClose(); } },
    { label: 'Open Debug History & Saved Fixes', icon: <Clock className="w-4 h-4 text-amber-400" />, action: () => { onOpenHistory(); onClose(); } },
    { label: 'Open Settings & API Key Config', icon: <Settings className="w-4 h-4 text-slate-400" />, action: () => { onOpenSettings(); onClose(); } },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-dark-900">
          <Search className="w-4 h-4 text-brand-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH HELPING HAND (e.g. Analyze error, Security scan...)"
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400">No matching commands found</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={cmd.action}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-300 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/40 border border-transparent transition-all"
              >
                {cmd.icon}
                <span className="font-medium text-xs">{cmd.label}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-dark-950 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Press <kbd className="px-1 bg-dark-800 rounded">ESC</kbd> to close</span>
          <span>HELPING HAND Command Palette</span>
        </div>

      </div>
    </div>
  );
};
