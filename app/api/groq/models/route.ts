import { NextResponse } from 'next/server';
import { getGroqModels, diagnoseGroqSetup, getGroqSetupInstructions } from '../../../../services/providers/groq';

/**
 * Handles Groq API related requests including models, diagnostics, and setup instructions.
 *
 * @param request - The incoming request object containing query parameters.
 * @returns A JSON response with the requested Groq information or an error message.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const language = searchParams.get('language') || 'en';

    switch (action) {
      case 'diagnose':
        const diagnosis = await diagnoseGroqSetup(language);
        return NextResponse.json(diagnosis);

      case 'setup-instructions':
        const instructions = getGroqSetupInstructions(language);
        return NextResponse.json({ instructions });

      case 'models':
        // Get API key from query parameters
        const apiKey = searchParams.get('apiKey');
        console.log('Groq models API - API key present:', !!apiKey);
        const result = await getGroqModels(apiKey || undefined);
        return NextResponse.json(result);

      default:
        const modelsResult = await getGroqModels();
        return NextResponse.json(modelsResult);
    }
  } catch (error) {
    console.error('Error in Groq API:', error);
    return NextResponse.json({ error: 'Failed to process Groq request' }, { status: 500 });
  }
}