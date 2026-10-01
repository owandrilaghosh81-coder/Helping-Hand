import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  CheckCircle2,
  FileCode2,
  Zap,
  ShieldCheck,
  Code2,
  Check,
  Bug,
  ListFilter,
  Wrench,
  Search,
  MessageSquare,
  Bot
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  onStartDebugging: () => void;
  onExploreTools: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDebugging, onExploreTools }) => {
  // Animated Preview Sequence State
  const [animStep, setAnimStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 5);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const stepsList = [
    { title: 'ERROR DETECTED', desc: 'TypeError: Cannot read properties of undefined', color: 'text-rose-400', border: 'border-rose-500/40' },
    { title: 'ANALYZING ISSUE', desc: 'Rule Engine & Gemini AI evaluating stack frame...', color: 'text-amber-400', border: 'border-amber-500/40' },
    { title: 'ROOT CAUSE FOUND', desc: 'Uninitialized response key access in UserList.jsx', color: 'text-cyan-400', border: 'border-cyan-500/40' },
    { title: 'FIX GENERATED', desc: 'Applied ES2020 optional chaining: data?.users', color: 'text-brand-400', border: 'border-brand-500/40' },
    { title: 'FIX VALIDATED', desc: '✓ AST Parsed  ✓ Dry-run Execution PASSED', color: 'text-emerald-400', border: 'border-emerald-500/40' },
  ];

  const languages = [
    { name: 'Python', icon: '🐍' },
    { name: 'JavaScript', icon: '🟨' },
    { name: 'TypeScript', icon: '🔷' },
    { name: 'Java', icon: '☕' },
    { name: 'C++', icon: '⚡' },
    { name: 'Go', icon: '🐹' },
    { name: 'Rust', icon: '🦀' },
    { name: 'SQL', icon: '🗄️' },
    { name: 'PHP', icon: '🐘' },
    { name: 'C#', icon: '🎯' },
    { name: 'HTML/CSS', icon: '🌐' },
    { name: 'Bash', icon: '🐚' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 selection:bg-brand-500/30">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-28">

        {/* 1. HERO SECTION */}
        <div className="text-center space-y-8 max-w-4xl mx-auto pt-8">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-medium shadow-glow-brand animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Turn coding errors into understandable solutions.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop guessing your bugs.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">
              Debug with clarity.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Paste an error, upload code, or describe what went wrong. Helping Hand analyzes the problem, explains the root cause, generates a verified fix, and helps prevent future failures.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onStartDebugging}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-semibold text-white text-sm shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Terminal className="w-4 h-4" />
              <span>Start Debugging</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreTools}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-dark-800 border border-white/10 font-semibold text-slate-300 hover:text-white text-sm hover:border-white/20 transition-all"
            >
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Explore Developer Tools</span>
            </button>
          </div>

          {/* 2. ANIMATED DEBUGGING PREVIEW WIDGET */}
          <div className="pt-8">
            <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-white/10 text-left max-w-3xl mx-auto overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-slate-400 ml-2">helping-hand-ai-debugger ~ v1.0.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-mono text-emerald-400">Engine Active</span>
                </div>
              </div>

              {/* Step Sequence Timeline */}
              <div className="pt-5 space-y-3 font-mono text-xs">
                {stepsList.map((step, idx) => {
                  const isActive = idx === animStep;
                  const isDone = idx < animStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${
                        isActive
                          ? `bg-dark-800 ${step.border} shadow-lg scale-[1.01]`
                          : isDone
                          ? 'bg-dark-900/60 border-white/5 opacity-80'
                          : 'opacity-40 border-transparent'
                      }`}
                    >
                      <div className={`mt-0.5 ${step.color}`}>
                        {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Cpu className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${step.color}`}>{step.title}</span>
                          <span className="text-[10px] text-slate-500">STEP 0{idx + 1}</span>
                        </div>
                        <div className="text-slate-300 mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* 3. HOW IT WORKS */}
        <div className="space-y-12 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How Helping Hand Works</h2>
            <p className="text-slate-400 text-sm mt-2">A 5-step intelligent workflow built for modern developers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
            {[
              { num: '01', title: 'Enter Problem', desc: 'Paste error, logs, code, or describe the issue in plain language.' },
              { num: '02', title: 'Auto Detection', desc: 'Detects programming language and error classification.' },
              { num: '03', title: 'AI + Rule Engine', desc: 'Combines pre-built diagnostic rules with Google Gemini AI reasoning.' },
              { num: '04', title: 'Receive Solution', desc: 'Get clear root cause, step-by-step fix, and before/after code diff.' },
              { num: '05', title: 'Validate & Prevent', desc: 'Test the fix in sandbox mode and learn defensive prevention tips.' },
            ].map((step, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl relative border border-white/10 hover:border-brand-500/40 transition-all">
                <div className="text-2xl font-black text-brand-500/40 mb-3 font-mono">{step.num}</div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CORE FEATURES GRID */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Built for Developer Speed & Depth</h2>
            <p className="text-slate-400 text-sm mt-2">Essential questions answered for every bug: What, Why, How, & Prevention</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Rule Engine + Gemini AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic language rules run instantly offline, augmented by Google Gemini AI for deep contextual reasoning.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <FileCode2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Before / After Code Diff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual side-by-side or unified diff viewer highlighting exact code line additions and deletions.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Fix Validation Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulated execution testing verifies AST parsing, error reproduction, and fix success before code application.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">HELPING HAND AI Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Context-aware conversational panel for asking follow-up questions, requesting ELI5 explanations, or requesting unit tests.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">7 Developer Tools</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Code Analyzer, Stack Trace Analyzer, Log Parser, Bug Finder, Code Optimizer, SAST Security Scanner, and Unit Test Generator.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Instant Guest Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No passwords, no sign-ups. Jump straight into debugging your application code immediately.
              </p>
            </div>
          </div>
        </div>

        {/* 5. SUPPORTED LANGUAGES */}
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Supported Languages & Ecosystems</h2>
            <p className="text-slate-400 text-sm mt-1">Auto-detection support for all major tech stacks</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {languages.map((lang, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-850 border border-white/10 text-xs font-medium text-slate-200 hover:border-brand-500/40 hover:bg-dark-800 transition-all"
              >
                <span>{lang.icon}</span>
                <span>{lang.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. WHY HELPING HAND */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Why Developers Choose Helping Hand</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-3 bg-dark-900/60 p-5 rounded-2xl border border-rose-500/20">
              <div className="font-bold text-rose-400 flex items-center gap-2">
                <span>❌ Traditional Search & Generic AI</span>
              </div>
              <ul className="space-y-2 text-slate-400">
                <li>• Generic chatbot responses without code context</li>
                <li>• No before/after diff verification</li>
                <li>• Hallucinated functions and fake fixes</li>
                <li>• Missing root cause explanations</li>
              </ul>
            </div>
            <div className="space-y-3 bg-dark-900/60 p-5 rounded-2xl border border-emerald-500/20">
              <div className="font-bold text-emerald-400 flex items-center gap-2">
                <span>✅ Helping Hand AI Platform</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li>• Deterministic Rule Engine + Google Gemini AI</li>
                <li>• Interactive Before/After Code Diff view</li>
                <li>• AST & Static Fix Validation testing</li>
                <li>• 4-Question breakdown: What, Why, How, Prevent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 7. BOTTOM CTA */}
        <div className="text-center glass-card p-10 rounded-3xl border border-brand-500/30 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to solve your coding errors?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Start debugging immediately in your workspace. Free, fast, and developer-focused.
          </p>
          <div>
            <button
              onClick={onStartDebugging}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-semibold text-white text-sm shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Helping Hand Workspace</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-8 border-t border-white/10 text-center text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-center">
            <BrandLogo size="sm" showTagline />
          </div>
          <div>© {new Date().getFullYear()} HELPING HAND — Your AI-powered debugging companion.</div>
        </footer>

      </div>
    </div>
  );
};
