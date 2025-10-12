import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * ForYouCard is a React functional component that displays a personalized suggestion
 * for the user based on their profile and preferences. It fetches the suggestion
 * from an API and handles loading, error, and success states.
 *
 * The component respects user consent levels and does not render if the consent
 * level is set to "essential". It also supports internationalization via the `useTranslation` hook.
 *
 * @component
 *
 * @returns {JSX.Element | null} The rendered ForYouCard component or null if consent is not given.
 *
 * @remarks
 * - The component fetches suggestions from the `/api/suggestions` endpoint.
 * - It uses the `useUser` hook to access user-related data such as profile, consent level,
 *   and API credentials.
 * - The `useTranslation` hook is used for internationalization support.
 * - The component displays a loading state, an error message, or the fetched suggestion
 *   based on the current state.
 *
 * @example
 * ```tsx
 * <ForYouCard />
 * ```
 */
const ForYouCard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { profile, consentLevel, llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey } = useUser();
    const { isOnline } = useOnlineStatus();
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (consentLevel === 'essential') {
            setIsLoading(false);
            setSuggestion('');
            return;
        }

        // Check if offline
        if (!isOnline) {
            setIsLoading(false);
            setError('You are currently offline. Please check your internet connection to receive personalized suggestions.');
            return;
        }

        // Check if API key is missing before making the request
        if (llmProvider === 'groq' && !groqApiKey) {
            setIsLoading(false);
            setError('Groq API key is required for personalized suggestions. Please configure your API key in settings.');
            return;
        }

        const fetchSuggestion = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log('Fetching For You suggestion with:', {
                    provider: llmProvider,
                    model: llmProvider === 'groq' ? groqModel : ollamaModel,
                    apiKey: llmProvider === 'groq' ? (groqApiKey ? 'present' : 'missing') : (ollamaCloudApiKey ? 'present' : 'missing'),
                    language: i18n.language
                });

                // Use different API endpoints based on provider
                const apiEndpoint = llmProvider === 'groq' ? '/api/groq/generate' : '/api/suggestions';

                // If Groq model is empty, don't make the request
                if (llmProvider === 'groq' && (!groqModel || groqModel.trim() === '')) {
                    throw new Error('No Groq model selected. Please select a model in settings.');
                }

                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'for-you-suggestion',
                        provider: llmProvider,
                        model: llmProvider === 'groq' ? groqModel : ollamaModel,
                        apiKey: llmProvider === 'groq' ? groqApiKey : ollamaCloudApiKey,
                        profile,
                        language: i18n.language,
                    }),
                });

                console.log('API response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('API error response:', errorData);
                    throw new Error(errorData.error || 'Failed to fetch suggestion');
                }

                const data = await response.json();
                console.log('API success response:', data);
                setSuggestion(data.suggestion || 'No suggestion available');
            } catch (err) {
                console.error('For You card error:', err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
                setSuggestion('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestion();
    }, [profile, consentLevel, i18n.language, llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey]);

    if (consentLevel === 'essential') {
        return null; // Don't render the card if consent is not given
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-primary-200 dark:bg-primary-800/50 rounded-md w-3/4"></div>
                    <div className="h-4 bg-primary-200 dark:bg-primary-800/50 rounded-md w-1/2"></div>
                </div>
            );
        }

        if (error) {
            // Check if error is related to missing API key
            if (error.includes('API key') || error.includes('Failed to generate content with Groq')) {
                return (
                    <div className="space-y-3">
                        <p className="text-sm text-red-800 dark:text-red-300">
                            {t('for_you.api_key_missing', 'Groq API key is required for personalized suggestions.')}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.open('https://console.groq.com/keys', '_blank')}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                            >
                                {t('for_you.get_api_key', 'Get your free API key')}
                            </button>
                            <span className="text-sm text-neutral-400">•</span>
                            <button
                                onClick={() => {
                                    // Try to open user profile/settings modal
                                    const event = new CustomEvent('openUserProfile');
                                    window.dispatchEvent(event);
                                }}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                            >
                                {t('for_you.configure_settings', 'Configure in Settings')}
                            </button>
                        </div>
                    </div>
                );
            }
            return <p className="text-sm text-red-800 dark:text-red-300">{error}</p>;
        }

        if (!suggestion || suggestion.trim() === '') {
            // Show setup message if API key is missing
            if (llmProvider === 'groq' && !groqApiKey) {
                return (
                    <div className="space-y-2">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {t('for_you.setup_required', 'Configure your Groq API key to receive personalized suggestions.')}
                        </p>
                        <button
                            onClick={() => {
                                const event = new CustomEvent('openUserProfile');
                                window.dispatchEvent(event);
                            }}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                        >
                            {t('for_you.open_settings', 'Open Settings')}
                        </button>
                    </div>
                );
            }
            return <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No suggestion available</p>;
        }

        return <p className="text-lg text-primary-800 dark:text-primary-200 leading-relaxed">"{suggestion}"</p>;
    };

    return (
        <div className="w-full p-8 bg-gradient-to-br from-white via-primary-50/30 to-accent-50/30 dark:from-neutral-800/50 dark:via-primary-900/20 dark:to-accent-900/20 rounded-3xl shadow-lg border border-primary-200/50 dark:border-primary-800/30 hover-lift animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                    {t('for_you.title')}
                </h2>
            </div>
            <div className="min-h-[60px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default ForYouCard;
