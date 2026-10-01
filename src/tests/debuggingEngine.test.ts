import { evaluateRules, detectLanguageFromContent } from '../rules/engine';
import { validateFixResult } from '../services/validationService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
}

export function runAllRegressionTests() {
  console.log('🧪 Running Helping Hand Debugging Engine Regression Test Suite...\n');
  let passedCount = 0;

  // Test 1: Python NameError (name = "Owandrila", print(nam))
  try {
    const inputCode = `name = "Owandrila"\nprint(nam)`;
    const langDetect = detectLanguageFromContent('', inputCode);
    assert(langDetect.language === 'python', `Expected language 'python', got '${langDetect.language}'`);

    const res = evaluateRules('', inputCode, 'python');
    assert(res !== null, 'AnalysisResult should not be null');
    assert(res!.language === 'python', `Result language should be 'python', got '${res!.language}'`);
    assert(res!.errorType.includes('NameError'), `Expected NameError, got '${res!.errorType}'`);
    assert(res!.suggestedFix === 'name = "Owandrila"\nprint(name)', `Expected fix 'name = "Owandrila"\\nprint(name)', got '${res!.suggestedFix}'`);
    assert(!res!.suggestedFix.includes('try {'), 'Python fix should not contain JavaScript try/catch syntax');
    assert(!res!.suggestedFix.includes('console.log'), 'Python fix should not contain JavaScript console.log syntax');
    assert(res!.validation.status === 'STATIC CHECK PASSED', `Expected status 'STATIC CHECK PASSED', got '${res!.validation.status}'`);

    console.log('✅ Test 1 PASSED: Python NameError typo fix verified (name = "Owandrila" -> print(name)).');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 1 FAILED:', err.message);
  }

  // Test 2: Python ZeroDivisionError (calculate_average(100, 0))
  try {
    const inputCode = `def calculate_average(total, count):\n    return total / count\n\nprint(calculate_average(100, 0))`;
    const errorText = `ZeroDivisionError: division by zero`;
    
    const res = evaluateRules(errorText, inputCode, 'python');
    assert(res !== null, 'AnalysisResult should not be null');
    assert(res!.language === 'python', `Result language should be 'python', got '${res!.language}'`);
    assert(res!.errorType.includes('ZeroDivisionError'), `Expected ZeroDivisionError, got '${res!.errorType}'`);
    assert(res!.suggestedFix.includes('count == 0'), `Expected zero count check in fix, got '${res!.suggestedFix}'`);
    assert(!res!.suggestedFix.includes('catch (err)'), 'Python fix should not contain JS catch syntax');
    assert(res!.validation.status === 'STATIC CHECK PASSED', `Expected status 'STATIC CHECK PASSED', got '${res!.validation.status}'`);

    console.log('✅ Test 2 PASSED: Python ZeroDivisionError guard fix verified.');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 2 FAILED:', err.message);
  }

  // Test 3: JavaScript TypeError (user.name on undefined)
  try {
    const inputCode = `const user = undefined;\nconsole.log(user.name);`;
    const langDetect = detectLanguageFromContent('', inputCode);
    assert(langDetect.language === 'javascript', `Expected language 'javascript', got '${langDetect.language}'`);

    const res = evaluateRules('', inputCode, 'javascript');
    assert(res !== null, 'AnalysisResult should not be null');
    assert(res!.language === 'javascript', `Result language should be 'javascript', got '${res!.language}'`);
    assert(res!.errorType.includes('TypeError'), `Expected TypeError, got '${res!.errorType}'`);
    assert(res!.suggestedFix.includes('user?.name'), `Expected optional chaining user?.name, got '${res!.suggestedFix}'`);
    assert(res!.validation.status === 'STATIC CHECK PASSED', `Expected status 'STATIC CHECK PASSED', got '${res!.validation.status}'`);

    console.log('✅ Test 3 PASSED: JavaScript TypeError undefined access fix verified (user?.name).');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 3 FAILED:', err.message);
  }

  // Test 4: Java NullPointerException (name.length() on null)
  try {
    const inputCode = `String name = null;\nSystem.out.println(name.length());`;
    const langDetect = detectLanguageFromContent('', inputCode);
    assert(langDetect.language === 'java', `Expected language 'java', got '${langDetect.language}'`);

    const res = evaluateRules('', inputCode, 'java');
    assert(res !== null, 'AnalysisResult should not be null');
    assert(res!.language === 'java', `Result language should be 'java', got '${res!.language}'`);
    assert(res!.errorType.includes('NullPointerException'), `Expected NullPointerException, got '${res!.errorType}'`);
    assert(res!.suggestedFix.includes('if (name != null)'), `Expected null check if (name != null), got '${res!.suggestedFix}'`);
    assert(res!.validation.status === 'STATIC CHECK PASSED', `Expected status 'STATIC CHECK PASSED', got '${res!.validation.status}'`);

    console.log('✅ Test 4 PASSED: Java NullPointerException fix verified (if (name != null)).');
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 4 FAILED:', err.message);
  }

  console.log(`\n🎉 Regression Test Summary: ${passedCount}/4 Tests PASSED.`);
  if (passedCount !== 4) {
    process.exit(1);
  }
}

// Execute tests on direct invocation
runAllRegressionTests();
