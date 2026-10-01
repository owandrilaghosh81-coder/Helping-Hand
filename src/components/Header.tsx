import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Command, Settings, Sun, Moon, Wrench, Terminal, LayoutDashboard, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'debugger' | 'tools';
  onNavigate: (view: 'landing' | 'debugger' | 'tools') => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCommandPalette,
  onOpenSettings,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & View Switcher */}
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('landing')} className="focus:outline-none text-left">
            <BrandLogo size="md" />
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-dark-850 p-1 border border-white/5">
            <button
              onClick={() => onNavigate('landing')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'landing'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Home
            </button>
            <button
              onClick={() => onNavigate('debugger')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'debugger'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Debugger Workspace
            </button>
            <button
              onClick={() => onNavigate('tools')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'tools'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Developer Tools
            </button>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-dark-800 px-3 py-1.5 text-xs text-slate-400 border border-white/10 hover:border-brand-500/50 hover:text-white transition-all shadow-sm"
          >
            <Command className="w-3.5 h-3.5 text-brand-400" />
            <span>Search or type command</span>
            <kbd className="rounded bg-dark-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-white/10">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="rounded-xl bg-dark-800 p-2 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="rounded-xl bg-dark-800 p-2 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* CTA: Start Debugging */}
          {currentView !== 'debugger' && (
            <button
              onClick={() => onNavigate('debugger')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Start Debugging
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
