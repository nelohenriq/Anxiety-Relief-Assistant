import * as gemini from './providers/gemini';
import * as ollama from './providers/ollama';
import { UserProfile, DataConsentLevel, ExerciseFeedback, Exercise } from '../types';

type Provider = 'gemini' | 'ollama';

export const getPersonalizedExercises = (
    provider: Provider,
    ollamaModel: string,
    ollamaCloudApiKey: string,
    symptoms: string,
    profile: UserProfile,
    consentLevel: DataConsentLevel,
    feedback: ExerciseFeedback,
    language: string
): Promise<{ exercises: Exercise[]; sources: { url: string; title: string }[], calmImageUrl: string | null }> => {
    if (provider === 'ollama') {
        return ollama.getPersonalizedExercises(ollamaModel, ollamaCloudApiKey, symptoms, profile, consentLevel, feedback, language);
    }
    return gemini.getPersonalizedExercises(symptoms, profile, consentLevel, feedback, language);
};

export const getJournalAnalysis = (
    provider: Provider,
    ollamaModel: string,
    ollamaCloudApiKey: string,
    entryText: string,
    language: string
): Promise<string> => {
     if (provider === 'ollama') {
        return ollama.getJournalAnalysis(ollamaModel, ollamaCloudApiKey, entryText, language);
    }
    return gemini.getJournalAnalysis(entryText, language);
};

export const getForYouSuggestion = (
    provider: Provider,
    ollamaModel: string,
    ollamaCloudApiKey: string,
    profile: UserProfile,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return ollama.getForYouSuggestion(ollamaModel, ollamaCloudApiKey, profile, language);
    }
    return gemini.getForYouSuggestion(profile, language);
};

export const getThoughtChallengeHelp = (
    provider: Provider,
    ollamaModel: string,
    ollamaCloudApiKey: string,
    situation: string,
    negativeThought: string,
    language: string
): Promise<string> => {
    if (provider === 'ollama') {
        return ollama.getThoughtChallengeHelp(ollamaModel, ollamaCloudApiKey, situation, negativeThought, language);
    }
    return gemini.getThoughtChallengeHelp(situation, negativeThought, language);
};

export const getMotivationalQuotes = (
    provider: Provider,
    ollamaModel: string,
    ollamaCloudApiKey: string,
    language: string
): Promise<string[]> => {
    if (provider === 'ollama') {
        return ollama.getMotivationalQuotes(ollamaModel, ollamaCloudApiKey, language);
    }
    return gemini.getMotivationalQuotes(language);
};
