import { Exercise, UserProfile, DataConsentLevel, PlanHistoryEntry, MoodLog, JournalEntry, CompletedExerciseLog } from '../types';

const API_BASE = '/api';

export const aiGeneratePlan = async (params: {
  provider: string;
  symptoms: string;
  profile: UserProfile;
  consentLevel: DataConsentLevel;
  feedback: any;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error (aiGeneratePlan):', response.status, errorText);
    throw new Error(`AI generation failed: ${response.status} ${errorText.substring(0, 100)}`);
  }
  return response.json();
};

export const aiForYou = async (params: {
  provider: string;
  profile: UserProfile;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/for-you`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error (aiForYou):', response.status, errorText);
    throw new Error(`AI generation failed: ${response.status} ${errorText.substring(0, 100)}`);
  }
  const data = await response.json();
  return data.suggestion;
};

export const aiAnalyzeJournal = async (params: {
  provider: string;
  text: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/analyze-journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('AI analysis failed');
  const data = await response.json();
  return data.analysis;
};

export const aiMotivationalQuotes = async (params: {
  provider: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('AI generation failed');
  const data = await response.json();
  return data.quotes;
};

export const aiChallengeThought = async (params: {
  provider: string;
  situation: string;
  negativeThought: string;
  language: string;
  model?: string;
  apiKey?: string;
  baseURL?: string;
}) => {
  const response = await fetch(`${API_BASE}/ai/challenge-thought`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('AI analysis failed');
  const data = await response.json();
  return data.help;
};

export const fetchOllamaModels = async () => {
  const response = await fetch(`${API_BASE}/ai/ollama-models`);
  if (!response.ok) throw new Error('Failed to fetch Ollama models');
  return response.json();
};

export const saveUser = async (userId: string, data: { profile: UserProfile, consentLevel: DataConsentLevel }) => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, ...data }),
  });
  if (!response.ok) throw new Error('Failed to save user data');
};

export const saveMood = async (userId: string, log: MoodLog) => {
  const response = await fetch(`${API_BASE}/users/${userId}/moods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!response.ok) throw new Error('Failed to save mood log');
};

export const saveJournalEntry = async (userId: string, entry: JournalEntry) => {
  const response = await fetch(`${API_BASE}/users/${userId}/journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Failed to save journal entry');
};

export const savePlan = async (userId: string, entry: PlanHistoryEntry) => {
  const response = await fetch(`${API_BASE}/users/${userId}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error('Failed to save plan history');
};

export const saveExerciseLog = async (userId: string, log: CompletedExerciseLog) => {
  const response = await fetch(`${API_BASE}/users/${userId}/exercise-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!response.ok) throw new Error('Failed to save exercise log');
};

export const fetchUserHistory = async (userId: string) => {
  const [plans, moods, journal] = await Promise.all([
    fetch(`${API_BASE}/users/${userId}/plans`).then(r => r.json()),
    fetch(`${API_BASE}/users/${userId}/moods`).then(r => r.json()),
    fetch(`${API_BASE}/users/${userId}/journal`).then(r => r.json()),
  ]);
  return { plans, moods, journal };
};
