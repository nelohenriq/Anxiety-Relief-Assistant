import { getPersonalizedExercises as getGeminiExercises, getJournalAnalysis as getGeminiJournalAnalysis, getForYouSuggestion as getGeminiForYouSuggestion, getThoughtChallengeHelp as getGeminiThoughtChallengeHelp, getMotivationalQuotes as getGeminiMotivationalQuotes } from './providers/gemini';
import { getPersonalizedExercises as getOllamaExercises, getJournalAnalysis as getOllamaJournalAnalysis, getForYouSuggestion as getOllamaForYouSuggestion, getThoughtChallengeHelp as getOllamaThoughtChallengeHelp, getMotivationalQuotes as getOllamaMotivationalQuotes } from './providers/ollama';
import { getPersonalizedExercises as getGroqExercises, getForYouSuggestion as getGroqForYouSuggestion } from './providers/groq';
import { UserProfile, DataConsentLevel, ExerciseFeedback, Exercise } from '../types';

export const getPersonalizedExercises = (
    provider: 'gemini' | 'groq' | 'ollama',
    model: string,
    apiKey: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: {url: string, title: string}[]; calmImageUrl: string | null }> => {
    switch (provider) {
        case 'ollama':
            return getOllamaExercises(model, apiKey, symptoms, profile, consentLevel, feedback, language);
        case 'groq':
            return getGroqExercises(model, apiKey, symptoms, profile, consentLevel, feedback, language);
        default:
            return getGeminiExercises(symptoms, profile, consentLevel, feedback, language);
    }
};

export const getJournalAnalysis = (
    provider: 'gemini' | 'groq' | 'ollama',
    model: string,
    apiKey: string,
    entryText: string,
    language: string
): Promise<string> => {
    if (provider === 'groq') {
        // For now, fall back to Gemini for journal analysis since we haven't implemented it in Groq yet
        return getGeminiJournalAnalysis(entryText, language);
    }
    if (provider === 'ollama') {
        return getOllamaJournalAnalysis(model, apiKey, entryText, language);
    }
    return getGeminiJournalAnalysis(entryText, language);
};

export const getForYouSuggestion = (
    provider: 'gemini' | 'groq' | 'ollama',
    model: string,
    apiKey: string,
    profile: UserProfile,
    language: string
): Promise<string> => {
    if (provider === 'groq') {
        return getGroqForYouSuggestion(model, apiKey, profile, language);
    }
    if (provider === 'ollama') {
        return getOllamaForYouSuggestion(model, apiKey, profile, language);
    }
    // Gemini doesn't need model or apiKey
    return getGeminiForYouSuggestion(profile, language);
};

export const getThoughtChallengeHelp = (
    provider: 'gemini' | 'groq' | 'ollama',
    model: string,
    apiKey: string,
    situation: string,
    negativeThought: string,
    language: string
): Promise<string> => {
    if (provider === 'groq') {
        // For now, fall back to Gemini for thought challenge help since we haven't implemented it in Groq yet
        return getGeminiThoughtChallengeHelp(situation, negativeThought, language);
    }
    if (provider === 'ollama') {
        return getOllamaThoughtChallengeHelp(model, apiKey, situation, negativeThought, language);
    }
    return getGeminiThoughtChallengeHelp(situation, negativeThought, language);
};

export const getMotivationalQuotes = (
    provider: 'gemini' | 'ollama',
    model: string,
    apiKey: string,
    language: string
): Promise<string[]> => {
    if (provider === 'ollama') {
        return getOllamaMotivationalQuotes(model, apiKey, language);
    }
    // Gemini doesn't need model or apiKey
    return getGeminiMotivationalQuotes(language);
};
