import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JournalEntry } from '../types';
import { getJournalAnalysis } from '../services/geminiService';
import { logInteraction } from '../services/interactionLogger';
import Tooltip from './Tooltip';

interface JournalEntryCardProps {
    entry: JournalEntry;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
    const { t, i18n } = useTranslation();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);
        logInteraction({ type: 'REQUEST_JOURNAL_ANALYSIS' });
        try {
            const result = await getJournalAnalysis(entry.text, i18n.language);
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
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{entry.text}</p>
            
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