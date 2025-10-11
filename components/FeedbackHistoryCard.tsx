import React from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackEntry } from '../types';

interface FeedbackHistoryCardProps {
    entry: FeedbackEntry;
}

/**
 * A React functional component that renders a card displaying feedback history.
 *
 * @component
 * @param {FeedbackHistoryCardProps} props - The props for the component.
 * @param {Object} props.entry - The feedback entry to display.
 * @param {string} props.entry.timestamp - The timestamp of the feedback entry.
 * @param {string} props.entry.type - The type of feedback (e.g., "suggestion", "bug", "general").
 * @param {string} props.entry.message - The message content of the feedback entry.
 *
 * @returns {JSX.Element} A styled card component displaying the feedback entry details.
 *
 * @remarks
 * - The component uses the `useTranslation` hook for internationalization.
 * - Feedback types are styled differently based on their type.
 * - The timestamp is formatted based on the current language setting.
 *
 * @example
 * ```tsx
 * const feedbackEntry = {
 *   timestamp: "2023-10-01T12:34:56Z",
 *   type: "suggestion",
 *   message: "This is a suggestion message."
 * };
 *
 * <FeedbackHistoryCard entry={feedbackEntry} />
 * ```
 */
const FeedbackHistoryCard: React.FC<FeedbackHistoryCardProps> = ({ entry }) => {
    const { t, i18n } = useTranslation();

    const formattedDate = new Date(entry.timestamp).toLocaleString(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    
    const typeStyles = {
        suggestion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        bug: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        general: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
    }

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeStyles[entry.type]}`}>
                            {t(`feedback_modal.types.${entry.type}`)}
                        </span>
                         <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
                    </div>
                     <p className="text-neutral-700 dark:text-neutral-300 mt-2 text-sm whitespace-pre-wrap">{entry.message}</p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackHistoryCard;