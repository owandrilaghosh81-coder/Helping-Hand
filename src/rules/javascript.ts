import { RulePattern } from './types';

export const javascriptRules: RulePattern[] = [
  {
    id: 'js-cannot-read-properties-of-undefined',
    language: 'javascript',
    errorName: 'TypeError (Cannot read properties of undefined)',
    matchRegex: /TypeError:\s*Cannot read propert(?:ies|y) of undefined \(reading ['"]([^'"]+)['"]\)|TypeError:\s*Cannot read property ['"]([^'"]+)['"] of undefined/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: "Tried to read a property on a variable that evaluates to 'undefined'.",
    whatHappened: (_ctx, match) =>
      `Your code tried to read property '.${match[1] || match[2]}' from a target object, but the target object was 'undefined'.`,
    whyItHappened: (_ctx, match) =>
      `In JavaScript, attempting to dereference properties (like '.${match[1] || match[2]}') on 'undefined' or 'null' throws an unhandled TypeError.`,
    technicalWhy: (_ctx, match) =>
      `V8 JavaScript Engine threw JS_OBJECT_NULL_OR_UNDEFINED_DEREF while resolving [[Get]] internal method for property '${match[1] || match[2]}'.`,
    rootCause: (_ctx, match) =>
      `The state or object variable was not initialized before rendering/processing, or the API object structure didn't contain key '${match[1] || match[2]}'.`,
    howToFix: (_ctx, match) => [
      `Use Optional Chaining (\`?.${match[1] || match[2]}\`) to prevent runtime crashes when the target object is undefined.`,
      `Provide default initial state (e.g. \`useState([])\` instead of \`useState(null)\`).`,
      `Add conditional checking: \`if (obj && obj.${match[1] || match[2]}) { ... }\`.`
    ],
    suggestedFixCode: (ctx, match) => {
      const prop = match[1] || match[2];
      const orig = ctx.codeText || `const val = data.${prop};`;
      const fixed = ctx.codeText
        ? ctx.codeText.replace(new RegExp(`\\.(${prop})\\b`, 'g'), `?.$1`)
        : `const val = data?.${prop} ?? [];`;
      return {
        original: orig,
        fixed: fixed.includes('?.') ? fixed : `const val = data?.${prop};`,
        explain: `Applied optional chaining \`?.${prop}\` which returns undefined safely instead of crashing when data is uninitialized.`
      };
    },
    alternativeFixes: (ctx, match) => {
      const prop = match[1] || match[2];
      return [
        {
          title: 'Optional Chaining + Nullish Coalescing',
          category: 'Recommended',
          code: `const items = data?.${prop} ?? [];`,
          explanation: 'Uses modern ES2020 optional chaining with fallback default value when property is missing.',
          tradeoffs: 'Requires ES2020 browser support or babel transpilation.'
        },
        {
          title: 'Ternary Guard',
          category: 'Alternative',
          code: `const items = (data && data.${prop}) ? data.${prop} : [];`,
          explanation: 'Checks parent object truthiness before property access.',
          tradeoffs: 'Slightly more verbose than optional chaining.'
        }
      ];
    },
    preventionTips: [
      'Initialize React component state with realistic fallback types (`[]` or `{}`).',
      'Enable strict TypeScript null checks (`"strictNullChecks": true`).',
      'Use optional chaining `data?.items?.map()` when dealing with external API payloads.'
    ],
    extractLocation: (errorText) => {
      const lineMatch = errorText.match(/:(\d+):(\d+)/);
      const fileMatch = errorText.match(/at\s+([^\s]+)/);
      return {
        file: fileMatch ? fileMatch[1].split('/').pop() : 'Component.jsx',
        line: lineMatch ? parseInt(lineMatch[1], 10) : 14,
        column: lineMatch ? parseInt(lineMatch[2], 10) : 28
      };
    }
  },
  {
    id: 'js-is-not-a-function',
    language: 'javascript',
    errorName: 'TypeError (is not a function)',
    matchRegex: /TypeError:\s*([^\s]+)\s+is not a function/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: 'Tried to invoke a variable as a function, but it is not callable.',
    whatHappened: (_ctx, match) =>
      `Your code attempted to invoke \`${match[1]}()\`, but \`${match[1]}\` is currently an object, string, undefined, or missing callback.`,
    whyItHappened: (_ctx, match) =>
      `In JavaScript, parentheses \`()\`) invoke functions. If \`${match[1]}\` evaluates to something that is not a function object, V8 raises a TypeError.`,
    technicalWhy: (_ctx, _match) =>
      `Call site invocation failed: [[Call]] internal slot is undefined for target value.`,
    rootCause: (_ctx, match) =>
      `Export mismatch (e.g. named export vs default export import), unpassed callback prop, or method scope binding issue.`,
    howToFix: (_ctx, match) => [
      `Check your import statements for default vs named imports (\`import { foo }\` vs \`import foo\`).`,
      `Verify prop/parameter passing: \`typeof ${match[1]} === 'function' && ${match[1]}()\`.`,
      `Check method binding or class instance context.`
    ],
    suggestedFixCode: (_ctx, match) => {
      const funcName = match[1];
      return {
        original: `${funcName}();`,
        fixed: `if (typeof ${funcName} === 'function') {\n  ${funcName}();\n}`,
        explain: `Added a type check guard ensuring \`${funcName}\` is callable before invocation.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: [
      'Verify export statements match import syntax (`export default` vs `export const`).',
      'Use default parameters for optional callback props (`onSuccess = () => {}`).'
    ]
  }
];
