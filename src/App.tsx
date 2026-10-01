import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { MainWorkspace } from './components/MainWorkspace';
import { AnalysisResultView } from './components/AnalysisResultView';
import { DevToolsWorkspace } from './components/DevToolsWorkspace';
import { CommandPalette } from './components/CommandPalette';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';

import { DebugSession, AnalysisResult, DevToolType, UserSettings, LanguageType, InputMode, ChatMessage } from './types/debug';
import { storage } from './services/storage';
import { analyzeCodingError } from './services/gemini/analyzer';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'debugger' | 'tools'>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Storage State
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [sessions, setSessions] = useState<DebugSession[]>(() => storage.getSessions());
  const [savedFixes, setSavedFixes] = useState<AnalysisResult[]>(() => storage.getSavedFixes());

  // Workspace & Active Session State
  const [activeSession, setActiveSession] = useState<DebugSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  // Active Developer Tool
  const [activeDevTool, setActiveDevTool] = useState<DevToolType>('analyzer');

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync dark class on html root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Handle New Debug trigger
  const handleNewDebug = () => {
    setActiveSession(null);
    setAnalysisResult(null);
    setChatHistory([]);
    setCurrentView('debugger');
  };

  // Handle Analysis Run
  const handleAnalyze = async (inputs: {
    language: LanguageType;
    inputMode: InputMode;
    errorText: string;
    codeText: string;
    describeText: string;
    logText: string;
    fileName?: string;
    fileSize?: string;
  }) => {
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    // Animate progress sequence
    const interval = setInterval(() => {
      setAnalysisStepIndex((prev) => {
        if (prev < 7) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 350);

    try {
      const result = await analyzeCodingError(
        inputs.errorText,
        inputs.codeText,
        inputs.describeText,
        inputs.logText,
        inputs.language
      );

      clearInterval(interval);

      const newSession: DebugSession = {
        id: 'session-' + Date.now(),
        title: result.errorType || 'Debug Session',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: inputs.language,
        inputMode: inputs.inputMode,
        errorText: inputs.errorText,
        codeText: inputs.codeText,
        describeText: inputs.describeText,
        logText: inputs.logText,
        fileName: inputs.fileName,
        fileSize: inputs.fileSize,
        result,
        chatHistory: [
          {
            id: 'init-msg',
            sender: 'assistant',
            text: `Hello! I am **HELPING HAND AI**. I've completed diagnosing your ${result.language.toUpperCase()} error (*${result.errorType}*).\n\nFeel free to ask me follow-up questions, request alternative code solutions, or ask for unit tests!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };

      storage.saveSession(newSession);
      setSessions(storage.getSessions());
      setActiveSession(newSession);
      setAnalysisResult(result);
      setChatHistory(newSession.chatHistory);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSession = (session: DebugSession) => {
    setActiveSession(session);
    setAnalysisResult(session.result || null);
    setChatHistory(session.chatHistory || []);
    setCurrentView('debugger');
  };

  const handleSelectSavedFix = (fix: AnalysisResult) => {
    setAnalysisResult(fix);
    setCurrentView('debugger');
  };

  const handleSelectTool = (tool: DevToolType) => {
    setActiveDevTool(tool);
    setCurrentView('tools');
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-950 text-slate-100 font-sans selection:bg-brand-500/30">
      
      {/* Top Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main App Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Render Sidebar in Debugger & Tools views */}
        {currentView !== 'landing' && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onNewDebug={handleNewDebug}
            recentSessions={sessions}
            savedFixes={savedFixes}
            activeSessionId={activeSession?.id}
            onSelectSession={handleSelectSession}
            onSelectSavedFix={handleSelectSavedFix}
            onSelectTool={handleSelectTool}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'landing' && (
            <LandingPage
              onStartDebugging={() => setCurrentView('debugger')}
              onExploreTools={() => setCurrentView('tools')}
            />
          )}

          {currentView === 'debugger' && (
            analysisResult ? (
              <AnalysisResultView
                result={analysisResult}
                chatHistory={chatHistory}
                onUpdateChatHistory={(newHistory) => {
                  setChatHistory(newHistory);
                  if (activeSession) {
                    const updated = { ...activeSession, chatHistory: newHistory };
                    storage.saveSession(updated);
                  }
                }}
                onNewDebug={handleNewDebug}
              />
            ) : (
              <MainWorkspace
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                analysisStepIndex={analysisStepIndex}
              />
            )
          )}

          {currentView === 'tools' && (
            <DevToolsWorkspace initialTool={activeDevTool} />
          )}
        </main>

      </div>

      {/* Command Palette Keyboard Shortcut Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onSelectTool={handleSelectTool}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewDebug={handleNewDebug}
      />

      {/* History & Saved Fixes Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        recentSessions={sessions}
        savedFixes={savedFixes}
        onSelectSession={handleSelectSession}
        onSelectSavedFix={handleSelectSavedFix}
        onDeleteSession={(id) => {
          storage.deleteSession(id);
          setSessions(storage.getSessions());
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

    </div>
  );
}
