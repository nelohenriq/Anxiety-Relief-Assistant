import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip';
import { logInteraction } from '../services/interactionLogger';

// --- Component ---

interface Transcript {
    id: string;
    speaker: 'user' | 'coach';
    text: string;
}

const LiveCoach: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const { t } = useTranslation();

    const handleStartSession = () => {
        logInteraction({ type: 'START_LIVE_COACH_SESSION' });
    };
    

    const title = t('live_coach.title');
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('live_coach.subtitle')}</p>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600 dark:text-primary-400 mb-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 text-center flex-grow">
                    {t('live_coach.description')}
                </p>
                <button
                    onClick={handleStartSession}
                    className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                >
                    {t('live_coach.start_button')}
                </button>
            </div>
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                <p>🎵 {t('live_coach.coming_soon', 'Live coaching feature coming soon!')}</p>
            </div>
        </div>
    );
};

export default LiveCoach;