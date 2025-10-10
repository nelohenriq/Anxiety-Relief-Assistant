import { NextRequest, NextResponse } from 'next/server';
import { getThoughtChallengeHelp } from '../../../services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { situation, negativeThought, language } = body;

    if (!situation || !negativeThought || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await getThoughtChallengeHelp(
      situation,
      negativeThought,
      language
    );

    return NextResponse.json({ questions: result });
  } catch (error) {
    console.error('Error in thought-challenge API:', error);
    return NextResponse.json(
      { error: 'Failed to generate thought challenge' },
      { status: 500 }
    );
  }
}