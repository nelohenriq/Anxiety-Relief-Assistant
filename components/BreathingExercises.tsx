import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BreathingVisualizer from './BreathingVisualizer';
import { BreathingExercise } from '../types';
import { logInteraction } from '../services/interactionLogger';

interface BreathingExercisesProps {
    searchQuery: string;
}

const BreathingExercises: React.FC<BreathingExercisesProps> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

    const exercises: BreathingExercise[] = useMemo(() => [
        {
            name: t('breathing_exercises.box_breathing.name'),
            description: t('breathing_exercises.box_breathing.description'),
            steps: [
                { label: t('breathing_exercises.steps.breathe_in'), duration: 4 },
                { label: t('breathing_exercises.steps.hold'), duration: 4 },
                { label: t('breathing_exercises.steps.breathe_out'), duration: 4 },
                { label: t('breathing_exercises.steps.hold'), duration: 4 },
            ]
        },
        {
            name: t('breathing_exercises.478_breathing.name'),
            description: t('breathing_exercises.478_breathing.description'),
            steps: [
                { label: t('breathing_exercises.steps.breathe_in'), duration: 4 },
                { label: t('breathing_exercises.steps.hold'), duration: 7 },
                { label: t('breathing_exercises.steps.breathe_out'), duration: 8 },
            ]
        },
        {
            name: t('breathing_exercises.cyclic_sighing.name'),
            description: t('breathing_exercises.cyclic_sighing.description'),
            steps: [
                { label: t('breathing_exercises.steps.inhale'), duration: 2 },
                { label: t('breathing_exercises.steps.inhale_again'), duration: 1.5 },
                { label: t('breathing_exercises.steps.exhale_long'), duration: 6 },
            ]
        }
    ], [i18n.language]);

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