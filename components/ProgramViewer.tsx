import React from 'react';
import { useTranslation } from 'react-i18next';
import { Program, ProgramProgress } from '../types';
import ExerciseIcon from './ExerciseIcon';

interface ProgramViewerProps {
    program: Program;
    progress: ProgramProgress[string];
    onUpdateProgress: (newDayIndex: number) => void;
    onExit: () => void;
}

const ProgramViewer: React.FC<ProgramViewerProps> = ({ program, progress, onUpdateProgress, onExit }) => {
    const { t } = useTranslation();
    const currentDayIndex = progress.currentDay;
    const dayData = program.days[currentDayIndex];
    const totalDays = program.days.length;

    const handleNext = () => {
        if (currentDayIndex < totalDays - 1) {
            onUpdateProgress(currentDayIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentDayIndex > 0) {
            onUpdateProgress(currentDayIndex - 1);
        }
    };

    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{program.title}</h2>
                    <p className="text-primary-700 dark:text-primary-300 font-semibold">{t('program_viewer.day_of_total', { day: currentDayIndex + 1, total: totalDays })} {dayData.title}</p>
                </div>
                <button onClick={onExit} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label="Exit program">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            {/* Progress Bar */}
            <div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${((currentDayIndex + 1) / totalDays) * 100}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="space-y-6 pt-4">
                {/* Learning Concept */}
                <div className="p-4 bg-primary-50 dark:bg-primary-900/40 rounded-lg">
                    <h3 className="font-bold text-primary-800 dark:text-primary-200 text-lg mb-2">{t('program_viewer.todays_focus')}</h3>
                    <p className="text-neutral-700 dark:text-neutral-300">{dayData.concept}</p>
                </div>

                {/* Daily Exercise */}
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900/70 rounded-lg">
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-lg mb-3">{t('program_viewer.todays_exercise')}</h3>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                             <ExerciseIcon category={dayData.exercise.category} className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-800 dark:text-neutral-100">{dayData.exercise.title} ({t('exercise_card.duration_minutes', { duration: dayData.exercise.duration_minutes })})</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-3">{dayData.exercise.description}</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                                {dayData.exercise.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button 
                    onClick={handlePrev}
                    disabled={currentDayIndex === 0}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {t('thought_record.previous_button')}
                </button>
                <button 
                    onClick={handleNext}
                    disabled={currentDayIndex === totalDays - 1}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
                >
                    {t('thought_record.next_button')}
                </button>
            </div>
        </div>
    );
};

export default ProgramViewer;
