import { NextRequest, NextResponse } from 'next/server';
import { getJournalAnalysis } from '../../../services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryText, language } = body;

    if (!entryText || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await getJournalAnalysis(entryText, language);

    return NextResponse.json({ analysis: result });
  } catch (error) {
    console.error('Error in journal API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze journal entry' },
      { status: 500 }
    );
  }
}