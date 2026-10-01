import { AnalysisResult, ChatMessage } from '../../types/debug';
import { callGeminiApi } from './client';
import { storage } from '../storage';

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  analysisResult?: AnalysisResult
): Promise<string> {
  const settings = storage.getSettings();

  if (!settings.geminiApiKey) {
    // Smart rule-based conversational assistant fallback
    return generateFallbackChatResponse(message, analysisResult);
  }

  try {
    const contextPrompt = analysisResult
      ? `Current Debugging Context:
Language: ${analysisResult.language}
Error: ${analysisResult.errorType}
Root Cause: ${analysisResult.rootCause}
Original Code:
${analysisResult.originalCode}
Fixed Code:
${analysisResult.fixedCode}
`
      : 'No active debugging session context loaded.';

    const systemInstruction = `You are HELPING HAND AI, an intelligent debugging companion. You help developers understand software errors, refactor code, write unit tests, and optimize fixes. Keep answers concise, clear, and formatted in markdown.`;

    const fullPrompt = `${contextPrompt}
User Question: ${message}`;

    return await callGeminiApi(fullPrompt, systemInstruction);
  } catch (err) {
    return generateFallbackChatResponse(message, analysisResult);
  }
}

function generateFallbackChatResponse(message: string, result?: AnalysisResult): string {
  const lower = message.toLowerCase();

  if (lower.includes('beginner') || lower.includes('explain like i\'m 5') || lower.includes('eli5')) {
    return result
      ? `**Simplified Explanation:**\nThink of your computer program like a recipe. Right now, it's trying to use an ingredient (like \`${result.location.file || 'variable'}\`) that isn't on the kitchen counter yet. \n\nBy adding the check \`${result.suggestedFix.substring(0, 40)}...\`, we make sure the ingredient is ready before we start cooking!`
      : `I can break down complex bugs into simple concepts! Paste an error or code snippet above to get started.`;
  }

  if (lower.includes('another solution') || lower.includes('alternative')) {
    if (result && result.alternativeFixes.length > 0) {
      const alt = result.alternativeFixes[0];
      return `**Alternative Approach: ${alt.title}**\n\`\`\`${result.language}\n${alt.code}\n\`\`\`\n**Why choose this?** ${alt.explanation}\n**Tradeoff:** ${alt.tradeoffs}`;
    }
    return `Another common approach is adding defensive guard clauses at function entry points or using optional chaining (\`?.\`).`;
  }

  if (lower.includes('test') || lower.includes('unit test')) {
    return result
      ? `Here is a unit test designed to catch this error:\n\`\`\`${result.language}\n# Automated Test Case for ${result.errorType}\ndef test_${result.language}_fix():\n    # Test normal behavior\n    assert process_data({"valid": True}) is not None\n    # Test null/empty edge case\n    assert process_data(None) is not None\n\`\`\``
      : `Provide code in the input tab and I can generate unit tests covering edge cases and error handling!`;
  }

  if (lower.includes('optimize') || lower.includes('performance')) {
    return result
      ? `To optimize this fix, minimize dynamic runtime type checks inside high-frequency loops. Pre-validate objects when receiving responses from external APIs.`
      : `For maximum performance, prefer static type guarantees and zero-cost abstractions over runtime exception handling inside hot loops.`;
  }

  return `Regarding **"${message}"**: 
In ${result?.language ? result.language.toUpperCase() : 'programming'}, handling null/undefined values and runtime exceptions cleanly prevents unexpected crashes. ${
    result ? `The root cause of this specific bug is: *${result.rootCause}*.` : 'Paste an error message or code to run full diagnostics!'
  }`;
}
