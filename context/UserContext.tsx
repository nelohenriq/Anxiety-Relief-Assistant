import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProfile, DataConsentLevel, ReminderSettings } from '../types';
import { logInteraction } from '../services/interactionLogger';

type LlmProvider = 'gemini' | 'groq' | 'ollama';

interface UserContextType {
    profile: UserProfile;
    setProfile: (profile: UserProfile) => void;
    consentLevel: DataConsentLevel;
    setConsentLevel: (level: DataConsentLevel) => void;
    reminderSettings: ReminderSettings;
    setReminderSettings: (settings: ReminderSettings) => void;
    llmProvider: LlmProvider;
    setLlmProvider: (provider: LlmProvider) => void;
    groqModel: string;
    setGroqModel: (model: string) => void;
    groqApiKey: string;
    setGroqApiKey: (key: string) => void;
    ollamaModel: string;
    setOllamaModel: (model: string) => void;
    ollamaCloudApiKey: string;
    setOllamaCloudApiKey: (key: string) => void;
    clearAllData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useLocalStorage<UserProfile>('userProfile', {});
    const [consentLevel, setConsentLevel] = useLocalStorage<DataConsentLevel>('consentLevel', 'essential');
    const [reminderSettings, setReminderSettings] = useLocalStorage<ReminderSettings>('reminderSettings', {
        isEnabled: false,
        time: '09:00',
        type: 'gentle',
    });
    const [llmProvider, setLlmProvider] = useLocalStorage<LlmProvider>('llmProvider', 'groq');
    const [groqModel, setGroqModel] = useLocalStorage<string>('groqModel', '');
    const [groqApiKey, setGroqApiKey] = useLocalStorage<string>('groqApiKey', '');
    const [ollamaModel, setOllamaModel] = useLocalStorage<string>('ollamaModel', 'llama3');
    const [ollamaCloudApiKey, setOllamaCloudApiKey] = useLocalStorage<string>('ollamaCloudApiKey', '');
    
    const clearAllData = () => {
        logInteraction({ type: 'CLEAR_ALL_DATA' });

        // This is a list of all keys managed by useLocalStorage in the app.
        const keysToRemove = [
            'userProfile',
            'consentLevel',
            'exerciseFeedback',
            'planHistory',
            'journalEntries',
            'theme',
            'reminderSettings',
            'thoughtRecords',
            'activeProgramId',
            'programProgress',
            'exerciseHistory',
            'moodLogs',
            'feedbackHistory',
            'interactionLog',
            'llmProvider',
            'groqModel',
            'groqApiKey',
            'ollamaModel',
            'ollamaCloudApiKey',
            'hasCompletedOnboarding'
        ];
        
        keysToRemove.forEach(key => {
            window.localStorage.removeItem(key);
        });

        // Force reset to Groq provider after clearing data
        window.localStorage.setItem('llmProvider', JSON.stringify('groq'));

        // Reload the page to reset the app state completely
        window.location.reload();
    };

    const value = {
        profile,
        setProfile,
        consentLevel,
        setConsentLevel,
        reminderSettings,
        setReminderSettings,
        llmProvider,
        setLlmProvider,
        groqModel,
        setGroqModel,
        groqApiKey,
        setGroqApiKey,
        ollamaModel,
        setOllamaModel,
        ollamaCloudApiKey,
        setOllamaCloudApiKey,
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
