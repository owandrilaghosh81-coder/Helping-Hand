import { AnalysisResult } from '../../types/debug';
import { evaluateRules } from '../../rules/engine';
import { callGeminiApi } from './client';
import { storage } from '../storage';
import { validateFixResult } from '../validationService';

export async function analyzeCodingError(
  errorText: string,
  codeText: string = '',
  describeText: string = '',
  logText: string = '',
  selectedLang: string = 'auto'
): Promise<AnalysisResult> {
  // 1. Always evaluate local Rule-Based Engine first as baseline
  const ruleResult = evaluateRules(errorText || describeText || logText, codeText, selectedLang);

  const settings = storage.getSettings();
  if (!settings.geminiApiKey) {
    // Return rule engine result directly if no API key is set
    return ruleResult!;
  }

  // 2. If API Key is present, query Google Gemini for deep AI reasoning
  try {
    const targetLang = selectedLang !== 'auto' ? selectedLang : (ruleResult?.language || 'python');

    const prompt = `Analyze this developer coding issue:
Target Language: ${targetLang}
Error Output / Stacktrace: ${errorText || 'None provided'}
Source Code: ${codeText || 'None provided'}
User Description: ${describeText || 'None provided'}
Application Logs: ${logText || 'None provided'}

Rule-Engine Baseline Assessment: ${JSON.stringify({
      errorType: ruleResult?.errorType,
      summary: ruleResult?.summary,
      rootCause: ruleResult?.rootCause,
      suggestedFix: ruleResult?.suggestedFix
    })}

CRITICAL INSTRUCTIONS:
1. You MUST preserve the Target Language (${targetLang}). Python fixes MUST ONLY use Python syntax. NEVER wrap Python in JavaScript try/catch or use console.log.
2. Make the SMALLEST reasonable change to fix the root cause.
3. Treat the original code as immutable input. Change only the line or expression containing the bug.
4. Do NOT invent unprovided code context.

Respond ONLY with valid JSON in this exact structure:
{
  "language": "${targetLang}",
  "errorType": "Short error title",
  "severity": "informational|warning|important|critical",
  "summary": "1 sentence clear overview",
  "whatHappened": "Beginner friendly explanation of what went wrong",
  "whyItHappened": "Clear explanation of why it happened",
  "technicalWhy": "Deeper technical/architecture details for experienced devs",
  "rootCause": "Direct most likely root cause",
  "rootCauseStatus": "confirmed|likely|possible",
  "location": { "file": "filename", "line": 2, "column": 1, "functionName": "func" },
  "howToFix": ["Step 1", "Step 2"],
  "originalCode": "exact original broken snippet",
  "suggestedFix": "corrected code snippet in ${targetLang}",
  "explainFix": "Why this fix works and what changed",
  "alternativeFixes": [
    { "title": "Alternative Approach", "category": "Alternative", "code": "code snippet", "explanation": "exp", "tradeoffs": "tradeoffs" }
  ],
  "preventionTips": ["Tip 1", "Tip 2"],
  "confidence": "High|Medium|Low"
}`;

    const systemInstruction = `You are Helping Hand AI, an expert developer debugging assistant. Provide precise, actionable debugging analysis. Always preserve the user's programming language strictly. Output strictly JSON.`;

    const rawResponse = await callGeminiApi(prompt, systemInstruction);
    const cleanedJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    let finalFix = parsed.suggestedFix || ruleResult?.suggestedFix || codeText;
    let finalOrig = parsed.originalCode || ruleResult?.originalCode || codeText || errorText;

    // Run Validation Engine pipeline on Gemini output
    let validation = validateFixResult({
      originalCode: finalOrig,
      suggestedFix: finalFix,
      language: targetLang,
      errorType: parsed.errorType || ruleResult?.errorType || 'Runtime Error',
      hasExecutionSandbox: false
    });

    // If Gemini output failed language or syntax validation, fallback to Rule Engine fix!
    if (!validation.testPassed && ruleResult?.suggestedFix) {
      console.warn('Gemini fix failed language consistency check, falling back to rule engine patch.');
      finalFix = ruleResult.suggestedFix;
      finalOrig = ruleResult.originalCode;
      validation = validateFixResult({
        originalCode: finalOrig,
        suggestedFix: finalFix,
        language: targetLang,
        errorType: ruleResult.errorType,
        hasExecutionSandbox: false
      });
    }

    return {
      id: 'res-gemini-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: targetLang,
      detectedLanguage: targetLang,
      errorType: parsed.errorType || ruleResult?.errorType || 'Runtime Error',
      severity: parsed.severity || ruleResult?.severity || 'important',
      summary: parsed.summary || ruleResult?.summary || 'Analyzed code issue.',
      whatHappened: parsed.whatHappened || ruleResult?.whatHappened || '',
      whyItHappened: parsed.whyItHappened || ruleResult?.whyItHappened || '',
      technicalWhy: parsed.technicalWhy || ruleResult?.technicalWhy || '',
      rootCause: parsed.rootCause || ruleResult?.rootCause || '',
      rootCauseStatus: parsed.rootCauseStatus || ruleResult?.rootCauseStatus || 'likely',
      location: parsed.location || ruleResult?.location || { line: 1 },
      howToFix: parsed.howToFix || ruleResult?.howToFix || [],
      originalCode: finalOrig,
      suggestedFix: finalFix,
      fixedCode: finalFix,
      explainFix: parsed.explainFix || ruleResult?.explainFix || '',
      alternativeFixes: parsed.alternativeFixes || ruleResult?.alternativeFixes || [],
      preventionTips: parsed.preventionTips || ruleResult?.preventionTips || [],
      validation,
      confidence: parsed.confidence || 'High',
      sourceEngine: 'hybrid'
    };
  } catch (err) {
    console.warn('Gemini API call failed, using rule engine fallback:', err);
    return ruleResult!;
  }
}
