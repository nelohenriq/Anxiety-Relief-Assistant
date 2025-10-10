import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompletedExerciseLog } from '../types';
import ExerciseHistoryCard from './ExerciseHistoryCard';

interface ExerciseHistoryProps {
    history: CompletedExerciseLog[];
}

const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({ history }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('exercise_history.title')}</h3>
            
            {history.length > 0 ? (
                <div className="space-y-3">
                    {history.map(log => (
                        <ExerciseHistoryCard key={log.completedAt} log={log} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400">{t('exercise_history.empty_state')}</p>
                </div>
            )}
        </div>
    );
};

export default ExerciseHistory;