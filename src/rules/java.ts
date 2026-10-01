import { RulePattern } from './types';

export const javaRules: RulePattern[] = [
  {
    id: 'java-null-pointer-exception',
    language: 'java',
    errorName: 'NullPointerException',
    matchRegex: /java\.lang\.NullPointerException:\s*(.*)|Cannot invoke ["']([^"']+)["'] because ["']([^"']+)["'] is null/i,
    severity: 'critical',
    rootCauseStatus: 'confirmed',
    summary: 'Attempted to invoke a method or access a field on a null object reference in Java.',
    whatHappened: (_ctx, match) =>
      `A NullPointerException occurred because object reference '${match[3] || 'target'}' was null when calling '${match[2] || 'method'}'.`,
    whyItHappened: (_ctx, _match) =>
      `Java requires references to point to memory instances. Invoking methods on uninitialized or null variables triggers a runtime NullPointerException.`,
    technicalWhy: (_ctx, _match) =>
      `JVM opcode invokevirtual / getfield encountered null reference pointer at offset 0x0.`,
    rootCause: (_ctx, match) =>
      `Variable '${match[3] || 'target'}' was not assigned an instance, or method returned null unexpectedly.`,
    howToFix: (_ctx, match) => [
      `Use Java 8+ \`Optional<T>\` wrapper for nullable method returns.`,
      `Add null checks: \`if (${match[3] || 'str'} != null) { ... }\`.`,
      `Use Objects.requireNonNull() or default assignments.`
    ],
    suggestedFixCode: (ctx, match) => {
      const varName = match[3] || 'customerCode';
      return {
        original: ctx.codeText || `String s = ${varName}.trim();`,
        fixed: `if (${varName} != null) {\n    String s = ${varName}.trim();\n} else {\n    // handle null case\n}`,
        explain: `Wrapped method call inside non-null check \`${varName} != null\` to prevent JVM crash.`
      };
    },
    alternativeFixes: (_ctx, match) => [
      {
        title: 'Optional<T> Wrapper',
        category: 'Recommended',
        code: `String s = Optional.ofNullable(${match ? match[3] || 'input' : 'input'}).map(String::trim).orElse("");`,
        explanation: 'Uses Java 8 Optional functional pattern to execute trim() safely or fallback to empty string.',
        tradeoffs: 'Slight overhead from Optional allocation.'
      }
    ],
    preventionTips: [
      'Annotate parameters and fields with `@NonNull` or `@Nullable`.',
      'Prefer returning empty collections `Collections.emptyList()` instead of `null`.'
    ],
    extractLocation: (errorText) => {
      const match = errorText.match(/at\s+([^\(]+)\(([^\:]+)\:(\d+)\)/);
      return {
        file: match ? match[2] : 'OrderProcessor.java',
        line: match ? parseInt(match[3], 10) : 27,
        className: match ? match[1] : 'OrderProcessor'
      };
    }
  }
];
