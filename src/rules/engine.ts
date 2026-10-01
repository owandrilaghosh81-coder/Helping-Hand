import { AnalysisResult, LocationInfo } from '../types/debug';
import { RulePattern, RuleMatchContext } from './types';
import { pythonRules } from './python';
import { javascriptRules } from './javascript';
import { javaRules } from './java';
import { cppRules, sqlRules } from './cpp';
import { validateFixResult } from '../services/validationService';

const ALL_RULES: RulePattern[] = [
  ...pythonRules,
  ...javascriptRules,
  ...javaRules,
  ...cppRules,
  ...sqlRules
];

export function detectLanguageFromContent(errorText: string, codeText: string = ''): { language: string; confidence: 'High' | 'Medium' | 'Low' } {
  const combined = (errorText + '\n' + codeText).toLowerCase();

  if (/nameerror|attributeerror|indentationerror|zerodivisionerror|nonetype|traceback \(most recent call last\)|def |import os|print\(|nam\b/.test(combined)) {
    return { language: 'python', confidence: 'High' };
  }
  if (/typeerror: cannot read propert|uncaught referenceerror|react-dom|const |let |console\.log|=>|import react|const user = undefined/.test(combined)) {
    return { language: 'javascript', confidence: 'High' };
  }
  if (/nullpointerexception|arrayindexoutofboundsexception|public class |system\.out\.println|java\.lang\.|string name = null/.test(combined)) {
    return { language: 'java', confidence: 'High' };
  }
  if (/segmentation fault|std::|#include <|nullptr|sigsegv/.test(combined)) {
    return { language: 'cpp', confidence: 'High' };
  }
  if (/sql state:|syntax error at or near|select |from |where |group by |order by /.test(combined)) {
    return { language: 'sql', confidence: 'High' };
  }
  if (/panic: runtime error|goroutine \d+|fmt\.printf|package main/.test(combined)) {
    return { language: 'go', confidence: 'High' };
  }

  return { language: 'python', confidence: 'Medium' };
}

export function evaluateRules(
  errorText: string,
  codeText: string = '',
  selectedLang: string = 'auto'
): AnalysisResult | null {
  const langDetection = selectedLang === 'auto'
    ? detectLanguageFromContent(errorText, codeText)
    : { language: selectedLang, confidence: 'High' as const };

  const targetLang = langDetection.language;
  const ctx: RuleMatchContext = { errorText, codeText, language: targetLang };

  // Filter relevant rules matching language or auto
  const candidateRules = ALL_RULES.filter(
    (r) => r.language === targetLang || targetLang === 'auto'
  );

  for (const rule of candidateRules) {
    const match = (errorText ? errorText.match(rule.matchRegex) : null) || (codeText ? codeText.match(rule.matchRegex) : null);
    if (match) {
      const fix = rule.suggestedFixCode(ctx, match);
      const loc: LocationInfo = rule.extractLocation
        ? rule.extractLocation(errorText, codeText)
        : { file: 'main.' + (targetLang === 'python' ? 'py' : targetLang === 'javascript' ? 'js' : targetLang === 'java' ? 'java' : 'ts'), line: 2 };

      // Run validation pipeline on rule output
      const validation = validateFixResult({
        originalCode: fix.original,
        suggestedFix: fix.fixed,
        language: targetLang,
        errorType: rule.errorName,
        hasExecutionSandbox: false
      });

      return {
        id: 'res-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: targetLang,
        detectedLanguage: langDetection.language,
        errorType: rule.errorName,
        severity: rule.severity,
        summary: rule.summary,
        whatHappened: rule.whatHappened(ctx, match),
        whyItHappened: rule.whyItHappened(ctx, match),
        technicalWhy: rule.technicalWhy(ctx, match),
        rootCause: rule.rootCause(ctx, match),
        rootCauseStatus: rule.rootCauseStatus,
        location: loc,
        howToFix: rule.howToFix(ctx, match),
        originalCode: fix.original,
        suggestedFix: fix.fixed,
        fixedCode: fix.fixed,
        explainFix: fix.explain,
        alternativeFixes: rule.alternativeFixes(ctx, match),
        preventionTips: rule.preventionTips,
        validation,
        confidence: langDetection.confidence,
        sourceEngine: 'rule'
      };
    }
  }

  // Fallback default generic rule generation if no specific regex matches
  return generateGenericRuleAnalysis(errorText, codeText, targetLang, langDetection.confidence);
}

function generateGenericRuleAnalysis(
  errorText: string,
  codeText: string,
  language: string,
  confidence: 'High' | 'Medium' | 'Low'
): AnalysisResult {
  const errorTitle = errorText.split('\n')[0].substring(0, 60) || 'Runtime Coding Exception';
  const orig = codeText || errorText || '# Source code not provided';
  const langLower = language.toLowerCase();

  let fixed = orig;
  if (langLower === 'python') {
    fixed = `# Added Python error handling guard\ntry:\n    ${orig.replace(/\n/g, '\n    ')}\nexcept Exception as e:\n    print(f"Handled error: {e}")`;
  } else if (langLower === 'javascript' || langLower === 'typescript') {
    fixed = `// Added JavaScript error handling guard\ntry {\n  ${orig}\n} catch (err) {\n  console.error("Handled error:", err);\n}`;
  } else if (langLower === 'java') {
    fixed = `// Added Java error handling guard\ntry {\n    ${orig}\n} catch (Exception e) {\n    System.err.println("Handled error: " + e);\n}`;
  } else if (langLower === 'cpp' || langLower === 'c') {
    fixed = `// Added C++ error handling guard\ntry {\n    ${orig}\n} catch (const std::exception& e) {\n    std::cerr << "Handled error: " << e.what() << std::endl;\n}`;
  } else {
    fixed = `// Guarded implementation in ${language}\n${orig}`;
  }

  const validation = validateFixResult({
    originalCode: orig,
    suggestedFix: fixed,
    language,
    errorType: errorTitle,
    hasExecutionSandbox: false
  });

  return {
    id: 'res-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    language,
    detectedLanguage: language,
    errorType: errorTitle,
    severity: 'important',
    summary: `Analyzed runtime error pattern in ${language.toUpperCase()}.`,
    whatHappened: `The ${language.toUpperCase()} runtime encountered an exception during execution: "${errorTitle}".`,
    whyItHappened: `This exception occurs when an operation receives an unexpected data state or invalid variable reference at runtime.`,
    technicalWhy: `Execution thread was interrupted by an unhandled exception state. The call stack unwound to the nearest error handler or terminated the process.`,
    rootCause: `Variable or object state diverged from expected invariants prior to executing this block.`,
    rootCauseStatus: 'likely',
    location: { file: `main.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'ts'}`, line: 1 },
    howToFix: [
      'Inspect the variables involved immediately before the failing line.',
      'Wrap the critical section in defensive try/except or null checks.',
      'Log input values to verify data format matching expectations.'
    ],
    originalCode: orig,
    suggestedFix: fixed,
    fixedCode: fixed,
    explainFix: `Added defensive ${language.toUpperCase()} error handling wrapper to prevent application crash.`,
    alternativeFixes: [
      {
        title: 'Input Validation & Early Exit',
        category: 'Recommended',
        code: language === 'python' ? `if not input:\n    return` : `if (!input) return;`,
        explanation: 'Validate inputs at function boundaries before executing processing logic.',
        tradeoffs: 'Requires defining clear fallback behavior.'
      }
    ],
    preventionTips: [
      'Add unit tests covering edge cases and unexpected null/empty inputs.',
      'Use static type checking tools.'
    ],
    validation,
    confidence,
    sourceEngine: 'rule'
  };
}
