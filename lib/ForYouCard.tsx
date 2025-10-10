import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { getForYouSuggestion } from '../services/llmService';

const ForYouCard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { profile, consentLevel, llmProvider, ollamaModel, ollamaCloudApiKey } = useUser();
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (consentLevel === 'essential') {
            setIsLoading(false);
            return;
        }

        const fetchSuggestion = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getForYouSuggestion(llmProvider, ollamaModel, ollamaCloudApiKey, profile, i18n.language);
                setSuggestion(result);
            } catch (err) {
                 if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestion();
    }, [profile, consentLevel, i18n.language, llmProvider, ollamaModel, ollamaCloudApiKey]);

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
            return <p className="text-sm text-red-800 dark:text-red-300">{error}</p>;
        }

        return <p className="text-lg text-primary-800 dark:text-primary-200 leading-relaxed">"{suggestion}"</p>;
    };

    return (
        <div className="w-full p-6 bg-gradient-to-tr from-primary-50 to-accent-100 dark:from-primary-900/50 dark:to-accent-950/50 rounded-2xl shadow-sm border border-primary-200 dark:border-primary-800/50">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('for_you.title')}
            </h2>
            <div className="min-h-[48px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default ForYouCard;
