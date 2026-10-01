import React, { useState } from 'react';
import {
  Wrench,
  Code2,
  FileSearch,
  ListFilter,
  Bug,
  Zap,
  ShieldAlert,
  TestTube,
  Play,
  Copy,
  Check,
  Cpu
} from 'lucide-react';
import { DevToolType } from '../types/debug';
import { runDeveloperTool, DevToolResult } from '../services/devToolsService';

interface DevToolsWorkspaceProps {
  initialTool?: DevToolType;
}

export const DevToolsWorkspace: React.FC<DevToolsWorkspaceProps> = ({ initialTool = 'analyzer' }) => {
  const [activeTool, setActiveTool] = useState<DevToolType>(initialTool);
  const [inputCode, setInputCode] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('javascript');
  const [result, setResult] = useState<DevToolResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const toolsList: Array<{ type: DevToolType; label: string; icon: React.ReactNode; description: string }> = [
    { type: 'analyzer', label: 'Code Analyzer', icon: <Code2 className="w-5 h-5 text-cyan-400" />, description: 'Analyze cyclomatic complexity, maintainability index, and code smells.' },
    { type: 'stacktrace', label: 'Stack Trace Analyzer', icon: <FileSearch className="w-5 h-5 text-indigo-400" />, description: 'Deconstruct complex callstacks into actionable trace frames.' },
    { type: 'log', label: 'Log Analyzer', icon: <ListFilter className="w-5 h-5 text-emerald-400" />, description: 'Parse raw log streams, detect error bursts, and isolate root causes.' },
    { type: 'bugfinder', label: 'Bug Finder', icon: <Bug className="w-5 h-5 text-amber-400" />, description: 'Scan code for latent edge-case bugs and unhandled promises.' },
    { type: 'optimizer', label: 'Code Optimizer', icon: <Zap className="w-5 h-5 text-blue-400" />, description: 'Identify algorithmic bottlenecks and receive refactored code.' },
    { type: 'security', label: 'Security Scanner', icon: <ShieldAlert className="w-5 h-5 text-rose-400" />, description: 'Audit code for SAST security vulnerabilities (SQLi, XSS, secrets).' },
    { type: 'unittest', label: 'Unit Test Generator', icon: <TestTube className="w-5 h-5 text-purple-400" />, description: 'Generate comprehensive unit test suites for normal & edge inputs.' },
  ];

  const handleRunTool = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runDeveloperTool(activeTool, inputCode, selectedLang);
      setResult(res);
      setIsRunning(false);
    }, 1000);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolInfo = toolsList.find((t) => t.type === activeTool)!;

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 text-slate-100 overflow-y-auto">
      
      {/* Tool Header */}
      <div className="p-6 border-b border-white/10 bg-dark-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
            {currentToolInfo.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{currentToolInfo.label}</span>
            </h1>
            <p className="text-xs text-slate-400">{currentToolInfo.description}</p>
          </div>
        </div>

        <button
          onClick={handleRunTool}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-semibold text-white text-xs shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
        >
          {isRunning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Analyzing...' : `Run ${currentToolInfo.label}`}</span>
        </button>
      </div>

      {/* Tools Selector Navigation */}
      <div className="px-6 py-3 bg-dark-900/80 border-b border-white/5 flex gap-2 overflow-x-auto text-xs">
        {toolsList.map((tool) => (
          <button
            key={tool.type}
            onClick={() => {
              setActiveTool(tool.type);
              setResult(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all ${
              activeTool === tool.type
                ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                : 'bg-dark-850 text-slate-400 border-white/10 hover:text-white hover:bg-dark-800'
            }`}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Tool Content Workbench */}
      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Code Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="font-semibold text-white">Input Code / Stack Trace / Log Stream</label>
            <span>Target Language: {selectedLang.toUpperCase()}</span>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`Paste content for ${currentToolInfo.label}...`}
            rows={8}
            className="w-full rounded-2xl bg-dark-900 border border-white/10 p-4 font-mono text-xs text-slate-200 focus:border-brand-500 focus:outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Results Display */}
        {result && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{result.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{result.summary}</p>
              </div>
              {result.score !== undefined && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  <span>Score: {result.score}/100</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {result.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">{sec.heading}</h4>
                  
                  {sec.type === 'list' && (
                    <ul className="space-y-1.5 text-xs text-slate-200 font-mono">
                      {sec.content.map((item: string, i: number) => (
                        <li key={i} className="p-2 rounded-lg bg-dark-900/60 border border-white/5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.type === 'text' && (
                    <div className="p-3 rounded-xl bg-dark-900 text-xs text-slate-300 border border-white/5">
                      {sec.content}
                    </div>
                  )}

                  {sec.type === 'code' && (
                    <div className="relative group">
                      <pre className="p-4 rounded-xl bg-dark-900 text-xs font-mono text-emerald-300 overflow-x-auto border border-white/10">
                        {sec.content}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(sec.content)}
                        className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-dark-800 text-slate-300 border border-white/10 text-xs hover:text-white"
                      >
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
