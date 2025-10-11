import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompletedExerciseLog } from '../types';
import ExerciseHistoryCard from './ExerciseHistoryCard';

interface ExerciseHistoryProps {
    history: CompletedExerciseLog[];
}

/**
 * A React functional component that displays the exercise history of a user.
 * 
 * @param {ExerciseHistoryProps} props - The props for the component.
 * @param {Array} props.history - An array of exercise history logs, where each log contains details about a completed exercise.
 * 
 * @returns {JSX.Element} A component that renders a list of exercise history cards if history exists,
 * or a placeholder message if the history is empty.
 * 
 * @remarks
 * - This component uses the `useTranslation` hook for internationalization.
 * - The `ExerciseHistoryCard` component is used to render individual history logs.
 * - If the history is empty, a styled message is displayed to indicate the absence of logs.
 */
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