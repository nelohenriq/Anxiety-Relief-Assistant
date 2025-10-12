import { NextResponse } from 'next/server';
import { getForYouSuggestion } from '../../../../services/providers/groq';

/**
 * Handles POST requests for Groq-powered content generation.
 * Currently supports "For You" card suggestions.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, model, apiKey, profile, language } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'Model selection is required' }, { status: 400 });
    }

    switch (action) {
      case 'for-you-suggestion':
        if (!profile) {
          return NextResponse.json({ error: 'User profile is required for personalized suggestions' }, { status: 400 });
        }

        const suggestion = await getForYouSuggestion(model, apiKey, profile, language || 'en');
        return NextResponse.json({ suggestion });

      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Groq generate API:', error);

    // Handle specific Groq API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
        return NextResponse.json({
          error: 'Invalid or missing Groq API key. Please check your API key in the settings.'
        }, { status: 401 });
      } else if (error.message.includes('rate limit')) {
        return NextResponse.json({
          error: 'Groq rate limit exceeded. Please try again in a moment.'
        }, { status: 429 });
      } else if (error.message.includes('Cannot connect to Groq API') || error.message.includes('fetch')) {
        return NextResponse.json({
          error: 'Cannot connect to Groq API. Please check your internet connection and API key.'
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      error: 'Failed to generate content with Groq. Please ensure your API key is configured correctly.'
    }, { status: 500 });
  }
}