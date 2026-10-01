import { analyzeCodeStructure } from '../services/codeAnalyzerService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
}

export function runAllCodeAnalyzerTests() {
  console.log('🧪 Running Code Structure & Complexity Analyzer Test Suite...\n');
  let passedCount = 0;

  // Test Case A: Simple Python print statement
  try {
    const code = `print("Hello World")`;
    const res = analyzeCodeStructure(code, 'python');
    assert(!res.isError, 'Expected no error for simple print statement');
    assert(res.metrics!.codeLines === 1, `Expected SLOC 1, got ${res.metrics!.codeLines}`);
    assert(res.metrics!.cyclomaticComplexity === 1, `Expected Cyclomatic Complexity 1, got ${res.metrics!.cyclomaticComplexity}`);
    assert(res.smells.length === 0, `Expected 0 code smells, got ${res.smells.length}`);
    assert(res.metrics!.qualityScore >= 80, `Expected Quality Score >= 80, got ${res.metrics!.qualityScore}`);

    console.log('✅ Test Case A PASSED: Simple Python print statement metrics verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case A FAILED:', err.message);
  }

  // Test Case B: Python list comprehension filtering and squaring numbers
  try {
    const code = `[x**2 for x in numbers if x % 2 == 0]`;
    const res = analyzeCodeStructure(code, 'python');
    assert(!res.isError, 'Expected no error for list comprehension');
    assert(res.metrics!.codeLines === 1, `Expected SLOC 1, got ${res.metrics!.codeLines}`);
    assert(res.metrics!.cyclomaticComplexity === 3, `Expected Cyclomatic Complexity 3, got ${res.metrics!.cyclomaticComplexity}`);
    assert(res.smells.length === 0, `Expected 0 code smells, got ${res.smells.length}`);

    console.log('✅ Test Case B PASSED: Python list comprehension metrics verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case B FAILED:', err.message);
  }

  // Test Case C: Function containing nested if statements
  try {
    const code = `def check(a, b):\n    if a > 0:\n        if b > 0:\n            if a > b:\n                return True`;
    const res = analyzeCodeStructure(code, 'python');
    assert(!res.isError, 'Expected no error for nested if statements');
    const nestedSmell = res.smells.find((s) => s.title.includes('Deeply Nested Control Structure'));
    assert(nestedSmell !== undefined, 'Expected Deeply Nested Control Structure smell to be detected');
    assert(nestedSmell!.lineNumber === 4, `Expected smell at line 4, got line ${nestedSmell!.lineNumber}`);
    assert(nestedSmell!.snippet.includes('if a > b'), `Expected snippet containing 'if a > b', got '${nestedSmell!.snippet}'`);

    console.log('✅ Test Case C PASSED: Nested control structures smell & line number verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case C FAILED:', err.message);
  }

  // Test Case D: Function containing a genuinely unused variable
  try {
    const code = `def foo():\n    unused_var = 42\n    return 10`;
    const res = analyzeCodeStructure(code, 'python');
    assert(!res.isError, 'Expected no error for unused variable code');
    const unusedSmell = res.smells.find((s) => s.title.includes("Unused Variable 'unused_var'"));
    assert(unusedSmell !== undefined, "Expected Unused Variable 'unused_var' smell to be detected");
    assert(unusedSmell!.lineNumber === 2, `Expected smell at line 2, got line ${unusedSmell!.lineNumber}`);
    assert(unusedSmell!.snippet.includes('unused_var = 42'), `Expected snippet containing 'unused_var = 42', got '${unusedSmell!.snippet}'`);

    console.log('✅ Test Case D PASSED: Genuinely unused variable smell & line number verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case D FAILED:', err.message);
  }

  // Test Case E: Valid JavaScript with no obvious code smells
  try {
    const code = `function add(a, b) {\n  return a + b;\n}`;
    const res = analyzeCodeStructure(code, 'javascript');
    assert(!res.isError, 'Expected no error for valid JS function');
    assert(res.metrics!.codeLines === 3, `Expected SLOC 3, got ${res.metrics!.codeLines}`);
    assert(res.smells.length === 0, `Expected 0 code smells, got ${res.smells.length}`);
    assert(res.metrics!.maintainabilityIndex >= 80, `Expected MI >= 80, got ${res.metrics!.maintainabilityIndex}`);

    console.log('✅ Test Case E PASSED: Valid JavaScript metrics verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case E FAILED:', err.message);
  }

  // Test Case F: Invalid C++ code producing a parser or compilation diagnostic
  try {
    const code = `int main() {\n    std::cout << "Hello"`;
    const res = analyzeCodeStructure(code, 'cpp');
    assert(res.isError === true, 'Expected isError to be true for malformed C++ code');
    assert(res.errorTitle?.includes('Parser / Syntax Diagnostic Error') === true, `Expected diagnostic title, got '${res.errorTitle}'`);
    assert(res.errorMessage?.includes('Missing closing brace') === true, `Expected missing brace message, got '${res.errorMessage}'`);

    console.log('✅ Test Case F PASSED: Invalid C++ code produces parser/syntax diagnostic error.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test Case F FAILED:', err.message);
  }

  console.log(`\n🎉 Code Analyzer Test Summary: ${passedCount}/6 Tests PASSED.`);
  if (passedCount !== 6) {
    process.exit(1);
  }
}

// Execute tests if invoked directly
runAllCodeAnalyzerTests();
