import { RulePattern } from './types';

export const cppRules: RulePattern[] = [
  {
    id: 'cpp-segmentation-fault',
    language: 'cpp',
    errorName: 'Segmentation Fault (SIGSEGV)',
    matchRegex: /segmentation fault|SIGSEGV|Signal 11/i,
    severity: 'critical',
    rootCauseStatus: 'confirmed',
    summary: 'Program attempted to read or write to an invalid memory location.',
    whatHappened: (_ctx, _match) =>
      `A Segmentation Fault occurred because your C/C++ binary accessed memory that it did not own (nullptr dereference, array out of bounds, or dangling pointer).`,
    whyItHappened: (_ctx, _match) =>
      `Operating Systems protect process memory address spaces. When an instruction attempts to access address 0x0 or unallocated RAM, the OS hardware MMU emits a SIGSEGV signal and halts the process.`,
    technicalWhy: (_ctx, _match) =>
      `CPU Page Fault exception occurred due to invalid virtual memory address mapping or access violation.`,
    rootCause: (_ctx, _match) =>
      `Dereferencing uninitialized pointer, accessing vector/array out of bounds, or double-free memory corruption.`,
    howToFix: (_ctx, _match) => [
      `Check pointer validity before dereferencing: \`if (ptr != nullptr) { ... }\`.`,
      `Use C++ smart pointers (\`std::unique_ptr\`, \`std::shared_ptr\`) instead of raw pointers.`,
      `Compile with AddressSanitizer (\`-fsanitize=address -g\`) to locate exact memory fault line.`
    ],
    suggestedFixCode: (ctx, _match) => {
      return {
        original: ctx.codeText || `node->id;`,
        fixed: `if (node != nullptr) {\n    std::cout << node->id;\n} else {\n    std::cerr << "Node is null!" << std::endl;\n}`,
        explain: `Added explicit nullptr guard check before dereferencing structure members.`
      };
    },
    alternativeFixes: () => [
      {
        title: 'std::shared_ptr / std::unique_ptr Smart Pointer',
        category: 'Recommended',
        code: `std::shared_ptr<Node> node = std::make_shared<Node>();`,
        explanation: 'Automates memory lifecycle management and prevents dangling pointer bugs.',
        tradeoffs: 'Slight smart pointer reference counting overhead.'
      }
    ],
    preventionTips: [
      'Initialize all raw pointers to `nullptr`.',
      'Use `std::vector::at(i)` which throws out_of_range instead of crashing silently.'
    ]
  }
];

export const sqlRules: RulePattern[] = [
  {
    id: 'sql-syntax-error',
    language: 'sql',
    errorName: 'SQL Syntax Error',
    matchRegex: /syntax error at or near ["']([^"']+)["']|SQL syntax error/i,
    severity: 'important',
    rootCauseStatus: 'confirmed',
    summary: 'The SQL parser failed to understand your SQL query statement structure.',
    whatHappened: (_ctx, match) =>
      `The database parser encountered unexpected token '${match[1] || 'clause'}' which breaks standard SQL grammar rules.`,
    whyItHappened: (_ctx, _match) =>
      `SQL queries follow strict clause ordering: SELECT -> FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> ORDER BY. A missing comma between columns or invalid clause placement breaks syntax parsing.`,
    technicalWhy: (_ctx, _match) =>
      `RDBMS Query Parser failed LR1 grammar shift/reduce token verification.`,
    rootCause: (_ctx, match) =>
      `Missing comma between column expressions, incorrect clause order, or misspelled keyword near '${match[1] || 'token'}'.`,
    howToFix: (_ctx, match) => [
      `Ensure commas separate all selected column items in the SELECT list.`,
      `Verify WHERE comes before GROUP BY and HAVING comes after GROUP BY.`,
      `Check keyword spelling and quote identifiers properly.`
    ],
    suggestedFixCode: (ctx, match) => {
      return {
        original: ctx.codeText || `COUNT(id) AS total_orders\nSUM(total_amount)`,
        fixed: `COUNT(id) AS total_orders,\nSUM(total_amount)`,
        explain: `Added missing comma between SELECT list projection expressions.`
      };
    },
    alternativeFixes: () => [],
    preventionTips: [
      'Use a SQL formatter or IDE plugin to catch syntax mistakes before execution.',
      'Use parameterized ORM query builders (Prisma, SQLAlchemy) for complex queries.'
    ]
  }
];
