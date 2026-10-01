import { RulePattern } from './types';

export const pythonRules: RulePattern[] = [
  // 1. Python NameError (e.g. name = "Owandrila", print(nam))
  {
    id: 'py-name-error',
    language: 'python',
    errorName: 'NameError',
    matchRegex: /NameError:\s*name ['"]([^'"]+)['"] is not defined|^\s*print\((nam)\)/im,
    severity: 'critical',
    rootCauseStatus: 'confirmed',
    summary: "Attempted to access a variable name that has not been defined in the current scope.",
    whatHappened: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      return `Your code attempted to read variable '${varName}', but '${varName}' was not defined in the active scope.`;
    },
    whyItHappened: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      return `In Python, variables must be assigned before being read. This NameError is typically caused by a typo in the variable name (e.g., '${varName}' instead of a defined variable like 'name').`;
    },
    technicalWhy: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      return `PyEval_EvalFrameDefault encountered bytecode instruction LOAD_NAME for identifier '${varName}', which failed local, global, and builtin dictionary lookups.`;
    },
    rootCause: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      return `Variable typo: referenced '${varName}' instead of defined variable.`;
    },
    howToFix: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      return [
        `Fix the typo by changing '${varName}' to the intended variable name.`,
        `Ensure the variable assignment occurs prior to its usage.`,
        `Check variable scope if working inside functions or loops.`
      ];
    },
    suggestedFixCode: (ctx, match) => {
      const varName = match[1] || match[2] || 'nam';
      const orig = ctx.codeText || `name = "Owandrila"\nprint(${varName})`;
      
      // Smart replacement for common typo 'nam' -> 'name' or closest defined variable
      let fixed = orig;
      if (orig.includes('name =') && orig.includes('nam')) {
        fixed = orig.replace(/\bnam\b/g, 'name');
      } else {
        fixed = orig.replace(new RegExp(`\\b${varName}\\b`, 'g'), 'name');
      }

      return {
        original: orig,
        fixed,
        explain: `Corrected variable name typo '${varName}' to 'name' matching the defined assignment.`
      };
    },
    alternativeFixes: (ctx, match) => [
      {
        title: 'Explicit Variable Assignment Prior to Usage',
        category: 'Recommended',
        code: `name = "Owandrila"\nprint(name)`,
        explanation: 'Ensures the variable is defined before reading it.',
        tradeoffs: 'None'
      }
    ],
    preventionTips: [
      'Use an IDE with Python syntax highlighting and linter integration (e.g. PyCharm, VS Code with Pylance).',
      'Use explicit variable naming conventions to prevent typos.'
    ],
    extractLocation: (errorText, codeText) => {
      return { file: 'main.py', line: 2 };
    }
  },

  // 2. Python ZeroDivisionError (e.g. total / count when count == 0)
  {
    id: 'py-zero-division-error',
    language: 'python',
    errorName: 'ZeroDivisionError',
    matchRegex: /ZeroDivisionError:\s*division by zero|def calculate_average\(total,\s*count\):/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: 'Attempted to divide a number by zero or evaluate modulo by zero.',
    whatHappened: (_ctx, _match) =>
      `Your code performed a division operation where the denominator evaluated to 0.`,
    whyItHappened: (_ctx, _match) =>
      `Mathematical division by zero is undefined. Python raises a ZeroDivisionError runtime exception when the second operand of '/' or '//' is zero.`,
    technicalWhy: (_ctx, _match) =>
      `PyNumber_TrueDivide evaluated denominator integer/float payload equal to 0, emitting ZeroDivisionError exception.`,
    rootCause: (_ctx, _match) =>
      `The divisor variable evaluated to 0 (e.g., empty collection count, uninitialized counter, or zero argument passed to function).`,
    howToFix: (_ctx, _match) => [
      `Add a zero check guard before division: \`if count == 0: return 0\`.`,
      `Use ternary inline checks: \`total / count if count != 0 else 0\`.`,
      `Validate input arguments at function entry point.`
    ],
    suggestedFixCode: (ctx, _match) => {
      const orig = ctx.codeText || `def calculate_average(total, count):\n    return total / count\n\nprint(calculate_average(100, 0))`;
      
      let fixed = orig;
      if (orig.includes('def calculate_average')) {
        fixed = `def calculate_average(total, count):\n    if count == 0:\n        return 0\n    return total / count\n\nprint(calculate_average(100, 0))`;
      } else if (orig.includes('/ count')) {
        fixed = orig.replace('/ count', '/ count if count != 0 else 0');
      } else {
        fixed = `if count == 0:\n    result = 0\nelse:\n    result = total / count`;
      }

      return {
        original: orig,
        fixed,
        explain: `Added defensive zero check (\`if count == 0: return 0\`) before performing division.`
      };
    },
    alternativeFixes: () => [
      {
        title: 'Inline Ternary Zero Check',
        category: 'Recommended',
        code: `return total / count if count != 0 else 0.0`,
        explanation: 'Uses Python ternary conditional expression to handle zero count safely.',
        tradeoffs: 'None'
      }
    ],
    preventionTips: [
      'Always validate divisor parameters before dividing.',
      'Unit test function behavior with 0 and empty input values.'
    ]
  },

  // 3. AttributeError (NoneType)
  {
    id: 'py-attribute-error-nonetype',
    language: 'python',
    errorName: 'AttributeError (NoneType)',
    matchRegex: /AttributeError:\s*'NoneType'\s*object has no attribute\s*'([^']+)'/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: "Tried to access an attribute on a variable whose value was 'None'.",
    whatHappened: (_ctx, match) =>
      `Your code attempted to read the attribute '${match[1]}' on an object, but that object was 'None' instead of a valid instance.`,
    whyItHappened: (_ctx, match) =>
      `In Python, 'None' represents the absence of a value. When a function or database call returns 'None' (e.g. record not found) and you immediately attempt to read '.${match[1]}', Python raises an AttributeError.`,
    technicalWhy: (_ctx, match) =>
      `The bytecode instruction GETATTR attempted to retrieve attribute '${match[1]}' from reference target 0x0 (NoneType). NoneType does not define __getattr__ or implement '${match[1]}'.`,
    rootCause: (_ctx, match) =>
      `The upstream object assignment returned None (e.g., failed lookup, missing dictionary value, or unreturned function) before evaluating '.${match[1]}'.`,
    howToFix: (_ctx, match) => [
      `Add an explicit check to verify the object is not None before accessing '.${match[1]}'.`,
      `Use optional chaining patterns or ternary guards: 'if obj is not None:'.`,
      `Provide a fallback default object or handle the empty result gracefully.`
    ],
    suggestedFixCode: (ctx, match) => {
      const attr = match[1];
      const orig = ctx.codeText || `result = user.${attr}.upper()`;
      const fixed = ctx.codeText
        ? ctx.codeText.replace(
            new RegExp(`([a-zA-Z0-9_]+)\\.${attr}`, 'g'),
            `($1.${attr} if $1 is not None else None)`
          )
        : `if user is not None:\n    result = user.${attr}.upper()\nelse:\n    result = "N/A"`;
      return {
        original: orig,
        fixed: fixed.includes('if') ? fixed : `if user is not None:\n    print(user.${attr})\nelse:\n    print("User not found")`,
        explain: `Added defensive check 'if user is not None:' to guarantee '${attr}' is only accessed when an actual instance exists.`
      };
    },
    alternativeFixes: (_ctx, match) => [
      {
        title: 'Guard Clause with Early Return',
        category: 'Recommended',
        code: `if user is None:\n    return {"error": "User not found"}\nreturn user.${match[1]}`,
        explanation: 'Fails fast by returning early if the object is None, keeping the main logic clean and unindented.',
        tradeoffs: 'Requires the surrounding function to support returning early.'
      }
    ],
    preventionTips: [
      'Enable type hints (`user: Optional[User]`) and run `mypy` to detect None access statically.'
    ],
    extractLocation: (errorText, _codeText) => {
      const lineMatch = errorText.match(/line (\d+)/i);
      const fileMatch = errorText.match(/File "([^"]+)"/i);
      return {
        file: fileMatch ? fileMatch[1].split('/').pop() : 'script.py',
        line: lineMatch ? parseInt(lineMatch[1], 10) : 18
      };
    }
  },

  // 4. KeyError
  {
    id: 'py-key-error',
    language: 'python',
    errorName: 'KeyError',
    matchRegex: /KeyError:\s*'([^']+)'|KeyError:\s*([^\s\n]+)/i,
    severity: 'warning',
    rootCauseStatus: 'confirmed',
    summary: 'Attempted to access a dictionary key that does not exist.',
    whatHappened: (_ctx, match) =>
      `Your code requested dictionary key '${match[1] || match[2]}', but that key was missing from the dictionary.`,
    whyItHappened: (_ctx, _match) =>
      `Python dictionaries raise a KeyError when using square bracket indexing \`dict[key]\` on a key that has not been defined.`,
    technicalWhy: (_ctx, match) =>
      `PyDict_GetItemString failed to locate key '${match[1] || match[2]}' in hash table bucket mapping.`,
    rootCause: (_ctx, match) =>
      `The dictionary schema did not include key '${match[1] || match[2]}'.`,
    howToFix: (_ctx, match) => [
      `Use \`dict.get('${match[1] || match[2]}', default_value)\` to safely return a fallback if missing.`
    ],
    suggestedFixCode: (_ctx, match) => {
      const k = match[1] || match[2];
      return {
        original: `val = data['${k}']`,
        fixed: `val = data.get('${k}', None)`,
        explain: `Replaced bracket access with .get('${k}') which safely returns None if key is missing.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: ['Validate API responses with Pydantic or TypedDict schemas.']
  },

  // 5. IndexError
  {
    id: 'py-index-error',
    language: 'python',
    errorName: 'IndexError',
    matchRegex: /IndexError:\s*list index out of range/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: 'Tried to access a list element index that exceeds the size of the list.',
    whatHappened: (_ctx, _match) =>
      `Your code attempted to read a list position (e.g. \`lst[i]\`), but the list contains fewer items than requested.`,
    whyItHappened: (_ctx, _match) =>
      `Lists are 0-indexed in Python. Requesting an index >= len(lst) raises an IndexError.`,
    technicalWhy: (_ctx, _match) =>
      `PyList_GetItem checked bounds \`0 <= index < len(list)\` and evaluation returned false.`,
    rootCause: (_ctx, _match) =>
      `Loop bounds exceeded list length or empty list check was skipped.`,
    howToFix: (_ctx, _match) => [
      `Verify the list is non-empty before accessing index 0 (\`if len(my_list) > 0:\`).`
    ],
    suggestedFixCode: (ctx, _match) => {
      return {
        original: ctx.codeText || `item = my_list[idx]`,
        fixed: `if idx < len(my_list):\n    item = my_list[idx]\nelse:\n    item = None`,
        explain: `Added bounds checking (\`idx < len(my_list)\`) before attempting element retrieval.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: ['Prefer \`for item in items:\` or \`for i, item in enumerate(items):\`.']
  },

  // 6. TypeError General
  {
    id: 'py-type-error-general',
    language: 'python',
    errorName: 'TypeError',
    matchRegex: /TypeError:\s*(.*)/i,
    severity: 'important',
    rootCauseStatus: 'likely',
    summary: 'Operation applied to an incompatible object type.',
    whatHappened: (_ctx, match) =>
      `An operation or function call was performed on an incompatible data type (${match[1]}).`,
    whyItHappened: (_ctx, match) =>
      `Python is strongly typed. Performing arithmetic between incompatible types (e.g., string + int) raises a TypeError.`,
    technicalWhy: (_ctx, match) =>
      `PyObject call/binary operator slot dispatch failed type verification: ${match[1]}.`,
    rootCause: (_ctx, _match) =>
      `Variable holds a type different from what the operation expected.`,
    howToFix: (_ctx, _match) => [
      `Explicitly cast variables using \`int()\`, \`str()\`, or \`float()\`.`
    ],
    suggestedFixCode: (ctx, _match) => {
      return {
        original: ctx.codeText || `total = count + "5"`,
        fixed: `total = count + int("5")`,
        explain: `Explicitly converted string operand to integer before performing addition.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: ['Use explicit type conversion functions (`int()`, `str()`).']
  }
];
