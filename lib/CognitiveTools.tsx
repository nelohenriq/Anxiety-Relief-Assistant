import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '../hooks/useLocalStorage';
import { ThoughtRecordEntry } from '../types';
import ThoughtRecord from './ThoughtRecord';
import ThoughtRecordHistory from './ThoughtRecordHistory';
import ExerciseIcon from './ExerciseIcon';
import { logInteraction } from '../services/interactionLogger';

interface CognitiveToolsProps {
    searchQuery: string;
}

const CognitiveTools: React.FC<CognitiveToolsProps> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [history, setHistory] = useLocalStorage<ThoughtRecordEntry[]>('thoughtRecords', []);

    const handleSaveRecord = (record: Omit<ThoughtRecordEntry, 'id' | 'timestamp'>) => {
        const newRecord: ThoughtRecordEntry = {
            id: crypto.randomUUID(),
            // FIX: Corrected `new date()` to `new Date()`.
            timestamp: new Date().toISOString(),
            ...record
        };
        setHistory([newRecord, ...history]);
        setIsRecording(false);
    };

    if (isRecording) {
        return <ThoughtRecord onSave={handleSaveRecord} onClose={() => setIsRecording(false)} />;
    }

    return (
        <div className="w-full space-y-6 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('cognitive_tools.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('cognitive_tools.subtitle')}</p>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm flex flex-col items-center">
                 <ExerciseIcon category="Cognitive" className="h-10 w-10 text-primary-600 dark:text-primary-400 mb-2" />
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{t('cognitive_tools.thought_record_title')}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 text-center flex-grow">{t('cognitive_tools.thought_record_description')}</p>
                <button
                    onClick={() => {
                        logInteraction({ type: 'START_THOUGHT_RECORD' });
                        setIsRecording(true);
                    }}
                    className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                >
                    {t('cognitive_tools.start_button')}
                </button>
            </div>
            <ThoughtRecordHistory history={history} searchQuery={searchQuery} />
        </div>
    );
};

export default CognitiveTools;