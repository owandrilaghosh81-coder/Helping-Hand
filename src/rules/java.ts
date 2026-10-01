import { RulePattern } from './types';

export const javaRules: RulePattern[] = [
  // 1. Java NullPointerException
  {
    id: 'java-null-pointer-exception',
    language: 'java',
    errorName: 'NullPointerException',
    matchRegex: /java\.lang\.NullPointerException|String name = null;\s*System\.out\.println\(name\.length\(\)\)/i,
    severity: 'critical',
    rootCauseStatus: 'confirmed',
    summary: 'Attempted to invoke a method or access a field on a null object reference in Java.',
    whatHappened: (_ctx, _match) =>
      `A NullPointerException occurred because a method (e.g. .length() or .trim()) was invoked on an uninitialized or null object reference.`,
    whyItHappened: (_ctx, _match) =>
      `Java requires object references to point to valid heap memory instances. Calling methods on null references triggers a runtime NullPointerException.`,
    technicalWhy: (_ctx, _match) =>
      `JVM opcode invokevirtual / getfield encountered null reference pointer at offset 0x0.`,
    rootCause: (_ctx, _match) =>
      `Object reference evaluated to null prior to method invocation.`,
    howToFix: (_ctx, _match) => [
      `Add a null check before calling methods: \`if (name != null) System.out.println(name.length());\`.`,
      `Use Java 8+ \`Optional<T>\` wrapper.`
    ],
    suggestedFixCode: (ctx, _match) => {
      const orig = ctx.codeText || `String name = null;\nSystem.out.println(name.length());`;
      let fixed = orig;

      if (orig.includes('System.out.println(name.length());')) {
        fixed = `String name = null;\nif (name != null) {\n    System.out.println(name.length());\n}`;
      } else {
        fixed = `if (obj != null) {\n    ${orig}\n}`;
      }

      return {
        original: orig,
        fixed,
        explain: `Added defensive null check \`if (name != null)\` to prevent JVM NullPointerException.`
      };
    },
    alternativeFixes: () => [
      {
        title: 'Optional<T> Functional Pattern',
        category: 'Recommended',
        code: `Optional.ofNullable(name).ifPresent(n -> System.out.println(n.length()));`,
        explanation: 'Uses Java 8 Optional pattern to execute consumer safely when value is present.',
        tradeoffs: 'None'
      }
    ],
    preventionTips: [
      'Annotate parameters and fields with `@NonNull` or `@Nullable`.',
      'Prefer returning empty strings/collections instead of `null`.'
    ],
    extractLocation: (errorText) => {
      const match = errorText.match(/at\s+([^\(]+)\(([^\:]+)\:(\d+)\)/);
      return {
        file: match ? match[2] : 'Main.java',
        line: match ? parseInt(match[3], 10) : 2
      };
    }
  }
];
