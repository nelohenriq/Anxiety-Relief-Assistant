import { NextResponse } from 'next/server';
import { getOllamaModels } from '../../../../services/providers/ollama';

/**
 * Handles the GET request to fetch Ollama models.
 *
 * @returns A JSON response containing the fetched Ollama models or an error message.
 *          - On success: Returns a JSON object with the models data.
 *          - On failure: Returns a JSON object with an empty models structure and an error message, along with a 500 status code.
 *
 * @throws Logs an error message to the console if fetching the models fails.
 */
export async function GET() {
  try {
    const result = await getOllamaModels();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json({ models: { local: [], cloud: [] }, error: 'Failed to fetch models' }, { status: 500 });
  }
}