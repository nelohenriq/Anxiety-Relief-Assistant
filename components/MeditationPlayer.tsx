import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip';

/**
 * Represents a meditation that has been translated into a specific language.
 * 
 * @interface TranslatedMeditation
 * 
 * @property {string} id - The unique identifier for the meditation.
 * @property {string} title - The title of the meditation.
 * @property {string} description - A brief description of the meditation.
 * @property {number} duration_minutes - The duration of the meditation in minutes.
 * @property {string[]} guidance - An array of guidance or instructions related to the meditation.
 */
interface TranslatedMeditation {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    guidance: string[];
}

interface MeditationPlayerProps {
    meditation: TranslatedMeditation;
    onClose: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ meditation, onClose }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < meditation.guidance.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{meditation.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('exercise_card.duration_minutes', { duration: meditation.duration_minutes })}</p>
                </div>
                <Tooltip text={t('tooltip.close')}>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label={t('tooltip.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </Tooltip>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                <div 
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentStep + 1) / meditation.guidance.length) * 100}%` }}
                ></div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none min-h-[12rem] flex items-center justify-center text-center">
                <p>{meditation.guidance[currentStep]}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button 
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {t('thought_record.previous_button')}
                </button>
                {currentStep < meditation.guidance.length - 1 ? (
                    <button 
                        onClick={handleNext}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('thought_record.next_button')}
                    </button>
                ) : (
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-green-600 hover:bg-green-700"
                    >
                        {t('meditation_player.finish_button')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MeditationPlayer;