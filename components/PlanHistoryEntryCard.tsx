import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlanHistoryEntry } from '../types';
import Tooltip from './Tooltip';
import { logInteraction } from '../services/interactionLogger';

interface PlanHistoryEntryCardProps {
    entry: PlanHistoryEntry;
}

const PlanHistoryEntryCard: React.FC<PlanHistoryEntryCardProps> = ({ entry }) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    
    const formattedDate = new Date(entry.timestamp).toLocaleString(i18n.language, {
        dateStyle: 'long',
        timeStyle: 'short',
    });

    const sources = entry.sources || [];

    const formatPlanForDownload = (plan: PlanHistoryEntry): string => {
        let content = `Serene - Anxiety Relief Plan\n`;
        content += `===================================\n\n`;
        content += `Generated On: ${new Date(plan.timestamp).toLocaleString(i18n.language)}\n`;
        content += `Your Input: "${plan.userInput}"\n\n`;
        content += `--- PERSONALIZED EXERCISES ---\n\n`;

        plan.generatedExercises.forEach((ex, index) => {
            content += `EXERCISE ${index + 1}: ${ex.title}\n`;
            content += `Category: ${ex.category}\n`;
            content += `Duration: ${ex.duration_minutes} minutes\n`;
            content += `Description: ${ex.description}\n`;
            content += `Steps:\n`;
            ex.steps.forEach((step, stepIndex) => {
                content += `  ${stepIndex + 1}. ${step}\n`;
            });
            content += `\n-----------------------------------\n\n`;
        });

        if (plan.sources && plan.sources.length > 0) {
            content += `--- SOURCES ---\n`;
            plan.sources.forEach(source => {
                content += `- ${source.title}: ${source.url}\n`;
            });
            content += `\n`;
        }

        return content;
    };


    const handleDownload = () => {
        logInteraction({ type: 'DOWNLOAD_PLAN', metadata: { entry_id: entry.id } });

        const content = formatPlanForDownload(entry);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        a.download = `Serene-Plan-${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="bg-white dark:bg-neutral-800/50 p-4 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 flex items-start gap-4">
                        {entry.calmImageUrl && (
                            <button
                                onClick={() => setIsOverlayVisible(true)}
                                className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800"
                            >
                                <img
                                    src={entry.calmImageUrl}
                                    alt="Generated calm scape"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{formattedDate}</p>
                            <div className="mt-2">
                                <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">{t('plan_history_card.your_input')}</p>
                                <p className="mt-1 text-neutral-700 dark:text-neutral-300 italic">"{entry.userInput}"</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <Tooltip text={t('tooltip.download_plan')}>
                            <button
                                onClick={handleDownload}
                                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800"
                                aria-label={t('tooltip.download_plan')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </Tooltip>
                        <Tooltip text={t(isExpanded ? 'tooltip.collapse_details' : 'tooltip.expand_details')}>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800"
                                aria-expanded={isExpanded}
                                aria-controls={`history-details-${entry.id}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="sr-only">Toggle details</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div
                    id={`history-details-${entry.id}`}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] mt-4' : 'max-h-0'}`}
                >
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                        <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider mb-2">{t('plan_history_card.generated_plan')}</p>
                        <ul className="space-y-4">
                            {entry.generatedExercises.map(ex => (
                                <li key={ex.id} className="p-3 bg-neutral-100 dark:bg-neutral-900/70 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-neutral-800 dark:text-neutral-100">{ex.title}</p>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0 ml-2">
                                            {t('exercise_card.duration_minutes', { duration: ex.duration_minutes })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{ex.description}</p>
                                </li>
                            ))}
                        </ul>

                        {sources && sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider mb-2">{t('plan_history_card.sources')}</p>
                                <ul className="space-y-2">
                                    {sources.map((source, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Tooltip text={t('tooltip.view_source')}>
                                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                </a>
                                            </Tooltip>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline transition-colors">
                                            {source.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isOverlayVisible && entry.calmImageUrl && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsOverlayVisible(false)}
                >
                    <img
                        src={entry.calmImageUrl}
                        alt="Full-screen view of the generated calm scape"
                        className="max-w-full max-h-full rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                    />
                     <button
                        onClick={() => setIsOverlayVisible(false)}
                        className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40"
                        aria-label="Close image view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </>
    );
};

export default PlanHistoryEntryCard;