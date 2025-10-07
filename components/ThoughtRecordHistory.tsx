import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThoughtRecordEntry } from '../types';
import ThoughtRecordHistoryCard from './ThoughtRecordHistoryCard';

interface ThoughtRecordHistoryProps {
    history: ThoughtRecordEntry[];
    searchQuery: string;
}

const ThoughtRecordHistory: React.FC<ThoughtRecordHistoryProps> = ({ history, searchQuery }) => {
    const { t } = useTranslation();
    
    const filteredHistory = history.filter(entry => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            entry.situation.toLowerCase().includes(lowerCaseQuery) ||
            entry.negativeThought.toLowerCase().includes(lowerCaseQuery) ||
            entry.challenge.toLowerCase().includes(lowerCaseQuery) ||
            entry.alternativeThought.toLowerCase().includes(lowerCaseQuery) ||
            entry.outcome.toLowerCase().includes(lowerCaseQuery)
        );
    });

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 text-center">{t('thought_record_history.title')}</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {filteredHistory.map(entry => (
                    <ThoughtRecordHistoryCard key={entry.id} entry={entry} />
                ))}
                 {filteredHistory.length === 0 && searchQuery && (
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No thought records match your search.</p>
                )}
            </div>
        </div>
    );
};

export default ThoughtRecordHistory;