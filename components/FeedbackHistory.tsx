import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackEntry } from '../types';
import FeedbackHistoryCard from './FeedbackHistoryCard';

interface FeedbackHistoryProps {
    history: FeedbackEntry[];
}

/**
 * A React functional component that displays a history of feedback entries.
 * 
 * @component
 * @param {FeedbackHistoryProps} props - The props for the component.
 * @param {Array} props.history - An array of feedback history entries to display.
 * 
 * @returns {JSX.Element} A rendered component that shows a list of feedback history cards
 * if the `history` array is not empty, or an empty state message if it is empty.
 * 
 * @remarks
 * - Uses the `useTranslation` hook for internationalization.
 * - Displays a title and either a list of `FeedbackHistoryCard` components or an empty state message.
 * - Applies Tailwind CSS classes for styling.
 */
const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ history }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{t('feedback_history.title')}</h3>
            
            {history.length > 0 ? (
                <div className="space-y-3">
                    {history.map(entry => (
                        <FeedbackHistoryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400">{t('feedback_history.empty_state')}</p>
                </div>
            )}
        </div>
    );
};

export default FeedbackHistory;