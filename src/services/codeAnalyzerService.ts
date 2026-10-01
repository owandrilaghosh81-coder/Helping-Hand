export interface CodeSmellFinding {
  severity: 'Warning' | 'Info' | 'Critical';
  title: string;
  explanation: string;
  lineNumber: number;
  snippet: string;
}

export interface CodeMetrics {
  totalLines: number;
  codeLines: number; // SLOC (excluding blank & comment lines)
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  qualityScore: number;
}

export interface AnalysisOutput {
  isError: boolean;
  errorTitle?: string;
  errorMessage?: string;
  language: string;
  metrics?: CodeMetrics;
  smells: CodeSmellFinding[];
  summary: string;
}

export function analyzeCodeStructure(inputCode: string, language: string = 'javascript'): AnalysisOutput {
  const code = (inputCode || '').trim();

  // 1. Handle Empty Input
  if (!code) {
    return {
      isError: true,
      errorTitle: 'Empty Input',
      errorMessage: 'No source code provided. Paste or enter source code to analyze structure and complexity.',
      language,
      smells: [],
      summary: 'Analysis aborted due to empty input.'
    };
  }

  const langLower = language.toLowerCase();
  const lines = inputCode.split('\n');

  // 2. Syntax & Structural Balance Check (detect malformed code)
  const openBraces = (inputCode.match(/\{/g) || []).length;
  const closeBraces = (inputCode.match(/\}/g) || []).length;
  const openParens = (inputCode.match(/\(/g) || []).length;
  const closeParens = (inputCode.match(/\)/g) || []).length;

  if (openBraces !== closeBraces || openParens !== closeParens) {
    // Malformed code diagnostic error
    const missingToken = openBraces > closeBraces ? '}' : openBraces < closeBraces ? '{' : openParens > closeParens ? ')' : '(';
    return {
      isError: true,
      errorTitle: 'Parser / Syntax Diagnostic Error',
      errorMessage: `Malformed code structure detected: Missing closing brace or delimiter '${missingToken}' near line ${lines.length}.`,
      language,
      smells: [],
      summary: 'Analysis failed due to unclosed block structure or syntax diagnostics.'
    };
  }

  // 3. Line Metrics Calculation
  let commentLines = 0;
  let blankLines = 0;
  let codeLines = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines++;
    } else if (
      (langLower === 'python' && trimmed.startsWith('#')) ||
      (langLower !== 'python' && (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')))
    ) {
      commentLines++;
    } else {
      codeLines++;
    }
  });

  const totalLines = lines.length;

  // 4. Cyclomatic Complexity Calculation (V(G))
  // Count decision points: if, elif, else if, for, while, catch, case, &&, ||, and, or, ?
  let decisionPoints = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Skip comment lines
    if (
      (langLower === 'python' && trimmed.startsWith('#')) ||
      (langLower !== 'python' && trimmed.startsWith('//'))
    ) {
      return;
    }

    if (langLower === 'python') {
      const matches = trimmed.match(/\b(if|elif|for|while|and|or)\b/g);
      if (matches) decisionPoints += matches.length;
    } else {
      const matches = trimmed.match(/\b(if|else\s+if|for|while|catch|case)\b|&&|\|\||\?/g);
      if (matches) decisionPoints += matches.length;
    }
  });

  const cyclomaticComplexity = 1 + decisionPoints;

  // 5. Cognitive Complexity Calculation (Nesting levels)
  let cognitiveComplexity = 0;
  let currentNesting = 0;
  const smells: CodeSmellFinding[] = [];

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    const trimmed = line.trim();

    if (
      (langLower === 'python' && trimmed.startsWith('#')) ||
      (langLower !== 'python' && trimmed.startsWith('//'))
    ) {
      return;
    }

    // Nesting depth detection
    const isControlKeyword = langLower === 'python'
      ? /^\s*(if|elif|for|while|try|with)\b/.test(line)
      : /^\s*(if|else\s+if|for|while|try|switch)\b/.test(line);

    if (isControlKeyword) {
      if (currentNesting > 0) {
        cognitiveComplexity += currentNesting;
      }
      currentNesting++;

      // Check evidence-based Nested Control Structure smell (nesting > 2)
      if (currentNesting > 2) {
        smells.push({
          severity: 'Warning',
          title: 'Deeply Nested Control Structure',
          explanation: `Control structure at line ${lineNumber} is nested ${currentNesting} levels deep, increasing cognitive load.`,
          lineNumber,
          snippet: trimmed
        });
      }
    }

    // Un-nesting heuristics
    if (langLower === 'python') {
      if (trimmed === '' || trimmed.startsWith('return') || trimmed.startsWith('pass')) {
        if (currentNesting > 0 && !line.startsWith('    '.repeat(currentNesting))) {
          currentNesting = Math.max(0, currentNesting - 1);
        }
      }
    } else {
      if (trimmed.includes('}')) {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }
  });

  // 6. Unused Variable Detection (Evidence-Based Only)
  // Scans for variable assignments like `unused_var = 42` or `const unusedVar = 42`
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    const trimmed = line.trim();

    let varName: string | null = null;
    if (langLower === 'python') {
      const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?!.*=)/);
      if (match && !['if', 'elif', 'return', 'def', 'class'].includes(match[1])) {
        varName = match[1];
      }
    } else {
      const match = trimmed.match(/(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (match) {
        varName = match[1];
      }
    }

    if (varName) {
      // Check if variable name is referenced anywhere else in the code
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      const allOccurrences = (inputCode.match(regex) || []).length;
      if (allOccurrences === 1) {
        smells.push({
          severity: 'Warning',
          title: `Unused Variable '${varName}'`,
          explanation: `Variable '${varName}' declared at line ${lineNumber} is assigned but never referenced again in the scope.`,
          lineNumber,
          snippet: trimmed
        });
      }
    }
  });

  // 7. Long Function / High Complexity Smells
  if (codeLines > 30) {
    smells.push({
      severity: 'Info',
      title: 'Long Code Block / Function',
      explanation: `Code contains ${codeLines} SLOC, which exceeds recommended 30 lines per function/block limit.`,
      lineNumber: 1,
      snippet: lines[0].trim()
    });
  }

  if (cyclomaticComplexity > 10) {
    smells.push({
      severity: 'Warning',
      title: 'High Cyclomatic Complexity',
      explanation: `Cyclomatic complexity is ${cyclomaticComplexity} (exceeds recommended threshold of 10). Consider refactoring into smaller functions.`,
      lineNumber: 1,
      snippet: lines[0].trim()
    });
  }

  // 8. Maintainability Index & Quality Score Calculation
  const safeSloc = Math.max(1, codeLines);
  const miRaw = 171 - 5.2 * Math.log(safeSloc) - 0.23 * cyclomaticComplexity;
  const maintainabilityIndex = Math.max(0, Math.min(100, Math.round(miRaw)));

  const smellDeduction = smells.length * 10;
  const qualityScore = Math.max(0, Math.min(100, maintainabilityIndex - smellDeduction));

  const metrics: CodeMetrics = {
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    cyclomaticComplexity,
    cognitiveComplexity,
    maintainabilityIndex,
    qualityScore
  };

  return {
    isError: false,
    language,
    metrics,
    smells,
    summary: `Analyzed ${codeLines} SLOC in ${language.toUpperCase()}. Found ${smells.length} evidence-backed code smell(s).`
  };
}
