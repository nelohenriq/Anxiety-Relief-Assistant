import React from 'react';
import { useTranslation } from 'react-i18next';
import { CompletedExerciseLog } from '../types';

interface ExerciseHistoryCardProps {
    log: CompletedExerciseLog;
}

const ReadOnlyStarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${
                        rating >= star
                            ? 'text-yellow-400'
                            : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const ExerciseHistoryCard: React.FC<ExerciseHistoryCardProps> = ({ log }) => {
    const { t, i18n } = useTranslation();

    const formattedDate = new Date(log.completedAt).toLocaleString(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <p className="font-bold text-neutral-800 dark:text-neutral-100">{log.exerciseTitle}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {t('exercise_history.completed_on')} {formattedDate}
                    </p>
                </div>
                <div className="text-right">
                     <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider mb-1">{t('exercise_history.your_rating')}</p>
                     <ReadOnlyStarRating rating={log.rating} />
                </div>
            </div>
        </div>
    );
};

export default ExerciseHistoryCard;