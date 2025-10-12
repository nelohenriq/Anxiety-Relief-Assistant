/**
 * Test utilities for Groq integration
 * These functions help verify the Groq API integration is working correctly
 */

import { getForYouSuggestion, getGroqModels } from './groq';

export interface TestResult {
  success: boolean;
  responseTime: number;
  error?: string;
  data?: any;
}

/**
 * Test basic Groq API connectivity and model availability
 */
export const testGroqConnectivity = async (): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    const { models, error } = await getGroqModels();

    if (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: `Failed to fetch models: ${error}`
      };
    }

    if (!models.models || models.models.length === 0) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: 'No models available'
      };
    }

    return {
      success: true,
      responseTime: Date.now() - startTime,
      data: { availableModels: models.models.length }
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test For You suggestion generation with a basic profile
 */
export const testForYouGeneration = async (apiKey: string): Promise<TestResult> => {
  const startTime = Date.now();

  try {
    // Basic test profile
    const testProfile = {
      age: 30,
      workEnvironment: 'office' as const,
      activityLevel: 'moderately_active' as const,
      accessToNature: 'limited' as const
    };

    // Get available models dynamically
    const { models, error } = await getGroqModels(apiKey);
    if (error || !models.models || models.models.length === 0) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: `No models available: ${error || 'No models returned from API'}`
      };
    }

    // Use the first available model for testing
    const testModel = models.models[0];

    const suggestion = await getForYouSuggestion(
      testModel,
      apiKey,
      testProfile,
      'en'
    );

    if (!suggestion || suggestion.trim().length === 0) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: 'Empty response received'
      };
    }

    return {
      success: true,
      responseTime: Date.now() - startTime,
      data: {
        suggestionLength: suggestion.length,
        suggestionPreview: suggestion.substring(0, 100) + '...'
      }
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test rate limiting behavior by making multiple rapid requests
 */
export const testRateLimiting = async (apiKey: string, requestCount: number = 5): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  for (let i = 0; i < requestCount; i++) {
    const result = await testForYouGeneration(apiKey);
    results.push(result);

    // Small delay between requests to avoid overwhelming the API
    if (i < requestCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};

/**
 * Comprehensive test suite for Groq integration
 */
export const runGroqTestSuite = async (apiKey: string) => {
  console.log('🚀 Starting Groq integration test suite...');

  // Test 1: Basic connectivity
  console.log('📡 Testing basic connectivity...');
  const connectivityTest = await testGroqConnectivity();
  console.log(`Connectivity test: ${connectivityTest.success ? '✅ PASS' : '❌ FAIL'} (${connectivityTest.responseTime}ms)`);
  if (!connectivityTest.success) {
    console.error('❌ Connectivity test failed:', connectivityTest.error);
    return { overallSuccess: false, tests: { connectivityTest } };
  }

  // Test 2: Single generation request
  console.log('⚡ Testing single generation request...');
  const generationTest = await testForYouGeneration(apiKey);
  console.log(`Generation test: ${generationTest.success ? '✅ PASS' : '❌ FAIL'} (${generationTest.responseTime}ms)`);
  if (!generationTest.success) {
    console.error('❌ Generation test failed:', generationTest.error);
    return { overallSuccess: false, tests: { connectivityTest, generationTest } };
  }

  // Test 3: Multiple requests (rate limiting test)
  console.log('🔄 Testing rate limiting with multiple requests...');
  const rateLimitTests = await testRateLimiting(apiKey, 3);

  const successfulRequests = rateLimitTests.filter(test => test.success).length;
  const avgResponseTime = rateLimitTests.reduce((sum, test) => sum + test.responseTime, 0) / rateLimitTests.length;

  console.log(`Rate limit test: ${successfulRequests}/${rateLimitTests.length} successful (avg: ${avgResponseTime.toFixed(0)}ms)`);

  const failedTests = rateLimitTests.filter(test => !test.success);
  if (failedTests.length > 0) {
    console.warn('⚠️ Some rate limit tests failed:', failedTests.map(test => test.error));
  }

  const overallSuccess = successfulRequests >= rateLimitTests.length * 0.8; // Allow 20% failure rate

  console.log(`\n🏁 Test suite ${overallSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`📊 Summary: ${successfulRequests}/${rateLimitTests.length + 2} tests passed`);

  return {
    overallSuccess,
    tests: {
      connectivityTest,
      generationTest,
      rateLimitTests,
      summary: {
        totalTests: rateLimitTests.length + 2,
        passedTests: successfulRequests + (connectivityTest.success ? 1 : 0) + (generationTest.success ? 1 : 0),
        avgResponseTime: avgResponseTime
      }
    }
  };
};