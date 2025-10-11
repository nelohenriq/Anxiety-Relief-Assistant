import { NextRequest, NextResponse } from 'next/server';
import { getForYouSuggestion } from '../../../services/llmService';

/**
 * Handles POST requests to the suggestions API endpoint.
 *
 * This function processes incoming requests to generate suggestions based on the provided
 * parameters. It validates the request body, extracts the required parameters, and calls
 * the `getForYouSuggestion` function to generate a suggestion. If any required parameters
 * are missing, it returns a 400 Bad Request response. In case of an error during processing,
 * it returns a 500 Internal Server Error response.
 *
 * @param request - The incoming HTTP request object of type `NextRequest`.
 * @returns A `NextResponse` object containing the generated suggestion or an error message.
 *
 * @throws Will log an error message to the console if an exception occurs during processing.
 *
 * Request Body:
 * - `provider` (string): The provider to use for generating suggestions.
 * - `model` (string): The model to use for generating suggestions.
 * - `apiKey` (string | undefined): The API key for authentication (optional).
 * - `profile` (string): The user profile for generating suggestions.
 * - `language` (string): The language for generating suggestions.
 *
 * Response:
 * - On success: A JSON object containing the generated suggestion.
 * - On failure: A JSON object containing an error message and an appropriate HTTP status code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, apiKey, profile, language } = body;

    if (!provider || !model || !profile || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // For Ollama cloud models, require API key or fall back to local model
    let mutableModel = model;
    if (provider === 'ollama' && mutableModel.startsWith('cloud:') && (!apiKey || apiKey.trim().length === 0)) {
      console.warn('No API key provided for Ollama cloud model, falling back to local model');
      mutableModel = 'llama3'; // Default local model
    }

    const suggestion = await getForYouSuggestion(provider, mutableModel, apiKey, profile, language);
    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error in suggestions API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}