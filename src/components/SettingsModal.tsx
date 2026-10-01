import React, { useState } from 'react';
import { Settings, Key, Shield, Cpu, Moon, Sun, X, Save, Check } from 'lucide-react';
import { UserSettings } from '../types/debug';
import { storage } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-dark-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Platform Settings & AI Configuration</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-400" />
              <span>Google Gemini API Key (Optional)</span>
            </label>
            <input
              type="password"
              value={formData.geminiApiKey}
              onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="w-full rounded-xl bg-dark-900 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Keys are stored locally in browser storage and never uploaded to public servers.</span>
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Gemini Model Selection</span>
            </label>
            <select
              value={formData.geminiModel}
              onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value })}
              className="w-full rounded-xl bg-dark-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, Recommended for Debugging)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Enable Offline Rule-Based Debug Engine</span>
              <input
                type="checkbox"
                checked={formData.enableRuleEngine}
                onChange={(e) => setFormData({ ...formData, enableRuleEngine: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Enable Fix Execution Validation Testing</span>
              <input
                type="checkbox"
                checked={formData.enableExecutionValidation}
                onChange={(e) => setFormData({ ...formData, enableExecutionValidation: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Auto-Detect Programming Language</span>
              <input
                type="checkbox"
                checked={formData.autoDetectLanguage}
                onChange={(e) => setFormData({ ...formData, autoDetectLanguage: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {savedMessage && (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-all shadow-glow-brand"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
