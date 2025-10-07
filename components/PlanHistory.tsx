import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlanHistoryEntry } from '../types';
import PlanHistoryEntryCard from './PlanHistoryEntryCard';

interface PlanHistoryProps {
    history: PlanHistoryEntry[];
}

const PlanHistory: React.FC<PlanHistoryProps> = ({ history }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{t('plan_history.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('plan_history.subtitle')}</p>
            </div>
            
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(entry => (
                        <PlanHistoryEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400">{t('plan_history.empty_state')}</p>
                </div>
            )}
        </div>
    );
};

export default PlanHistory;
