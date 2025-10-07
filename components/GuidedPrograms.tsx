import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '../hooks/useLocalStorage';
import { Program, ProgramProgress } from '../types';
import { guidedProgramsData } from '../data/programs';
import { logInteraction } from '../services/interactionLogger';
import ProgramViewer from './ProgramViewer';

interface GuidedProgramsProps {
    searchQuery: string;
}

const GuidedPrograms: React.FC<GuidedProgramsProps> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const [activeProgramId, setActiveProgramId] = useLocalStorage<string | null>('activeProgramId', null);
    const [progress, setProgress] = useLocalStorage<ProgramProgress>('programProgress', {});
    
    const translatedPrograms = useMemo(() => guidedProgramsData.map(program => ({
        id: program.id,
        title: t(program.titleKey),
        description: t(program.descriptionKey),
        days: program.days.map(day => ({
            day: day.day,
            title: t(day.titleKey),
            concept: t(day.conceptKey),
            exercise: {
                title: t(day.exercise.titleKey),
                description: t(day.exercise.descriptionKey),
                category: day.exercise.category,
                duration_minutes: day.exercise.duration_minutes,
                steps: day.exercise.stepKeys.map(key => t(key))
            }
        }))
    })), [i18n.language]);

    const activeProgram = translatedPrograms.find(p => p.id === activeProgramId);
    
    const filteredPrograms = useMemo(() => {
        if (!searchQuery) return translatedPrograms;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return translatedPrograms.filter(program => 
            program.title.toLowerCase().includes(lowerCaseQuery) ||
            program.description.toLowerCase().includes(lowerCaseQuery) ||
            program.days.some(day => 
                day.title.toLowerCase().includes(lowerCaseQuery) ||
                day.concept.toLowerCase().includes(lowerCaseQuery) ||
                day.exercise.title.toLowerCase().includes(lowerCaseQuery) ||
                day.exercise.description.toLowerCase().includes(lowerCaseQuery)
            )
        );
    }, [searchQuery, translatedPrograms]);

    const handleSelectProgram = (program: Program) => {
        logInteraction({ type: 'START_GUIDED_PROGRAM', metadata: { program_id: program.id } });
        setActiveProgramId(program.id);
        if (!progress[program.id]) {
            setProgress({ ...progress, [program.id]: { currentDay: 0 } });
        }
    };

    const handleUpdateProgress = (newDayIndex: number) => {
        if (activeProgram) {
            setProgress({
                ...progress,
                [activeProgram.id]: { currentDay: newDayIndex },
            });
        }
    };

    const handleExitProgram = () => {
        setActiveProgramId(null);
    };

    if (activeProgram) {
        return (
            <ProgramViewer
                program={activeProgram}
                progress={progress[activeProgram.id] || { currentDay: 0 }}
                onUpdateProgress={handleUpdateProgress}
                onExit={handleExitProgram}
            />
        );
    }

    return (
        <div className="w-full space-y-6 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('guided_programs.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('guided_programs.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {filteredPrograms.map(program => (
                    <div key={program.id} className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{program.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 flex-grow">{program.description}</p>
                        <button
                            onClick={() => handleSelectProgram(program)}
                            className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                        >
                            {t('cognitive_tools.start_button')}
                        </button>
                    </div>
                ))}
                {filteredPrograms.length === 0 && searchQuery && (
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No guided programs match your search.</p>
                )}
            </div>
        </div>
    );
};

export default GuidedPrograms;