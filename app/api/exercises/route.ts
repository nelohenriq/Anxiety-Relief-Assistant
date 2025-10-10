import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedExercises } from '../../../services/geminiService';
import { UserProfile, DataConsentLevel, ExerciseFeedback } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symptoms,
      profile,
      consentLevel,
      feedback,
      language
    } = body;

    // Enhanced input validation
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
       return NextResponse.json(
         { error: 'Symptoms description is required and must be a non-empty string' },
         { status: 400 }
       );
    }

    if (!profile || typeof profile !== 'object') {
       return NextResponse.json(
         { error: 'User profile is required and must be an object' },
         { status: 400 }
       );
    }

    if (!consentLevel || !['essential', 'enhanced', 'complete'].includes(consentLevel)) {
       return NextResponse.json(
         { error: 'Consent level is required and must be one of: essential, enhanced, complete' },
         { status: 400 }
       );
    }

    if (!language || typeof language !== 'string' || language.trim().length === 0) {
       return NextResponse.json(
         { error: 'Language is required and must be a non-empty string' },
         { status: 400 }
       );
    }

    const result = await getPersonalizedExercises(
       symptoms,
       profile,
       consentLevel,
       feedback || {},
       language
     );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in exercises API:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('AI model')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate exercises. Please check your input and try again.' },
      { status: 500 }
    );
  }
}