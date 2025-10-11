import { NextRequest, NextResponse } from 'next/server';
import { getMotivationalQuotes } from '../../../services/llmService';

/**
 * Handles POST requests to the quotes API endpoint.
 *
 * This function processes incoming requests to generate motivational quotes
 * based on the provided parameters. It validates the request body, retrieves
 * quotes using the specified provider, model, API key, and language, and
 * returns the quotes in the response.
 *
 * @param {NextRequest} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the HTTP response
 * containing the generated quotes or an error message.
 *
 * @throws {Error} If an unexpected error occurs during processing.
 *
 * Request Body:
 * - `provider` (string): The name of the quotes provider (required).
 * - `model` (string): The model to use for generating quotes (required).
 * - `apiKey` (string): The API key for authenticating with the provider (optional).
 * - `language` (string): The language in which the quotes should be generated (required).
 *
 * Response:
 * - On success: Returns a JSON object with the generated quotes.
 * - On failure: Returns a JSON object with an error message and appropriate HTTP status code.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, apiKey, language } = body;

    if (!provider || !model || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // For Ollama cloud models, require API key or fall back to local model
    let mutableModel = model;
    if (provider === 'ollama' && mutableModel.startsWith('cloud:') && (!apiKey || apiKey.trim().length === 0)) {
      console.warn('No API key provided for Ollama cloud model, falling back to local model');
      mutableModel = 'llama3'; // Default local model
    }

    const quotes = await getMotivationalQuotes(provider, mutableModel, apiKey, language);
    return NextResponse.json({ quotes });

  } catch (error) {
    console.error('Error in quotes API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}