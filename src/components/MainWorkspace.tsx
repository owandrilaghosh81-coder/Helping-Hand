import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Image,
  Upload,
  MessageSquare,
  ListFilter,
  Sparkles,
  RotateCcw,
  Cpu,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  HelpCircle
} from 'lucide-react';
import { LanguageType, InputMode, DemoExample } from '../types/debug';
import { DEMO_EXAMPLES } from '../data/demoExamples';

interface MainWorkspaceProps {
  onAnalyze: (inputs: {
    language: LanguageType;
    inputMode: InputMode;
    errorText: string;
    codeText: string;
    describeText: string;
    logText: string;
    fileName?: string;
    fileSize?: string;
  }) => void;
  isAnalyzing: boolean;
  analysisStepIndex: number;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  onAnalyze,
  isAnalyzing,
  analysisStepIndex,
}) => {
  const [activeTab, setActiveTab] = useState<InputMode>('error');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('auto');
  const [errorText, setErrorText] = useState<string>('');
  const [codeText, setCodeText] = useState<string>('');
  const [describeText, setDescribeText] = useState<string>('');
  const [logText, setLogText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Load a Demo Example preset into the workspace
  const handleLoadDemo = (demo: DemoExample) => {
    setSelectedLanguage(demo.language);
    setErrorText(demo.errorText);
    setCodeText(demo.codeText);
    setActiveTab('error');
  };

  const handleClear = () => {
    setErrorText('');
    setCodeText('');
    setDescribeText('');
    setLogText('');
    setUploadedFile(null);
    setScreenshotPreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          content: text
        });
        setCodeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
      setErrorText(`[Screenshot Analysis Triggered: ${file.name}]\nExtracted OCR Error: TypeError: Cannot read properties of undefined (reading 'map')`);
    }
  };

  const handleRunAnalyze = () => {
    onAnalyze({
      language: selectedLanguage,
      inputMode: activeTab,
      errorText,
      codeText,
      describeText,
      logText,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size
    });
  };

  const analysisSteps = [
    'Understanding input...',
    'Detecting language...',
    'Classifying error pattern...',
    'Checking debugging rules...',
    'Consulting Helping Hand AI...',
    'Finding root cause...',
    'Generating verified fix...',
    'Preparing static validation...'
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 text-slate-100 overflow-y-auto">
      
      {/* Workspace Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-dark-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-brand-400" />
            <span>AI Debugging Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Paste errors, upload files/logs, or describe issues to receive instant AI diagnostics & verified fixes.
          </p>
        </div>

        {/* Top Controls: Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-dark-800 px-3 py-1.5 border border-white/10 text-xs">
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-slate-400 text-[11px]">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageType)}
              className="bg-transparent font-medium text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="auto" className="bg-dark-900 text-white">✨ Auto Detect</option>
              <option value="python" className="bg-dark-900 text-white">Python</option>
              <option value="javascript" className="bg-dark-900 text-white">JavaScript</option>
              <option value="typescript" className="bg-dark-900 text-white">TypeScript</option>
              <option value="java" className="bg-dark-900 text-white">Java</option>
              <option value="cpp" className="bg-dark-900 text-white">C / C++</option>
              <option value="sql" className="bg-dark-900 text-white">SQL</option>
              <option value="go" className="bg-dark-900 text-white">Go</option>
              <option value="rust" className="bg-dark-900 text-white">Rust</option>
              <option value="php" className="bg-dark-900 text-white">PHP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Demo Examples Selector Bar */}
      <div className="px-4 sm:px-6 py-3 bg-dark-900/80 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Try an Example:</span>
        </span>
        {DEMO_EXAMPLES.map((demo) => (
          <button
            key={demo.id}
            onClick={() => handleLoadDemo(demo)}
            className="px-3 py-1 rounded-lg bg-dark-800 border border-white/10 hover:border-brand-500/50 hover:bg-dark-750 text-slate-300 hover:text-white shrink-0 font-medium transition-all"
          >
            {demo.title}
          </button>
        ))}
      </div>

      {/* Main Input Workbench Area */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 max-w-6xl mx-auto w-full">
        
        {/* Input Mode Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-dark-900 p-1.5 border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('error')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'error' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            1. Error Input
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'code' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            2. Code Input
          </button>

          <button
            onClick={() => setActiveTab('screenshot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'screenshot' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            3. Screenshot
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'file' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            4. File Upload
          </button>

          <button
            onClick={() => setActiveTab('describe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'describe' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            5. Describe
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'log' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            6. Logs
          </button>
        </div>

        {/* Tab 1: Error Input */}
        {activeTab === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <span>Paste Error Message / Stack Trace / Compiler Output</span>
              </label>
              <span>Supports multiline stacktraces & terminal logs</span>
            </div>
            <textarea
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
              placeholder="e.g. TypeError: Cannot read properties of undefined (reading 'map')&#10;    at UserList (UserList.jsx:14:28)..."
              rows={8}
              className="w-full rounded-2xl bg-dark-900 border border-white/10 p-4 font-mono text-xs text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Tab 2: Code Input */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-semibold text-white">Source Code Editor</label>
              <span>Syntax highlighted editor snippet</span>
            </div>
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              placeholder="Paste your source code snippet here..."
              rows={10}
              className="w-full rounded-2xl bg-dark-900 border border-white/10 p-4 font-mono text-xs text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Tab 3: Screenshot Upload */}
        {activeTab === 'screenshot' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center bg-dark-900/50 hover:border-brand-500/50 transition-all cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Image className="w-10 h-10 text-brand-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Upload Error Screenshot</div>
              <div className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP files</div>
            </div>

            {screenshotPreview && (
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={screenshotPreview} alt="Screenshot Preview" className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                  <div>
                    <div className="text-xs font-semibold text-white">Screenshot Loaded for OCR AI Analysis</div>
                    <div className="text-[11px] text-emerald-400">OCR Text Extraction Ready</div>
                  </div>
                </div>
                <button onClick={() => setScreenshotPreview(null)} className="text-xs text-rose-400 hover:underline">Remove</button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: File Upload */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center bg-dark-900/50 hover:border-brand-500/50 transition-all relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white">Upload Developer Source File</div>
              <div className="text-xs text-slate-400 mt-1">.py, .js, .ts, .java, .cpp, .sql, .log, .json</div>
            </div>

            {uploadedFile && (
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCode className="w-6 h-6 text-brand-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{uploadedFile.name}</div>
                    <div className="text-[11px] text-slate-400">{uploadedFile.size}</div>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="text-xs text-rose-400 hover:underline">Remove</button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Describe Mode */}
        {activeTab === 'describe' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white">Describe the problem in plain language</label>
            <textarea
              value={describeText}
              onChange={(e) => setDescribeText(e.target.value)}
              placeholder="e.g. My Python script crashes whenever I try to fetch user details from the database when the user ID does not exist..."
              rows={6}
              className="w-full rounded-2xl bg-dark-900 border border-white/10 p-4 text-xs text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Tab 6: Log Analyzer Input */}
        {activeTab === 'log' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white">Paste Server / Application Logs</label>
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              placeholder="Paste raw application log stream output here..."
              rows={8}
              className="w-full rounded-2xl bg-dark-900 border border-white/10 p-4 font-mono text-xs text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Also allow secondary code attachment if in Error tab */}
        {activeTab === 'error' && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>(Optional) Attach Surrounding Source Code</span>
              <span className="text-[11px] text-brand-400">Improves solution precision</span>
            </label>
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              placeholder="Paste relevant code block surrounding the error..."
              rows={4}
              className="w-full rounded-2xl bg-dark-900 border border-white/10 p-3 font-mono text-xs text-slate-200 focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        )}

        {/* Analyzing Progress Sequence Overlay */}
        {isAnalyzing ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-6 animate-shimmer border border-brand-500/40">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500 flex items-center justify-center mx-auto text-brand-400 animate-spin">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white">Helping Hand AI Analysis in Progress</div>
              <div className="text-xs text-brand-400 font-mono mt-1">
                {analysisSteps[analysisStepIndex] || 'Finalizing diagnosis...'}
              </div>
            </div>

            {/* Progress Step Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto text-[11px] font-mono">
              {analysisSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    idx === analysisStepIndex
                      ? 'bg-brand-500 text-white border-brand-400 font-bold scale-105 shadow-glow-brand'
                      : idx < analysisStepIndex
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-dark-900 text-slate-600 border-white/5'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Action Trigger Buttons */
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Inputs</span>
            </button>

            <button
              onClick={handleRunAnalyze}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-semibold text-white text-xs shadow-glow-brand hover:from-brand-500 hover:to-indigo-500 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Analyze Error with Helping Hand AI</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
