import { RulePattern } from './types';

export const pythonRules: RulePattern[] = [
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
      },
      {
        title: 'getattr() with Fallback Default',
        category: 'Alternative',
        code: `val = getattr(user, '${match[1]}', 'Default Value')`,
        explanation: 'Safely retrieves the attribute or returns the fallback default value if user is None or missing the property.',
        tradeoffs: 'Can hide typos in attribute names if user is not None but missing the field.'
      },
      {
        title: 'Try / Except AttributeError Block',
        category: 'Advanced',
        code: `try:\n    val = user.${match[1]}\nexcept AttributeError:\n    val = None`,
        explanation: 'Catches the exception at runtime and assigns a fallback.',
        tradeoffs: 'Can catch unexpected AttributeErrors from inner function calls.'
      }
    ],
    preventionTips: [
      'Enable type hints (`user: Optional[User]`) and run `mypy` to detect None access statically.',
      'Return Null Object patterns instead of bare `None` in database lookup functions.',
      'Use `dict.get(key, default)` when reading values from parsed JSON or dictionaries.'
    ],
    extractLocation: (errorText, _codeText) => {
      const lineMatch = errorText.match(/line (\d+)/i);
      const fileMatch = errorText.match(/File "([^"]+)"/i);
      const funcMatch = errorText.match(/in ([a-zA-Z0-9_]+)/i);
      return {
        file: fileMatch ? fileMatch[1].split('/').pop() : 'script.py',
        line: lineMatch ? parseInt(lineMatch[1], 10) : 18,
        functionName: funcMatch ? funcMatch[1] : 'main'
      };
    }
  },
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
      `The dictionary schema did not include key '${match[1] || match[2]}', or key casing/spelling differs from expectations.`,
    howToFix: (_ctx, match) => [
      `Use \`dict.get('${match[1] || match[2]}', default_value)\` to safely return a fallback if missing.`,
      `Check key existence first using \`if '${match[1] || match[2]}' in my_dict:\`.`,
      `Use \`collections.defaultdict\` or \`dict.setdefault()\`.`
    ],
    suggestedFixCode: (_ctx, match) => {
      const k = match[1] || match[2];
      return {
        original: `val = data['${k}']`,
        fixed: `val = data.get('${k}', None)`,
        explain: `Replaced bracket access with .get('${k}') which safely returns None if the key is missing instead of crashing.`
      };
    },
    alternativeFixes: (_ctx, match) => [
      {
        title: 'dict.get() with Default Fallback',
        category: 'Recommended',
        code: `val = data.get('${match[1] || match[2]}', '')`,
        explanation: 'Returns a sensible default value (like an empty string or 0) when the key does not exist.',
        tradeoffs: 'None'
      }
    ],
    preventionTips: [
      'Validate API responses with Pydantic or TypedDict schemas.',
      'Log dictionary keys (`data.keys()`) when debugging data ingestion pipelines.'
    ]
  },
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
      `Lists are 0-indexed in Python. A list with 3 elements has valid indices 0, 1, and 2. Requesting index 3 or higher raises an IndexError.`,
    technicalWhy: (_ctx, _match) =>
      `PyList_GetItem checked bounds \`0 <= index < len(list)\` and evaluation returned false.`,
    rootCause: (_ctx, _match) =>
      `Loop bounds exceeded list length (e.g. \`for i in range(len(lst) + 1)\`), or empty list check was skipped.`,
    howToFix: (_ctx, _match) => [
      `Verify the list is non-empty before accessing index 0 (\`if len(my_list) > 0:\`).`,
      `Iterate directly over list elements (\`for item in my_list:\`) instead of manually tracking indices.`,
      `Check loop condition to ensure \`i < len(my_list)\`.`
    ],
    suggestedFixCode: (ctx, _match) => {
      return {
        original: ctx.codeText || `item = my_list[idx]`,
        fixed: `if idx < len(my_list):\n    item = my_list[idx]\nelse:\n    item = None`,
        explain: `Added bounds checking (\`idx < len(my_list)\`) before attempting element retrieval.`
      };
    },
    alternativeFixes: (_ctx, _match) => [
      {
        title: 'Direct Element Iteration',
        category: 'Recommended',
        code: `for item in my_list:\n    process(item)`,
        explanation: 'Avoids index math altogether by iterating over items directly.',
        tradeoffs: 'Does not provide numeric index unless combined with enumerate().'
      }
    ],
    preventionTips: [
      'Prefer `for item in items:` or `for i, item in enumerate(items):`.',
      'Use slices `my_list[0:1]` which safely return empty lists if out of bounds.'
    ]
  },
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
      `Python is strongly typed. Performing arithmetic between incompatible types (e.g., string + int) or passing the wrong argument type triggers a TypeError (${match[1]}).`,
    technicalWhy: (_ctx, match) =>
      `PyObject call/binary operator slot dispatch failed type verification: ${match[1]}.`,
    rootCause: (_ctx, _match) =>
      `Variable holds a type different from what the operation expected (e.g., string instead of int/float).`,
    howToFix: (_ctx, _match) => [
      `Explicitly cast variables using \`int()\`, \`str()\`, or \`float()\`.`,
      `Check input parameter types before executing function logic.`,
      `Use type annotations and static linters.`
    ],
    suggestedFixCode: (ctx, _match) => {
      return {
        original: ctx.codeText || `total = count + "5"`,
        fixed: `total = count + int("5")`,
        explain: `Explicitly converted string operand to integer before performing addition.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: [
      'Use explicit type conversion functions (`int()`, `str()`).',
      'Add Python type hints and run type checker static analysis.'
    ]
  }
];
