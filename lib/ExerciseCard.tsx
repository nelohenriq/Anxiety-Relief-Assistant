import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Exercise, FeedbackRating } from '../types';
import ExerciseIcon from './ExerciseIcon';
import Tooltip from './Tooltip';

interface ExerciseCardProps {
    exercise: Exercise;
    onFeedback: (exerciseId: string, exerciseTitle: string, rating: FeedbackRating) => void;
    feedbackRating?: FeedbackRating;
}

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => {
    const { t } = useTranslation();
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex justify-center items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Tooltip key={star} text={t('exercise_card.rating_aria_label', { star: star, count: star })} position="bottom">
                    <button
                        onClick={() => onRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        aria-label={t('exercise_card.rating_aria_label', { star: star, count: star })}
                    >
                        <svg className={`w-7 h-7 transition-colors ${
                            (hoverRating || rating) >= star 
                            ? 'text-yellow-400' 
                            : 'text-neutral-300 dark:text-neutral-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onFeedback, feedbackRating }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 transition-all duration-300">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`exercise-steps-${exercise.id}`}
                className="cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <ExerciseIcon category={exercise.category} className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{exercise.title}</h3>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-200 dark:border-primary-800">
                                    {exercise.category}
                                </span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('exercise_card.duration_minutes', { duration: exercise.duration_minutes })}</span>
                            </div>
                        </div>
                    </div>
                     <div aria-hidden="true" className="ml-4 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-neutral-600 dark:text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                
                <p className="mt-4 text-neutral-600 dark:text-neutral-300 pl-14">{exercise.description}</p>
            </div>
            
            <div
                id={`exercise-steps-${exercise.id}`}
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen mt-4' : 'max-h-0'}`}
            >
                <div className="border-t border-neutral-300 dark:border-neutral-700 pt-4 pl-14">
                    <h4 className="font-semibold text-lg text-neutral-700 dark:text-neutral-200 mb-2">{t('exercise_card.steps_title')}</h4>
                    <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-300">
                        {exercise.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-300 dark:border-neutral-700">
                    <p className="text-sm font-medium text-center text-neutral-600 dark:text-neutral-400 mb-2">{t('exercise_card.rating_prompt')}</p>
                    <StarRating 
                        rating={feedbackRating || 0} 
                        onRate={(newRating) => onFeedback(exercise.id, exercise.title, newRating)} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;