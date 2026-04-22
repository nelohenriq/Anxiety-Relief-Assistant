import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProfile, DataConsentLevel, ReminderSettings } from '../types';
import { logInteraction } from '../services/interactionLogger';

type LlmProvider = 'gemini' | 'ollama' | 'nvidia' | 'openai';

interface UserContextType {
    userId: string;
    profile: UserProfile;
    setProfile: (profile: UserProfile) => void;
    consentLevel: DataConsentLevel;
    setConsentLevel: (level: DataConsentLevel) => void;
    reminderSettings: ReminderSettings;
    setReminderSettings: (settings: ReminderSettings) => void;
    llmProvider: LlmProvider;
    setLlmProvider: (provider: LlmProvider) => void;
    ollamaModel: string;
    setOllamaModel: (model: string) => void;
    ollamaCloudApiKey: string;
    setOllamaCloudApiKey: (key: string) => void;
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
    customLlmModel: string;
    setCustomLlmModel: (model: string) => void;
    customLlmApiKey: string;
    setCustomLlmApiKey: (key: string) => void;
    customLlmBaseUrl: string;
    setCustomLlmBaseUrl: (url: string) => void;
    clearAllData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userId] = useLocalStorage<string>('userId', crypto.randomUUID());
    const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {});
    const [consentLevel, setConsentLevel] = useLocalStorage<DataConsentLevel>('consentLevel', 'essential');
    const [reminderSettings, setReminderSettings] = useLocalStorage<ReminderSettings>('reminderSettings', {
        isEnabled: false,
        time: '09:00',
        type: 'gentle',
    });
    const [llmProvider, setLlmProvider] = useLocalStorage<LlmProvider>('llmProvider', 'gemini');
    const [ollamaModel, setOllamaModel] = useLocalStorage<string>('ollamaModel', 'llama3');
    const [ollamaCloudApiKey, setOllamaCloudApiKey] = useLocalStorage<string>('ollamaCloudApiKey', '');
    const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('geminiApiKey', '');
    const [customLlmModel, setCustomLlmModel] = useLocalStorage<string>('customLlmModel', '');
    const [customLlmApiKey, setCustomLlmApiKey] = useLocalStorage<string>('customLlmApiKey', '');
    const [customLlmBaseUrl, setCustomLlmBaseUrl] = useLocalStorage<string>('customLlmBaseUrl', '');
    
    const clearAllData = () => {
        logInteraction({ type: 'CLEAR_ALL_DATA' });

        // This is a list of all keys managed by useLocalStorage in the app.
        const keysToRemove = [
            'userId', 'userProfile', 'consentLevel', 'exerciseFeedback', 'planHistory',
            'journalEntries', 'theme', 'reminderSettings', 'thoughtRecords',
            'activeProgramId', 'programProgress', 'exerciseHistory', 'moodLogs',
            'feedbackHistory', 'interactionLog', 'llmProvider', 'ollamaModel',
            'ollamaCloudApiKey', 'hasCompletedOnboarding', 'customLlmModel',
            'customLlmApiKey', 'customLlmBaseUrl', 'hasSyncedWithBackend', 'geminiApiKey'
        ];
        
        keysToRemove.forEach(key => {
            window.localStorage.removeItem(key);
        });

        window.location.reload();
    };

    const value = { 
        userId, profile, setProfile, consentLevel, setConsentLevel, 
        reminderSettings, setReminderSettings, llmProvider, setLlmProvider, 
        ollamaModel, setOllamaModel, ollamaCloudApiKey, setOllamaCloudApiKey,
        geminiApiKey, setGeminiApiKey,
        customLlmModel, setCustomLlmModel, customLlmApiKey, setCustomLlmApiKey, 
        customLlmBaseUrl, setCustomLlmBaseUrl,
        clearAllData 
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
