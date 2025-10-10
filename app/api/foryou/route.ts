import { NextRequest, NextResponse } from 'next/server';
import { getForYouSuggestion } from '../../../services/geminiService';
import { UserProfile } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, language } = body;

    if (!profile || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await getForYouSuggestion(
      profile as UserProfile,
      language
    );

    return NextResponse.json({ suggestion: result });
  } catch (error) {
    console.error('Error in foryou API:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}