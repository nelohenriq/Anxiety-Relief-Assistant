import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BreathingVisualizer from './BreathingVisualizer';
import { BreathingExercise, BreathingStep } from '../types';
import { logInteraction } from '../services/interactionLogger';
import { breathingExercisesData } from '../data/breathingExercises';

interface BreathingExercisesProps {
    searchQuery: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const BreathingExercises: React.FC<BreathingExercisesProps> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

    const exercises: BreathingExercise[] = useMemo(() => {
        const translated = breathingExercisesData.map(ex => ({
            name: t(ex.nameKey),
            description: t(ex.descriptionKey),
            steps: ex.steps.map(step => ({
                label: t(step.labelKey),
                duration: step.duration,
                // FIX: Cast the stepType to the correct literal union type to resolve the type error.
                type: step.stepType as BreathingStep['type'],
            }))
        }));
        
        return shuffleArray(translated).slice(0, 3);
    }, [i18n.language, t]);

    if (activeExercise) {
        return <BreathingVisualizer exercise={activeExercise} onClose={() => setActiveExercise(null)} />;
    }
    
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('breathing_exercises.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('breathing_exercises.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {filteredExercises.map(exercise => (
                    <div key={exercise.name} className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{exercise.name}</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 flex-grow">{exercise.description}</p>
                        <button
                            onClick={() => {
                                logInteraction({ type: 'START_BREATHING_EXERCISE', metadata: { name: exercise.name } });
                                setActiveExercise(exercise);
                            }}
                            className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                        >
                            {t('breathing_exercises.start_button')}
                        </button>
                    </div>
                ))}
                {filteredExercises.length === 0 && searchQuery && (
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No breathing exercises match your search.</p>
                )}
            </div>
        </div>
    );
};

export default BreathingExercises;