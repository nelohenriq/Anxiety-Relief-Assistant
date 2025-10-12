import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { UserProfile as UserProfileType, DataConsentLevel, ReminderSettings, CompletedExerciseLog, FeedbackEntry } from '../types';
import Tooltip from './Tooltip';
import ExerciseHistory from './ExerciseHistory';
import FeedbackModal from './FeedbackModal';
import FeedbackHistory from './FeedbackHistory';
import { logInteraction } from '../services/interactionLogger';



interface UserProfileProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseHistory: CompletedExerciseLog[];
    feedbackHistory: FeedbackEntry[];
    onSaveFeedback: (feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>) => void;
}

type ActiveTab = 'settings' | 'history' | 'feedback';

/**
 * UserProfile component provides a user interface for managing user settings, preferences, and data.
 * It includes functionality for updating user profiles, managing reminders, selecting AI providers,
 * and handling data privacy settings. The component also supports multi-language options and feedback submission.
 *
 * @component
 * @param {UserProfileProps} props - The props for the UserProfile component.
 * @param {boolean} props.isOpen - Determines if the UserProfile modal is open.
 * @param {() => void} props.onClose - Callback function to close the UserProfile modal.
 * @param {ExerciseHistory[]} props.exerciseHistory - Array of exercise history data.
 * @param {FeedbackHistory[]} props.feedbackHistory - Array of feedback history data.
 * @param {(feedback: Feedback) => void} props.onSaveFeedback - Callback function to save user feedback.
 *
 * @returns {JSX.Element | null} The rendered UserProfile component or null if `isOpen` is false.
 *
 * @remarks
 * - The component uses `useTranslation` for multi-language support.
 * - It manages local state for user profile, reminders, AI provider, and other settings.
 * - The component fetches available models for the selected AI provider (e.g., Ollama) and handles connection status.
 * - It includes tabs for settings, activity log, and feedback history.
 * - The component supports data privacy options, including clearing all user data.
 *
 * @example
 * ```tsx
 * <UserProfile
 *   isOpen={true}
 *   onClose={() => console.log('Modal closed')}
 *   exerciseHistory={exerciseHistoryData}
 *   feedbackHistory={feedbackHistoryData}
 *   onSaveFeedback={(feedback) => console.log('Feedback saved:', feedback)}
 * />
 * ```
 */
