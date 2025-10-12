import { NextResponse } from 'next/server';
import { getOllamaModels, diagnoseOllamaSetup, getFallbackSuggestion, getOllamaSetupInstructions, getRecommendedModels, validateModelAvailability } from '../../../../services/providers/ollama';

/**
 * Handles the GET request to fetch Ollama models.
 *
 * @returns A JSON response containing the fetched Ollama models or an error message.
 *          - On success: Returns a JSON object with the models data.
 *          - On failure: Returns a JSON object with an empty models structure and an error message, along with a 500 status code.
 *
 * @throws Logs an error message to the console if fetching the models fails.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const language = searchParams.get('language') || 'en';

    switch (action) {
      case 'diagnose':
        const diagnosis = await diagnoseOllamaSetup(language);
        return NextResponse.json(diagnosis);

      case 'setup-instructions':
        const instructions = getOllamaSetupInstructions(language);
        return NextResponse.json({ instructions });

      case 'recommended-models':
        const recommendations = getRecommendedModels();
        return NextResponse.json(recommendations);

      case 'validate-model':
        const modelName = searchParams.get('model');
        if (!modelName) {
          return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
        }
        const validation = await validateModelAvailability(modelName);
        return NextResponse.json(validation);

      case 'fallback-suggestion':
        const fallbackMessage = getFallbackSuggestion(language);
        return NextResponse.json({ message: fallbackMessage });

      default:
        const result = await getOllamaModels();
        return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in Ollama models API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}