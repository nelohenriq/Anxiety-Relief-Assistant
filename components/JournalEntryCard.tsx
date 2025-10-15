/**
 * A React functional component that renders a card for a journal entry. 
 * The card displays the journal entry's timestamp, text, and provides an option 
 * to analyze the entry using an AI-powered service. The analysis result or any 
 * errors encountered during the analysis are displayed on the card.
 *
 * @component
 * @param {JournalEntryCardProps} props - The props for the component.
 * @param {JournalEntry} props.entry - The journal entry to be displayed and analyzed.
 *
 * @returns {JSX.Element} The rendered JournalEntryCard component.
 *
 * @example
 * ```tsx
 * import JournalEntryCard from './JournalEntryCard';
 * import { JournalEntry } from '../types';
 *
 * const entry: JournalEntry = {
 *   id: '1',
 *   text: 'Today was a productive day!',
 *   timestamp: new Date().toISOString(),
 * };
 *
 * <JournalEntryCard entry={entry} />;
 * ```
 *
 * @remarks
 * - The component uses the `useTranslation` hook for internationalization.
 * - The `useUser` hook is used to retrieve user-specific settings such as the LLM provider.
 * - The `getJournalAnalysis` function is called to analyze the journal entry text.
 * - The `logInteraction` function logs the user's interaction with the analysis feature.
 *
 * @dependencies
 * - `Tooltip`: A component used to display a tooltip for the analyze button.
 * - `useUser`: A custom hook for accessing user context.
 * - `getJournalAnalysis`: A service function for analyzing journal entries.
 * - `logInteraction`: A service function for logging user interactions.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JournalEntry } from '../types';
import { getJournalAnalysis } from '../services/llmService';
import { logInteraction } from '../services/interactionLogger';
import Tooltip from './Tooltip';
import { useUser } from '../context/UserContext';
import AudioPlayer from './AudioPlayer';
import AudioVisualizer from './AudioVisualizer';

interface JournalEntryCardProps {
    entry: JournalEntry;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
    const { t, i18n } = useTranslation();
    const { llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey } = useUser();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);
        logInteraction({ type: 'REQUEST_JOURNAL_ANALYSIS', metadata: { provider: llmProvider } });
        try {
            const result = await getJournalAnalysis(
                llmProvider,
                llmProvider === 'groq' ? groqModel : ollamaModel,
                llmProvider === 'groq' ? groqApiKey : ollamaCloudApiKey,
                entry.text,
                i18n.language
            );
            setAnalysis(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during analysis.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formattedDate = new Date(entry.timestamp).toLocaleString(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{formattedDate}</p>

            {/* Text Content */}
            {entry.text && (
                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap mb-3">{entry.text}</p>
            )}

            {/* Audio Content */}
            {entry.audioUrl && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700/50">
                    <div className="mb-2">
                        <AudioVisualizer
                            isRecording={false}
                            isPaused={false}
                            audioUrl={entry.audioUrl}
                            height={30}
                            barCount={15}
                        />
                    </div>
                    <AudioPlayer
                        audioUrl={entry.audioUrl}
                        audioBlob={entry.audioBlob}
                        showDownload={true}
                    />
                </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700/50">
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <svg className="animate-spin h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('journal_card.analyzing')}
                    </div>
                )}

                {error && !isAnalyzing && <p className="text-sm text-red-500">{error}</p>}

                {analysis && !isAnalyzing && (
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/40 rounded-md">
                        <h4 className="text-sm font-bold text-primary-800 dark:text-primary-200 mb-1 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                           </svg>
                            {t('journal_card.ai_reflection_title')}
                        </h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{analysis}</p>
                    </div>
                )}
                
                {!isAnalyzing && !analysis && (
                    <Tooltip text={t('journal_card.get_ai_reflection_button')}>
                         <button 
                            onClick={handleAnalyze} 
                            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isAnalyzing}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5z" />
                               <path d="M5.5 9.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H9a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V15a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1v-.5zM14.5 9.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H19a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V15a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H14a1 1 0 001-1v-.5z" />
                            </svg>
                            <span className="sr-only sm:not-sr-only">{t('journal_card.get_ai_reflection_button')}</span>
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};

export default JournalEntryCard;
