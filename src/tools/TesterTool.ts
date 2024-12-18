import { Tool, ToolResult, ToolOptions } from './Tool';

interface TestResult {
  passed: boolean;
  description: string;
  expected: any;
  actual: any;
  error?: string;
}

interface TestCase {
  description: string;
  input: any;
  expected: any;
  validator?: (actual: any, expected: any) => boolean;
}

export class TesterTool extends Tool {
  private testCases: TestCase[] = [];

  constructor(options: ToolOptions) {
    super(options);
    this.name = 'tester';
    this.description = 'Run tests and validate code functionality';
  }

  async execute(params: Record<string, any>): Promise<ToolResult> {
    try {
      this.validateParams(params, ['code', 'tests']);
      
      const code = params.code as string;
      const tests = params.tests as TestCase[];
      
      // Add tests to the test suite
      this.testCases = tests;
      
      // Run the test suite
      const results = await this.runTests(code);
      
      // Calculate test summary
      const totalTests = results.length;
      const passedTests = results.filter(r => r.passed).length;
      const failedTests = totalTests - passedTests;
      
      return this.createResult(
        failedTests === 0,
        {
          results,
          summary: {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: (passedTests / totalTests) * 100
          }
        },
        failedTests > 0 ? `${failedTests} test(s) failed` : undefined,
        { testCases: this.testCases }
      );
    } catch (error) {
      return this.createResult(false, undefined, error.message);
    }
  }

  private async runTests(code: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const test of this.testCases) {
      try {
        // Create a safe execution environment
        const sandbox = {
          input: test.input,
          console: {
            log: (...args: any[]) => console.log('Test log:', ...args),
            error: (...args: any[]) => console.error('Test error:', ...args)
          }
        };

        // Execute the code in the sandbox
        const fn = new Function('sandbox', `
          with (sandbox) {
            ${code}
            return (${code.includes('return') ? '' : 'typeof result !== "undefined" ? result : '} undefined);
          }
        `);

        const actual = await fn(sandbox);
        
        // Validate the result
        const passed = test.validator ? 
          test.validator(actual, test.expected) : 
          this.defaultValidator(actual, test.expected);

        results.push({
          passed,
          description: test.description,
          expected: test.expected,
          actual
        });
      } catch (error) {
        results.push({
          passed: false,
          description: test.description,
          expected: test.expected,
          actual: undefined,
          error: error.message
        });
      }
    }

    return results;
  }

  private defaultValidator(actual: any, expected: any): boolean {
    if (typeof actual !== typeof expected) {
      return false;
    }

    if (actual === null || expected === null) {
      return actual === expected;
    }

    if (Array.isArray(actual) && Array.isArray(expected)) {
      return actual.length === expected.length &&
        actual.every((item, index) => this.defaultValidator(item, expected[index]));
    }

    if (typeof actual === 'object' && typeof expected === 'object') {
      const actualKeys = Object.keys(actual);
      const expectedKeys = Object.keys(expected);
      
      return actualKeys.length === expectedKeys.length &&
        actualKeys.every(key => this.defaultValidator(actual[key], expected[key]));
    }

    return actual === expected;
  }

  addTest(test: TestCase): void {
    this.testCases.push(test);
  }

  clearTests(): void {
    this.testCases = [];
  }
} 