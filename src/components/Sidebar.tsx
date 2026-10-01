import React from 'react';
import {
  PlusCircle,
  Clock,
  Bookmark,
  Code2,
  FileSearch,
  ListFilter,
  Bug,
  Zap,
  ShieldAlert,
  TestTube,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { DebugSession, DevToolType, AnalysisResult } from '../types/debug';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewDebug: () => void;
  recentSessions: DebugSession[];
  savedFixes: AnalysisResult[];
  activeSessionId?: string;
  onSelectSession: (session: DebugSession) => void;
  onSelectSavedFix: (fix: AnalysisResult) => void;
  onSelectTool: (tool: DevToolType) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onNewDebug,
  recentSessions,
  savedFixes,
  activeSessionId,
  onSelectSession,
  onSelectSavedFix,
  onSelectTool,
  onOpenSettings,
}) => {
  const toolsList: Array<{ type: DevToolType; label: string; icon: React.ReactNode }> = [
    { type: 'analyzer', label: 'Code Analyzer', icon: <Code2 className="w-4 h-4 text-cyan-400" /> },
    { type: 'stacktrace', label: 'Stack Trace Analyzer', icon: <FileSearch className="w-4 h-4 text-indigo-400" /> },
    { type: 'log', label: 'Log Analyzer', icon: <ListFilter className="w-4 h-4 text-emerald-400" /> },
    { type: 'bugfinder', label: 'Bug Finder', icon: <Bug className="w-4 h-4 text-amber-400" /> },
    { type: 'optimizer', label: 'Code Optimizer', icon: <Zap className="w-4 h-4 text-blue-400" /> },
    { type: 'security', label: 'Security Scanner', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { type: 'unittest', label: 'Unit Test Generator', icon: <TestTube className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-white/10 bg-dark-900 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-dark-800 text-slate-400 border border-white/10 hover:text-white hover:bg-dark-750 transition-all shadow-md"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Main Action: New Debug */}
      <div className="p-3">
        <button
          onClick={onNewDebug}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-2.5 px-3 text-xs font-semibold text-white shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all transform active:scale-95 ${
            collapsed ? 'p-2.5' : ''
          }`}
          title="New Debug Session"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Debug</span>}
        </button>
      </div>

      {/* Scrollable Nav Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">

        {/* Section: Recent Errors */}
        {!collapsed && (
          <div>
            <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Recent Errors</span>
            </div>
            {recentSessions.length === 0 ? (
              <div className="px-2 py-3 text-xs text-slate-400 italic">No recent debug sessions</div>
            ) : (
              <div className="space-y-1">
                {recentSessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className={`group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-left transition-all ${
                      activeSessionId === session.id
                        ? 'bg-brand-500/20 text-brand-300 font-medium border border-brand-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2">
                      <div className="truncate font-mono text-[11px] text-slate-300 group-hover:text-white">
                        {session.result?.errorType || session.title || 'Debugging Session'}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{session.language}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section: Saved Fixes */}
        {!collapsed && savedFixes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Saved Fixes ({savedFixes.length})</span>
            </div>
            <div className="space-y-1">
              {savedFixes.slice(0, 4).map((fix) => (
                <button
                  key={fix.id}
                  onClick={() => onSelectSavedFix(fix)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 text-left truncate transition-all"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate text-[11px]">{fix.errorType}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Developer Tools */}
        <div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Developer Tools</span>
            </div>
          )}
          <div className="space-y-1">
            {toolsList.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onSelectTool(tool.type)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all ${
                  collapsed ? 'justify-center p-2' : ''
                }`}
                title={tool.label}
              >
                {tool.icon}
                {!collapsed && <span className="truncate">{tool.label}</span>}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer: Settings */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onOpenSettings}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};
