import { getPersonalizedExercises as getGeminiExercises, getJournalAnalysis as getGeminiJournalAnalysis, getForYouSuggestion as getGeminiForYouSuggestion, getThoughtChallengeHelp as getGeminiThoughtChallengeHelp, getMotivationalQuotes as getGeminiMotivationalQuotes } from './providers/gemini';
import { getPersonalizedExercises as getOllamaExercises, getJournalAnalysis as getOllamaJournalAnalysis, getForYouSuggestion as getOllamaForYouSuggestion, getThoughtChallengeHelp as getOllamaThoughtChallengeHelp, getMotivationalQuotes as getOllamaMotivationalQuotes } from './providers/ollama';
import { UserProfile, DataConsentLevel, ExerciseFeedback, Exercise } from '../types';

export const getPersonalizedExercises = (
    provider: 'gemini' | 'ollama',
    model: string,
    apiKey: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: {url: string, title: string}[]; calmImageUrl: string | null }> => {
    if (provider === 'ollama') {
        return getOllamaExercises(model, apiKey, symptoms, profile, consentLevel, feedback, language);
    }
    // Default to Gemini
    return getGeminiExercises(symptoms, profile, consentLevel, feedback, language);
};

export const getJournalAnalysis = (
    provider: 'gemini' | 'ollama',
    model: string,
    apiKey: string,
    entryText: string,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return getOllamaJournalAnalysis(model, apiKey, entryText, language);
    }
    return getGeminiJournalAnalysis(entryText, language);
};

export const getForYouSuggestion = (
    provider: 'gemini' | 'ollama',
    model: string,
    apiKey: string,
    profile: UserProfile,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return getOllamaForYouSuggestion(model, apiKey, profile, language);
    }
    // Gemini doesn't need model or apiKey
    return getGeminiForYouSuggestion(profile, language);
};

export const getThoughtChallengeHelp = (
    provider: 'gemini' | 'ollama',
    model: string,
    apiKey: string,
    situation: string,
    negativeThought: string,
    language: string
): Promise<string> => {
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
