import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedExercises } from '../../../services/llmService';
import { UserProfile, DataConsentLevel, ExerciseFeedback } from '../../../types';

/**
 * Handles POST requests to generate personalized exercises based on user input.
 *
 * @param request - The incoming HTTP request object of type `NextRequest`.
 * @returns A `NextResponse` containing the generated exercises or an error message.
 *
 * ### Request Body:
 * - `symptoms` (string): A description of the user's symptoms. Must be a non-empty string.
 * - `profile` (UserProfile): The user's profile object containing relevant details.
 * - `consentLevel` (DataConsentLevel): The level of data consent provided by the user. 
 *   Must be one of: 'essential', 'enhanced', 'complete'.
 * - `feedback` (ExerciseFeedback): Optional feedback data for the exercise generation.
 * - `language` (string): The language in which the exercises should be generated. Must be a non-empty string.
 * - `provider` ('gemini' | 'ollama'): The AI provider to use for generating exercises.
 * - `model` (string): The specific AI model to use. Must be a non-empty string.
 * - `apiKey` (string): The API key for authenticating with the AI provider.
 *
 * ### Response:
 * - On success: Returns a JSON object containing the generated exercises, sources, and optional image URL.
 * - On validation failure: Returns a 400 status with a detailed error message.
 * - On AI service issues: Returns a 503 status with a message indicating temporary unavailability.
 * - On other errors: Returns a 500 status with a generic error message.
 *
 * ### Error Handling:
 * - Logs detailed error information, including message, stack trace, and error type.
 * - Handles specific error types such as `SyntaxError` and AI service-related errors.
 *
 * ### Logging:
 * - Logs incoming request details, including truncated values for sensitive fields.
 * - Logs the result of the `getPersonalizedExercises` function, including counts of exercises and sources.
 *
 * ### Dependencies:
 * - `getPersonalizedExercises`: A function that generates exercises based on the provided input.
 * - `NextResponse`: Used to construct HTTP responses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
        symptoms,
        profile,
        consentLevel,
        feedback,
        language,
        provider,
        model,
        apiKey
      } = body as {
        symptoms: string;
        profile: UserProfile;
        consentLevel: DataConsentLevel;
        feedback: ExerciseFeedback;
        language: string;
        provider: 'gemini' | 'ollama';
        model: string;
        apiKey: string;
      };

    let mutableModel = model; // Make model mutable for fallback logic

    // Enhanced input validation with detailed logging
    console.log('Received exercise request:', {
        symptoms: symptoms ? `${symptoms.substring(0, 50)}...` : 'MISSING',
        profile: profile ? 'PRESENT' : 'MISSING',
        consentLevel,
        language,
        provider,
        model: mutableModel ? `${mutableModel.substring(0, 30)}...` : 'MISSING',
        apiKey: apiKey ? 'PRESENT' : 'MISSING'
    });

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
       console.error('Validation failed: symptoms missing or empty');
       return NextResponse.json(
         { error: 'Symptoms description is required and must be a non-empty string' },
         { status: 400 }
       );
    }

    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        console.error('Validation failed: profile missing or not object');
        return NextResponse.json(
          { error: 'User profile is required and must be an object' },
          { status: 400 }
        );
    }

    if (!consentLevel || !['essential', 'enhanced', 'complete'].includes(consentLevel)) {
       console.error('Validation failed: invalid consent level:', consentLevel);
       return NextResponse.json(
         { error: 'Consent level is required and must be one of: essential, enhanced, complete' },
         { status: 400 }
       );
    }

    if (!language || typeof language !== 'string' || language.trim().length === 0) {
       console.error('Validation failed: language missing or empty');
       return NextResponse.json(
         { error: 'Language is required and must be a non-empty string' },
         { status: 400 }
       );
    }

    if (!provider || !mutableModel) {
        console.error('Validation failed: provider or model missing:', { provider, model: mutableModel });
        return NextResponse.json(
          { error: 'Provider and model are required' },
          { status: 400 }
        );
    }

    // For Ollama cloud models, require API key or fall back to local model
    if (provider === 'ollama' && mutableModel.startsWith('cloud:') && (!apiKey || apiKey.trim().length === 0)) {
        console.warn('No API key provided for Ollama cloud model, falling back to local model');
        // Fall back to a local model if available, otherwise use default
        mutableModel = 'llama3'; // Default local model
    }

    console.log('Calling getPersonalizedExercises with:', {
        provider,
        model: mutableModel.substring(0, 30) + '...',
        apiKey: apiKey ? 'PRESENT' : 'MISSING',
        symptomsLength: symptoms.length,
        language
    });

    const result = await getPersonalizedExercises(
        provider,
        mutableModel,
        apiKey,
        symptoms,
        profile,
        consentLevel,
        feedback || {},
        language
      );

    console.log('getPersonalizedExercises result:', {
        exercisesCount: result.exercises?.length || 0,
        sourcesCount: result.sources?.length || 0,
        hasImage: !!result.calmImageUrl
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in exercises API:', error);

    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';

    console.error('Full error details:', {
        message: errorMessage,
        stack: errorStack,
        type: typeof error,
        constructor: error?.constructor?.name
    });

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (errorMessage.includes('AI model') || errorMessage.includes('Ollama')) {
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