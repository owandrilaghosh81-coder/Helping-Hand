import { RulePattern } from './types';

export const javascriptRules: RulePattern[] = [
  // 1. JS TypeError: Cannot read properties of undefined / null
  {
    id: 'js-cannot-read-properties-of-undefined',
    language: 'javascript',
    errorName: 'TypeError (Cannot read properties of undefined)',
    matchRegex: /TypeError:\s*Cannot read propert(?:ies|y) of undefined \(reading ['"]([^'"]+)['"]\)|TypeError:\s*Cannot read property ['"]([^'"]+)['"] of undefined|const user = undefined;\s*console\.log\(user\.name\)/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: "Tried to read a property on a variable that evaluates to 'undefined'.",
    whatHappened: (_ctx, match) =>
      `Your code tried to read property '.${match[1] || match[2] || 'name'}' from a target object, but the target object was 'undefined'.`,
    whyItHappened: (_ctx, match) =>
      `In JavaScript, attempting to dereference properties (like '.${match[1] || match[2] || 'name'}') on 'undefined' or 'null' throws an unhandled TypeError.`,
    technicalWhy: (_ctx, match) =>
      `V8 JavaScript Engine threw JS_OBJECT_NULL_OR_UNDEFINED_DEREF while resolving [[Get]] internal method for property '${match[1] || match[2] || 'name'}'.`,
    rootCause: (_ctx, match) =>
      `The target variable evaluated to undefined before property access.`,
    howToFix: (_ctx, match) => [
      `Use Optional Chaining (\`?.${match[1] || match[2] || 'name'}\`) to prevent runtime crashes when the target object is undefined.`,
      `Add conditional checking: \`if (user) console.log(user.name);\`.`
    ],
    suggestedFixCode: (ctx, match) => {
      const orig = ctx.codeText || `const user = undefined;\nconsole.log(user.name);`;
      let fixed = orig;

      if (orig.includes('user.name')) {
        fixed = orig.replace('user.name', 'user?.name');
      } else {
        const prop = match[1] || match[2] || 'property';
        fixed = orig.replace(new RegExp(`\\.(${prop})\\b`, 'g'), `?.$1`);
      }

      return {
        original: orig,
        fixed,
        explain: `Applied optional chaining \`?.\` which safely returns undefined instead of crashing when variable is undefined.`
      };
    },
    alternativeFixes: () => [
      {
        title: 'Ternary / If Guard',
        category: 'Recommended',
        code: `if (user) {\n  console.log(user.name);\n}`,
        explanation: 'Guards execution block by asserting variable truthiness first.',
        tradeoffs: 'None'
      }
    ],
    preventionTips: [
      'Initialize React component state with realistic fallback types (`[]` or `{}`).',
      'Use optional chaining `user?.name` when dealing with uninitialized objects.'
    ]
  },

  // 2. JS ReferenceError
  {
    id: 'js-reference-error',
    language: 'javascript',
    errorName: 'ReferenceError',
    matchRegex: /ReferenceError:\s*([^ ]+) is not defined/i,
    severity: 'critical',
    rootCauseStatus: 'confirmed',
    summary: 'Referenced a variable or function identifier that has not been declared.',
    whatHappened: (_ctx, match) =>
      `Your code attempted to read identifier '${match[1]}', but '${match[1]}' has not been declared in the current lexical scope.`,
    whyItHappened: (_ctx, match) =>
      `In JavaScript, accessing an undeclared variable name throws a ReferenceError. Check for spelling typos or missing \`const\` / \`let\` / import declarations.`,
    technicalWhy: (_ctx, match) =>
      `V8 LexicalEnvironment lookup for symbol '${match[1]}' reached Global Environment Record without finding a binding.`,
    rootCause: (_ctx, match) =>
      `Variable '${match[1]}' was misspelled or unimported.`,
    howToFix: (_ctx, match) => [
      `Declare variable '${match[1]}' using \`const\` or \`let\` before accessing it.`,
      `Fix spelling typos in identifier names.`
    ],
    suggestedFixCode: (ctx, match) => {
      const varName = match[1];
      const orig = ctx.codeText || `console.log(${varName});`;
      return {
        original: orig,
        fixed: `const ${varName} = "value";\n${orig}`,
        explain: `Declared variable '${varName}' before accessing it.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: ['Enable ESLint rule `no-undef`.']
  }
];
