export type LanguageType =
  | 'auto'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'kotlin'
  | 'swift'
  | 'sql'
  | 'html'
  | 'css'
  | 'bash'
  | 'powershell'
  | 'lua'
  | 'r'
  | 'other';

export type InputMode = 'error' | 'code' | 'screenshot' | 'file' | 'describe' | 'log';

export type SeverityLevel = 'informational' | 'warning' | 'important' | 'critical';

export type RootCauseConfidence = 'confirmed' | 'likely' | 'possible';

export type ValidationStatus = 'PASSED' | 'FAILED' | 'PARTIALLY VALIDATED' | 'STATIC ANALYSIS ONLY' | 'UNABLE TO VALIDATE';

export interface LocationInfo {
  file?: string;
  line?: number;
  column?: number;
  functionName?: string;
  className?: string;
}

export interface AlternativeFix {
  title: string;
  category: 'Recommended' | 'Alternative' | 'Advanced';
  code: string;
  explanation: string;
  tradeoffs: string;
}

export interface FixValidationResult {
  status: ValidationStatus;
  summary: string;
  parsed: boolean;
  errorReproduced: boolean;
  fixApplied: boolean;
  testPassed: boolean;
  logs: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  language: string;
  detectedLanguage?: string;
  errorType: string;
  severity: SeverityLevel;
  summary: string;
  whatHappened: string;
  whyItHappened: string;
  technicalWhy: string;
  rootCause: string;
  rootCauseStatus: RootCauseConfidence;
  location: LocationInfo;
  howToFix: string[];
  originalCode: string;
  suggestedFix: string;
  fixedCode: string;
  explainFix: string;
  alternativeFixes: AlternativeFix[];
  preventionTips: string[];
  validation: FixValidationResult;
  confidence: 'High' | 'Medium' | 'Low';
  sourceEngine: 'rule' | 'gemini' | 'hybrid';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface DebugSession {
  id: string;
  title: string;
  timestamp: string;
  language: LanguageType;
  inputMode: InputMode;
  errorText: string;
  codeText: string;
  describeText: string;
  logText: string;
  fileName?: string;
  fileSize?: string;
  screenshotUrl?: string;
  result?: AnalysisResult;
  chatHistory: ChatMessage[];
  isSaved?: boolean;
}

export type DevToolType =
  | 'analyzer'
  | 'stacktrace'
  | 'log'
  | 'bugfinder'
  | 'optimizer'
  | 'security'
  | 'unittest';

export interface UserSettings {
  geminiApiKey: string;
  geminiModel: string;
  theme: 'dark' | 'light' | 'system';
  autoDetectLanguage: boolean;
  enableRuleEngine: boolean;
  enableExecutionValidation: boolean;
  codeEditorFont: string;
}

export interface DemoExample {
  id: string;
  title: string;
  language: LanguageType;
  badge: string;
  description: string;
  errorText: string;
  codeText: string;
}