const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, exerciseHistory, feedbackHistory, onSaveFeedback }) => {
    const { t, i18n } = useTranslation();
    const { profile, setProfile, consentLevel, setConsentLevel, reminderSettings, setReminderSettings, llmProvider, setLlmProvider, groqModel, setGroqModel, groqApiKey, setGroqApiKey, ollamaModel, setOllamaModel, ollamaCloudApiKey, setOllamaCloudApiKey, clearAllData } = useUser();
    const [localProfile, setLocalProfile] = useState<UserProfileType>(profile);
    const [localReminders, setLocalReminders] = useState<ReminderSettings>(reminderSettings);
    const [localLlmProvider, setLocalLlmProvider] = useState(llmProvider);
    const [localGroqModel, setLocalGroqModel] = useState(groqModel);
    const [localGroqApiKey, setLocalGroqApiKey] = useState(groqApiKey);
    const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);
    const [localOllamaCloudApiKey, setLocalOllamaCloudApiKey] = useState(ollamaCloudApiKey);
    const [showConfirm, setShowConfirm] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    
    const [groqConnectionStatus, setGroqConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [groqConnectionError, setGroqConnectionError] = useState<string | null>(null);
    const [availableGroqModels, setAvailableGroqModels] = useState<string[]>([]);
    const [ollamaConnectionStatus, setOllamaConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [ollamaConnectionError, setOllamaConnectionError] = useState<string | null>(null);
    const [availableLocalOllamaModels, setAvailableLocalOllamaModels] = useState<string[]>([]);
    const [availableCloudOllamaModels, setAvailableCloudOllamaModels] = useState<string[]>([]);

    const fetchGroqModelsAndStatus = async () => {
        setGroqConnectionStatus('testing');
        setGroqConnectionError(null);

        try {
            console.log('Fetching Groq models with API key present:', !!localGroqApiKey);
            const params = new URLSearchParams({
                action: 'models',
                ...(localGroqApiKey && { apiKey: localGroqApiKey })
            });
            console.log('API URL params:', params.toString());
            const response = await fetch(`/api/groq/models?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            const { models, error } = data;

            if (error) {
                setGroqConnectionStatus('error');
                setGroqConnectionError(error);
                setAvailableGroqModels([]);
            } else {
                setGroqConnectionStatus('success');
                setGroqConnectionError(null);
            }

            setAvailableGroqModels(models.models || []);

            if (!availableGroqModels.includes(localGroqModel) && models.models && models.models.length > 0) {
                setLocalGroqModel(models.models[0]);
            }
        } catch (error) {
            setGroqConnectionStatus('error');
            setGroqConnectionError('Failed to fetch Groq models');
            setAvailableGroqModels([]);
        }
    };

    const fetchOllamaModelsAndStatus = async () => {
        setOllamaConnectionStatus('testing');
        setOllamaConnectionError(null);

        try {
            // Use the API route instead of direct function call to avoid CORS issues
            const response = await fetch('/api/ollama/models');
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const { models, error } = data;

            // For cloud-only usage, we don't need local connection
            // Only show error if user is trying to use local models
            if (error && !localOllamaCloudApiKey?.trim()) {
                setOllamaConnectionStatus('error');
                setOllamaConnectionError('Local Ollama not available - use cloud models with API key');
            } else {
                setOllamaConnectionStatus('success');
                setOllamaConnectionError(null);
            }

            // Always set local models from the response (even if connection failed, might be empty array)
            setAvailableLocalOllamaModels(models.local || []);

            // Set cloud models if API key is provided (these are static, not dependent on connection)
            if (localOllamaCloudApiKey && localOllamaCloudApiKey.trim()) {
                setAvailableCloudOllamaModels(models.cloud || []);
            } else {
                setAvailableCloudOllamaModels([]);
            }

            // Set default model based on what's available
            const availableModels: string[] = [];
            if (models.local && models.local.length > 0) {
                availableModels.push(...models.local.map((m: string) => `local:${m}`));
            }
            if (models.cloud && models.cloud.length > 0 && localOllamaCloudApiKey && localOllamaCloudApiKey.trim()) {
                availableModels.push(...models.cloud.map((m: string) => `cloud:${m}`));
            }

            if (!availableModels.includes(localOllamaModel) && availableModels.length > 0) {
                setLocalOllamaModel(availableModels[0]);
            }
        } catch (error) {
            setOllamaConnectionStatus('error');
            setOllamaConnectionError('Failed to fetch models');
            setAvailableLocalOllamaModels([]);
            // Don't clear cloud models on error - they might still be available if API key is valid
        }
    };

    useEffect(() => {
        setLocalProfile(profile);
        setLocalReminders(reminderSettings);
        setLocalLlmProvider(llmProvider);
        setLocalGroqModel(groqModel);
        setLocalGroqApiKey(groqApiKey);
        setLocalOllamaModel(ollamaModel);
        setLocalOllamaCloudApiKey(ollamaCloudApiKey);
        if (isOpen) {
            setActiveTab('settings');
        }
    }, [profile, reminderSettings, llmProvider, ollamaModel, ollamaCloudApiKey, isOpen]);

    useEffect(() => {
        if (isOpen && localLlmProvider === 'groq') {
            // Only fetch if we have an API key
            if (localGroqApiKey && localGroqApiKey.trim()) {
                fetchGroqModelsAndStatus();
            } else {
                // Set to idle state when no API key - UI will show message
                setGroqConnectionStatus('idle');
                setGroqConnectionError(null);
                setAvailableGroqModels([]);
            }
        } else {
            setGroqConnectionStatus('idle');
            setGroqConnectionError(null);
        }

        if (isOpen && localLlmProvider === 'ollama') {
            fetchOllamaModelsAndStatus();
        } else {
            setOllamaConnectionStatus('idle');
            setOllamaConnectionError(null);
        }
    }, [isOpen, localLlmProvider]);

    // Re-fetch models when API key changes
    useEffect(() => {
        if (isOpen && localLlmProvider === 'groq' && groqConnectionStatus === 'success') {
            fetchGroqModelsAndStatus();
        }

        if (isOpen && localLlmProvider === 'ollama' && ollamaConnectionStatus === 'success') {
            fetchOllamaModelsAndStatus();
        }
    }, [localGroqApiKey, localOllamaCloudApiKey]);

    const handleSave = () => {
        logInteraction({
            type: 'SAVE_SETTINGS',
            metadata: {
                provider: localLlmProvider,
                ollamaModel: localLlmProvider === 'ollama' ? localOllamaModel : undefined,
                reminders_enabled: localReminders.isEnabled
            }
        });
        setProfile(localProfile);
        setReminderSettings(localReminders);
        setLlmProvider(localLlmProvider);
        setGroqModel(localGroqModel);
        setGroqApiKey(localGroqApiKey);
        setOllamaModel(localOllamaModel);
        setOllamaCloudApiKey(localOllamaCloudApiKey);
        onClose();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };

     const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const isEnabled = (e.target as HTMLInputElement).checked;
             setLocalReminders(prev => ({...prev, isEnabled }));
             if (isEnabled && notificationPermission === 'default') {
                 Notification.requestPermission().then(setNotificationPermission);
             }
        } else {
            setLocalReminders(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    }

    const handleClearData = () => {
        clearAllData();
    }

    const handleDownloadLog = () => {
        logInteraction({ type: 'DOWNLOAD_INTERACTION_LOG' });
        const logData = window.localStorage.getItem('interactionLog');
        if (logData) {
            const blob = new Blob([logData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'serene-interaction-log.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (!isOpen) return null;

    const renderSettingsTab = () => (
         <div className="space-y-6">
            <div>
                <label htmlFor="language-select" className="block text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">{t('user_profile.language_title')}</label>
                <select id="language-select" value={i18n.resolvedLanguage} onChange={handleLanguageChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="pt-pt">Português (Portugal)</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('user_profile.ai_provider_title')}</h3>
                <div className="mt-2 space-y-4">
                     <div>
                        <label htmlFor="llmProvider" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.provider_label')}</label>
                        <select id="llmProvider" value={localLlmProvider} onChange={(e) => setLocalLlmProvider(e.target.value as any)} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                            <option value="groq">🚀 Groq (Fastest)</option>
                            <option value="gemini">Gemini (Google)</option>
                            <option value="ollama">Ollama Cloud</option>
                        </select>
                     </div>

                     {/* Groq Settings */}
                     {localLlmProvider === 'groq' && (
                         <div className="mt-4 space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                             <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">🚀 Groq Settings (Fastest)</h4>

                             <div>
                                 <label htmlFor="groqApiKey" className="block text-sm font-medium text-blue-700 dark:text-blue-300">
                                     Groq API Key
                                 </label>
                                 <input
                                     type="password"
                                     id="groqApiKey"
                                     value={localGroqApiKey}
                                     onChange={(e) => setLocalGroqApiKey(e.target.value)}
                                     placeholder="gsk_..."
                                     className="mt-1 block w-full rounded-md border-blue-300 bg-white dark:border-blue-600 dark:bg-blue-800 dark:text-blue-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                 />
                                 <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                     Get your free API key from{' '}
                                     <a
                                         href="https://console.groq.com/keys"
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="underline hover:no-underline"
                                     >
                                         console.groq.com/keys
                                     </a>
                                 </p>
                             </div>

                             <div>
                                 <label htmlFor="groqModel" className="block text-sm font-medium text-blue-700 dark:text-blue-300">
                                     Groq Model
                                 </label>
                                 <select
                                     id="groqModel"
                                     value={localGroqModel}
                                     onChange={(e) => setLocalGroqModel(e.target.value)}
                                     className="mt-1 block w-full rounded-md border-blue-300 bg-white dark:border-blue-600 dark:bg-blue-800 dark:text-blue-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                     disabled={availableGroqModels.length === 0}
                                 >
                                     {availableGroqModels.length === 0 ? (
                                         <option value="">
                                             {localGroqApiKey && localGroqApiKey.trim()
                                                 ? 'Loading models...'
                                                 : 'Add API key to load models'}
                                         </option>
                                     ) : (
                                         availableGroqModels.map(model => (
                                             <option key={model} value={model}>
                                                 {model}
                                                 {model.includes('8b-8192') ? ' (Fastest)' :
                                                  model.includes('70b-8192') ? ' (Balanced)' :
                                                  model.includes('405b') ? ' (Most Capable)' :
                                                  model.includes('instant') ? ' (Ultra Fast)' :
                                                  model.includes('versatile') ? ' (Versatile)' :
                                                  model.includes('mixtral') ? ' (High Quality)' :
                                                  ' (Efficient)'}
                                             </option>
                                         ))
                                     )}
                                 </select>
                                 <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                     Recommended: llama3.1-8b-instant for fastest "For You" card generation
                                 </p>
                             </div>

                             {/* Connection Status for Groq */}
                             <div className="pt-2">
                                 {groqConnectionStatus === 'testing' && (
                                     <p className="text-blue-600 dark:text-blue-400 text-sm">🔄 Testing connection...</p>
                                 )}
                                 {groqConnectionStatus === 'success' && (
                                     <p className="text-green-600 dark:text-green-400 text-sm">
                                         ✅ Connected • {availableGroqModels.length} model{availableGroqModels.length !== 1 ? 's' : ''} available
                                     </p>
                                 )}
                                 {groqConnectionStatus === 'error' && (
                                     <p className="text-red-600 dark:text-red-400 text-sm">
                                         ❌ {groqConnectionError}
                                     </p>
                                 )}
                             </div>

                             <button
                                 type="button"
                                 onClick={fetchGroqModelsAndStatus}
                                 disabled={groqConnectionStatus === 'testing'}
                                 className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded-md transition-colors"
                             >
                                 {groqConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                             </button>
                         </div>
                     )}

                     {localLlmProvider === 'ollama' && (
                         <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg space-y-4">
                             <div className="flex items-center gap-2">
                                 <span className="text-lg">☁️</span>
                                 <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Ollama Cloud Models</h4>
                             </div>
                             <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                 Use cloud models without local installation. Just add your API key from ollama.com
                             </p>
                            <div>
                                <label htmlFor="ollamaCloudApiKey" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.ollama_cloud_api_key_label')}</label>
                                <input 
                                    type="password"
                                    id="ollamaCloudApiKey"
                                    value={localOllamaCloudApiKey}
                                    onChange={(e) => setLocalOllamaCloudApiKey(e.target.value)}
                                    placeholder={t('user_profile.ollama_cloud_api_key_placeholder')}
                                    className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t('user_profile.ollama_cloud_api_key_helper')}</p>
                            </div>
                            <div>
                                <label htmlFor="ollamaModel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.ollama_model_label')}</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <select 
                                        id="ollamaModel" 
                                        value={localOllamaModel} 
                                        onChange={(e) => setLocalOllamaModel(e.target.value)} 
                                        className="block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
                                        disabled={ollamaConnectionStatus === 'testing'}
                                    >
                                        
                                        {ollamaConnectionStatus === 'testing' && <option value="">{t('user_profile.ollama_status_testing')}</option>}

                                        {/* Local Models Section - Only show if connection successful */}
                                        {ollamaConnectionStatus === 'success' && availableLocalOllamaModels.length > 0 && (
                                            <optgroup label="🖥️ Local Models">
                                                {availableLocalOllamaModels.map(model => (
                                                    <option key={`local:${model}`} value={`local:${model}`}>
                                                        {model} (Local)
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}

                                        {/* Cloud Models Section - Only show if API key is provided */}
                                        {localOllamaCloudApiKey && localOllamaCloudApiKey.trim() && availableCloudOllamaModels.length > 0 && (
                                            <optgroup label="☁️ Cloud Models">
                                                {availableCloudOllamaModels.map(model => (
                                                    <option key={`cloud:${model}`} value={`cloud:${model}`}>
                                                        {model} (Cloud)
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}

                                        {/* Show helpful messages when no models are available */}
                                        {ollamaConnectionStatus === 'error' && availableCloudOllamaModels.length === 0 && (
                                            <option value="" disabled>
                                                💡 Add API key above to access cloud models (no local server needed)
                                            </option>
                                        )}

                                        {ollamaConnectionStatus === 'error' && availableCloudOllamaModels.length > 0 && (
                                            <option value="" disabled>
                                                ✅ {availableCloudOllamaModels.length} cloud model{availableCloudOllamaModels.length !== 1 ? 's' : ''} available with your API key
                                            </option>
                                        )}

                                        {ollamaConnectionStatus === 'success' && availableLocalOllamaModels.length === 0 && (!localOllamaCloudApiKey || !localOllamaCloudApiKey.trim()) && (
                                            <option value="" disabled>
                                                💡 Add API key above to access cloud models
                                            </option>
                                        )}

                                        {ollamaConnectionStatus === 'success' && availableLocalOllamaModels.length === 0 && localOllamaCloudApiKey && localOllamaCloudApiKey.trim() && availableCloudOllamaModels.length === 0 && (
                                            <option value="" disabled>
                                                ⚠️ No models available - check your API key
                                            </option>
                                        )}

                                        {ollamaConnectionStatus === 'idle' && (
                                            <option value="" disabled>
                                                🔌 Add API key and click test connection to load cloud models
                                            </option>
                                        )}
                                    </select>
                                    <Tooltip text={t('user_profile.ollama_test_connection_tooltip')}>
                                        <button
                                            type="button"
                                            onClick={fetchOllamaModelsAndStatus}
                                            disabled={ollamaConnectionStatus === 'testing'}
                                            className="p-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
                                            aria-label={t('user_profile.ollama_test_connection_tooltip')}
                                        >
                                            {ollamaConnectionStatus === 'testing' ? (
                                                <svg className="animate-spin h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.651-3.182-3.182a8.25 8.25 0 00-11.667 0L2.985 16.644z" />
                                                </svg>
                                            )}
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className="mt-2 text-xs h-4">
                                    {ollamaConnectionStatus === 'success' && (
                                        <p className="text-green-600 dark:text-green-400">
                                            ✅ Ready • {availableLocalOllamaModels.length} local model{availableLocalOllamaModels.length !== 1 ? 's' : ''}
                                            {localOllamaCloudApiKey && localOllamaCloudApiKey.trim() && availableCloudOllamaModels.length > 0 && ` • ${availableCloudOllamaModels.length} cloud model${availableCloudOllamaModels.length !== 1 ? 's' : ''}`}
                                        </p>
                                    )}
                                    {ollamaConnectionStatus === 'error' && (
                                        <p className={`${
                                            availableCloudOllamaModels.length > 0 && localOllamaCloudApiKey && localOllamaCloudApiKey.trim()
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                            {availableCloudOllamaModels.length > 0 && localOllamaCloudApiKey && localOllamaCloudApiKey.trim()
                                                ? `✅ ${availableCloudOllamaModels.length} cloud model${availableCloudOllamaModels.length !== 1 ? 's' : ''} available`
                                                : `💡 Add API key to access cloud models`
                                            }
                                        </p>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t('user_profile.ollama_model_helper')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('user_profile.consent_title')}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{t('user_profile.consent_subtitle')}</p>
                <fieldset className="space-y-2">
                    <legend className="sr-only">Data Consent Level</legend>
                    <div>
                        <input type="radio" id="essential" name="consent" value="essential" checked={consentLevel === 'essential'} onChange={() => setConsentLevel('essential')} className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500" />
                        <label htmlFor="essential" className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.consent_essential')}</label>
                    </div>
                     <div>
                        <input type="radio" id="enhanced" name="consent" value="enhanced" checked={consentLevel === 'enhanced'} onChange={() => setConsentLevel('enhanced')} className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500" />
                        <label htmlFor="enhanced" className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.consent_enhanced')}</label>
                    </div>
                    <div>
                        <input type="radio" id="complete" name="consent" value="complete" checked={consentLevel === 'complete'} onChange={() => setConsentLevel('complete')} className="h-4 w-4 text-primary-600 border-neutral-300 focus:ring-primary-500" />
                        <label htmlFor="complete" className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.consent_complete')}</label>
                    </div>
                </fieldset>
            </div>
            <div className="space-y-4">{renderFormFields()}</div>
            
            <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4">{t('user_profile.reminders_title')}</h3>
                <div className="flex items-center justify-between">
                    <span id="reminders-label" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.reminders_enable_label')}</span>
                    <label htmlFor="isEnabled" className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="isEnabled" 
                            name="isEnabled" 
                            checked={localReminders.isEnabled} 
                            onChange={handleReminderChange} 
                            className="sr-only peer" 
                            aria-labelledby="reminders-label"
                        />
                        <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
                    </label>
                </div>
                 {notificationPermission === 'denied' && localReminders.isEnabled && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t('user_profile.reminders_permission_denied')}</p>
                )}
                {localReminders.isEnabled && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.reminders_time_label')}</label>
                            <input type="time" id="time" name="time" value={localReminders.time} onChange={handleReminderChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.reminders_type_label')}</label>
                            <select id="type" name="type" value={localReminders.type} onChange={handleReminderChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                <option value="gentle">{t('user_profile.reminders_type_options.gentle')}</option>
                                <option value="motivational">{t('user_profile.reminders_type_options.motivational')}</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('user_profile.feedback_title')}</h3>
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{t('user_profile.feedback_subtitle')}</p>
                 <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-primary-300 dark:border-primary-700 text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 bg-white dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-900/50"
                >
                    {t('user_profile.provide_feedback_button')}
                </button>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('user_profile.data_privacy_title')}</h3>
                 <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{t('user_profile.data_privacy_subtitle')}</p>
                {showConfirm ? (
                    <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-800 dark:text-red-200">{t('user_profile.clear_data_confirm_title')}</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{t('user_profile.clear_data_confirm_body')}</p>
                        <div className="mt-3 flex gap-2">
                            <button onClick={handleClearData} className="px-3 py-1 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">{t('user_profile.clear_data_confirm_button')}</button>
                            <button onClick={() => setShowConfirm(false)} className="px-3 py-1 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-500">{t('user_profile.cancel_button')}</button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                        {t('user_profile.clear_data_button')}
                    </button>
                )}
                 <div className="mt-4">
                     <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{t('user_profile.download_log_subtitle')}</p>
                     <button
                        type="button"
                        onClick={handleDownloadLog}
                        className="inline-flex items-center px-4 py-2 border border-primary-300 dark:border-primary-700 text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 bg-white dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-900/50"
                    >
                        {t('user_profile.download_log_button')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderFormFields = () => {
        if (consentLevel === 'essential') {
            return <p className="text-center text-neutral-500 dark:text-neutral-400">{t('user_profile.form_disabled_message')}</p>;
        }
        return (
            <>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4">{t('user_profile.about_you_title')}</h3>
                 <div>
                    <label htmlFor="age" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.age_label')}</label>
                    <input type="number" name="age" id="age" value={localProfile.age || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.location_label')}</label>
                    <input type="text" name="location" id="location" value={localProfile.location || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder={t('user_profile.location_placeholder')} />
                </div>
                
                 <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4 mt-6">{t('user_profile.wellness_profile_title')}</h3>
                <div>
                    <label htmlFor="sleepHours" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.sleep_label')}</label>
                    <input type="number" name="sleepHours" id="sleepHours" value={localProfile.sleepHours || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="caffeineIntake" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.caffeine_label')}</label>
                    <select name="caffeineIntake" id="caffeineIntake" value={localProfile.caffeineIntake || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="none">{t('user_profile.caffeine_options.none')}</option>
                        <option value="low">{t('user_profile.caffeine_options.low')}</option>
                        <option value="moderate">{t('user_profile.caffeine_options.moderate')}</option>
                        <option value="high">{t('user_profile.caffeine_options.high')}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.interests_title')}</label>
                    <textarea name="interests" id="interests" value={localProfile.interests || ''} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder={t('user_profile.interests_placeholder')}></textarea>
                </div>
                {consentLevel === 'complete' && (
                    <>
                     <div>
                        <label htmlFor="diagnosedDisorders" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.conditions_label')}</label>
                        <textarea name="diagnosedDisorders" id="diagnosedDisorders" value={localProfile.diagnosedDisorders || ''} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder={t('user_profile.conditions_placeholder')}></textarea>
                         <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('user_profile.conditions_help_text')}</p>
                    </div>
                    </>
                )}

                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-600 pb-2 mb-4 mt-6">{t('user_profile.lifestyle_title')}</h3>
                 <div>
                    <label htmlFor="workEnvironment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.work_env_label')}</label>
                    <select name="workEnvironment" id="workEnvironment" value={localProfile.workEnvironment || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="office">{t('user_profile.work_env_options.office')}</option>
                        <option value="remote">{t('user_profile.work_env_options.remote')}</option>
                        <option value="student">{t('user_profile.work_env_options.student')}</option>
                        <option value="outdoors_manual">{t('user_profile.work_env_options.outdoors_manual')}</option>
                        <option value="other">{t('user_profile.work_env_options.other')}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="accessToNature" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.nature_access_label')}</label>
                    <select name="accessToNature" id="accessToNature" value={localProfile.accessToNature || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="yes">{t('user_profile.nature_access_options.yes')}</option>
                        <option value="limited">{t('user_profile.nature_access_options.limited')}</option>
                        <option value="no">{t('user_profile.nature_access_options.no')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.activity_level_label')}</label>
                    <select name="activityLevel" id="activityLevel" value={localProfile.activityLevel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="sedentary">{t('user_profile.activity_level_options.sedentary')}</option>
                        <option value="lightly_active">{t('user_profile.activity_level_options.lightly_active')}</option>
                        <option value="moderately_active">{t('user_profile.activity_level_options.moderately_active')}</option>
                        <option value="very_active">{t('user_profile.activity_level_options.very_active')}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="copingStyles" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.coping_styles_label')}</label>
                    <textarea name="copingStyles" id="copingStyles" value={localProfile.copingStyles || ''} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder={t('user_profile.coping_styles_placeholder')}></textarea>
                </div>
                 <div>
                    <label htmlFor="learningModality" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('user_profile.learning_style_label')}</label>
                    <select name="learningModality" id="learningModality" value={localProfile.learningModality || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        <option value="">Select...</option>
                        <option value="visual">{t('user_profile.learning_style_options.visual')}</option>
                        <option value="auditory">{t('user_profile.learning_style_options.auditory')}</option>
                        <option value="kinesthetic">{t('user_profile.learning_style_options.kinesthetic')}</option>
                    </select>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profile-title">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-600">
                        <div className="flex justify-between items-center">
                            <h2 id="profile-title" className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('user_profile.title')}</h2>
                            <Tooltip text={t('tooltip.close')}>
                                <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label={t('user_profile.close_aria_label')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </Tooltip>
                        </div>
                        <div className="mt-4 border-b border-neutral-200 dark:border-neutral-700">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`${
                                        activeTab === 'settings'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-500'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {t('user_profile.tabs.settings')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`${
                                        activeTab === 'history'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-500'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {t('user_profile.tabs.activity_log')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('feedback')}
                                    className={`${
                                        activeTab === 'feedback'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-500'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {t('user_profile.tabs.feedback_history')}
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {activeTab === 'settings' && renderSettingsTab()}
                        {activeTab === 'history' && <ExerciseHistory history={exerciseHistory} />}
                        {activeTab === 'feedback' && <FeedbackHistory history={feedbackHistory} />}
                    </div>
                    
                    <div className="p-6 border-t border-neutral-200 dark:border-neutral-600 flex justify-end bg-neutral-50 dark:bg-neutral-800/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-neutral-700 py-2 px-4 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">{t('user_profile.cancel_button')}</button>
                        <button type="button" onClick={handleSave} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">{t('user_profile.save_button')}</button>
                    </div>
                </div>
            </div>
            <FeedbackModal 
                isOpen={isFeedbackModalOpen} 
                onClose={() => setIsFeedbackModalOpen(false)}
                onSave={(feedback) => {
                    onSaveFeedback(feedback);
                    setIsFeedbackModalOpen(false);
                }}
            />
        </>
    );
};

export default UserProfile;
