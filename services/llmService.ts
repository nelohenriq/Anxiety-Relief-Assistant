import * as gemini from './providers/gemini';
import * as ollama from './providers/ollama';
import { UserProfile, DataConsentLevel, ExerciseFeedback, Exercise } from '../types';

type Provider = 'gemini' | 'ollama';

export const getPersonalizedExercises = (
    provider: Provider,
    ollamaModel: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: { url: string; title: string }[] }> => {
    if (provider === 'ollama') {
        return ollama.getPersonalizedExercises(ollamaModel, symptoms, profile, consentLevel, feedback, language);
    }
    return gemini.getPersonalizedExercises(symptoms, profile, consentLevel, feedback, language);
};

export const getJournalAnalysis = (
    provider: Provider,
    ollamaModel: string,
    entryText: string,
    language: string
): Promise<string> => {
     if (provider === 'ollama') {
        return ollama.getJournalAnalysis(ollamaModel, entryText, language);
    }
    return gemini.getJournalAnalysis(entryText, language);
};

export const getForYouSuggestion = (
    provider: Provider,
    ollamaModel: string,
    profile: UserProfile,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return ollama.getForYouSuggestion(ollamaModel, profile, language);
    }
    return gemini.getForYouSuggestion(profile, language);
};

export const getThoughtChallengeHelp = (
    provider: Provider,
    ollamaModel: string,
    situation: string,
    negativeThought: string,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return ollama.getThoughtChallengeHelp(ollamaModel, situation, negativeThought, language);
    }
    return gemini.getThoughtChallengeHelp(situation, negativeThought, language);
};

export const getMotivationalQuotes = (
    provider: Provider,
    ollamaModel: string,
    language: string
): Promise<string[]> => {
    if (provider === 'ollama') {
        return ollama.getMotivationalQuotes(ollamaModel, language);
    }
    return gemini.getMotivationalQuotes(language);
};