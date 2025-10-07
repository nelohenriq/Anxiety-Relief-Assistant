import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThoughtRecordEntry } from '../types';

interface ThoughtRecordHistoryCardProps {
    entry: ThoughtRecordEntry;
}

const ThoughtRecordHistoryCard: React.FC<ThoughtRecordHistoryCardProps> = ({ entry }) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const formattedDate = new Date(entry.timestamp).toLocaleString(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg text-sm">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{entry.situation}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-full text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    aria-expanded={isExpanded}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700' : 'max-h-0'}`}>
                <div className="space-y-2">
                    <div>
                        <p className="font-bold text-xs uppercase text-neutral-500 dark:text-neutral-400">{t('thought_record.steps.negative_thought')}</p>
                        <p className="text-neutral-700 dark:text-neutral-300 italic">"{entry.negativeThought}"</p>
                    </div>
                     <div>
                        <p className="font-bold text-xs uppercase text-neutral-500 dark:text-neutral-400">{t('thought_record.steps.alternative')}</p>
                        <p className="text-neutral-700 dark:text-neutral-300 italic">"{entry.alternativeThought}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThoughtRecordHistoryCard;
