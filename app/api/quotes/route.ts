import { NextRequest, NextResponse } from 'next/server';
import { getMotivationalQuotes } from '../../../services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await getMotivationalQuotes(language);

    return NextResponse.json({ quotes: result });
  } catch (error) {
    console.error('Error in quotes API:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivational quotes' },
      { status: 500 }
    );
  }
}