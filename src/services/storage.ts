import { DebugSession, UserSettings, AnalysisResult } from '../types/debug';

const SETTINGS_KEY = 'helping_hand_settings';
const SESSIONS_KEY = 'helping_hand_sessions';
const SAVED_FIXES_KEY = 'helping_hand_saved_fixes';

export const defaultSettings: UserSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  theme: 'dark',
  autoDetectLanguage: true,
  enableRuleEngine: true,
  enableExecutionValidation: true,
  codeEditorFont: 'JetBrains Mono',
};

export const storage = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  getSessions(): DebugSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSession(session: DebugSession): void {
    try {
      const sessions = this.getSessions();
      const existingIdx = sessions.findIndex((s) => s.id === session.id);
      if (existingIdx >= 0) {
        sessions[existingIdx] = session;
      } else {
        sessions.unshift(session);
      }
      // Store max 30 sessions
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 30)));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter((s) => s.id !== id);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  getSavedFixes(): AnalysisResult[] {
    try {
      const data = localStorage.getItem(SAVED_FIXES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveFix(result: AnalysisResult): boolean {
    try {
      const saved = this.getSavedFixes();
      const idx = saved.findIndex((r) => r.id === result.id);
      let isSaved = false;
      if (idx >= 0) {
        saved.splice(idx, 1);
        isSaved = false;
      } else {
        saved.unshift(result);
        isSaved = true;
      }
      localStorage.setItem(SAVED_FIXES_KEY, JSON.stringify(saved));
      return isSaved;
    } catch (e) {
      console.error('Failed to toggle save fix', e);
      return false;
    }
  },

  isFixSaved(id: string): boolean {
    const saved = this.getSavedFixes();
    return saved.some((r) => r.id === id);
  }
};
