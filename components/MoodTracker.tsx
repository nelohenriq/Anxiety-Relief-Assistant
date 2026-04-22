import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '../hooks/useLocalStorage';
import { MoodLog } from '../types';
import MoodChart from './MoodChart';
import Tooltip from './Tooltip';
import { logInteraction } from '../services/interactionLogger';

import { useUser } from '../context/UserContext';
import * as api from '../services/apiService';

interface MoodTrackerProps {
    searchQuery: string;
}

const moodOptions: { rating: MoodLog['rating']; emoji: string; labelKey: string }[] = [
    { rating: 1, emoji: '😡', labelKey: 'mood_tracker.moods.awful' },
    { rating: 2, emoji: '😟', labelKey: 'mood_tracker.moods.bad' },
    { rating: 3, emoji: '😐', labelKey: 'mood_tracker.moods.okay' },
    { rating: 4, emoji: '🙂', labelKey: 'mood_tracker.moods.good' },
    { rating: 5, emoji: '😁', labelKey: 'mood_tracker.moods.great' },
];

const MoodTracker: React.FC<MoodTrackerProps> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const { userId } = useUser();
    const [logs, setLogs] = useLocalStorage<MoodLog[]>('moodLogs', []);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const loadMoods = async () => {
            const history = await api.fetchUserHistory(userId);
            if (history.moods.length > 0) setLogs(history.moods);
        };
        loadMoods();
    }, [userId]);
    
    const handleMoodSelect = async (rating: MoodLog['rating']) => {
        logInteraction({ type: 'LOG_MOOD', metadata: { rating } });
        const newLog: MoodLog = {
            id: crypto.randomUUID(),
            rating,
            timestamp: new Date().toISOString(),
        };
        setLogs([newLog, ...logs]);
        await api.saveMood(userId, newLog);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 2000);
    };
    
    const title = t('mood_tracker.title');
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('mood_tracker.subtitle')}</p>
            </div>
            
            <div className="pt-2">
                <p className="text-center font-medium text-neutral-700 dark:text-neutral-300 mb-3">{t('mood_tracker.prompt')}</p>
                <div className="flex justify-around items-center">
                    {moodOptions.map(({ rating, emoji, labelKey }) => (
                        <Tooltip key={rating} text={t(labelKey)} position="bottom">
                            <button
                                onClick={() => handleMoodSelect(rating)}
                                className="text-4xl p-2 rounded-full transform transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label={t(labelKey)}
                            >
                                {emoji}
                            </button>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {showConfirmation && (
                <p className="text-center text-green-600 dark:text-green-400 font-semibold transition-opacity duration-300">
                    {t('mood_tracker.logged_confirmation')}
                </p>
            )}

            <MoodChart logs={logs} />
        </div>
    );
};

export default MoodTracker;