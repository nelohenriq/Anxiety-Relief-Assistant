import { NextRequest, NextResponse } from 'next/server';
import { getForYouSuggestion } from '../../../services/llmService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, apiKey, profile, language } = body;

    if (!provider || !model || !profile || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const suggestion = await getForYouSuggestion(provider, model, apiKey, profile, language);
    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error in suggestions API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}