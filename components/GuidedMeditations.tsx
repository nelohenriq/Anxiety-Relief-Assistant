import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { guidedMeditationsData } from '../data/meditations';
import MeditationPlayer from './MeditationPlayer';
import ExerciseIcon from './ExerciseIcon';
import { logInteraction } from '../services/interactionLogger';

interface GuidedMeditationsProps {
    searchQuery: string;
}

interface TranslatedMeditation {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    guidance: string[];
}

const GuidedMeditations: React.FC<GuidedMeditationsProps> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const [activeMeditation, setActiveMeditation] = useState<TranslatedMeditation | null>(null);

    const translatedMeditations = useMemo(() => guidedMeditationsData.map(meditation => ({
        id: meditation.id,
        title: t(meditation.titleKey),
        description: t(meditation.descriptionKey),
        duration_minutes: meditation.duration_minutes,
        guidance: meditation.guidanceKeys.map(key => t(key)),
    })), [i18n.language]);
    
    const filteredMeditations = useMemo(() => {
        if (!searchQuery) return translatedMeditations;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return translatedMeditations.filter(meditation => 
            meditation.title.toLowerCase().includes(lowerCaseQuery) ||
            meditation.description.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery, translatedMeditations]);

    if (activeMeditation) {
        return <MeditationPlayer meditation={activeMeditation} onClose={() => setActiveMeditation(null)} />;
    }

    return (
        <div className="w-full space-y-6 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('guided_meditations.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('guided_meditations.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {filteredMeditations.map(meditation => (
                    <div key={meditation.id} className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm">
                        <div className="flex items-start gap-3">
                            <ExerciseIcon category="Mindfulness" className="h-6 w-6 text-primary-500 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{meditation.title}</h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('exercise_card.duration_minutes', { duration: meditation.duration_minutes })}</p>
                                <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 flex-grow">{meditation.description}</p>
                                <button
                                    onClick={() => {
                                        logInteraction({ type: 'START_GUIDED_MEDITATION', metadata: { id: meditation.id } });
                                        setActiveMeditation(meditation);
                                    }}
                                    className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                                >
                                    {t('guided_meditations.start_button')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredMeditations.length === 0 && searchQuery && (
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No meditations match your search.</p>
                )}
            </div>
        </div>
    );
};

export default GuidedMeditations;