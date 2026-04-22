import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThoughtRecordEntry } from '../types';
import { cognitiveDistortions } from '../data/cognitiveDistortions';
import { getThoughtChallengeHelp } from '../services/llmService';
import { logInteraction } from '../services/interactionLogger';
import Tooltip from './Tooltip';
import { useUser } from '../context/UserContext';

interface ThoughtRecordProps {
    onSave: (record: Omit<ThoughtRecordEntry, 'id' | 'timestamp'>) => void;
    onClose: () => void;
}

const ThoughtRecord: React.FC<ThoughtRecordProps> = ({ onSave, onClose }) => {
    const { t, i18n } = useTranslation();
    const { llmProvider, ollamaModel, ollamaCloudApiKey } = useUser();
    
    const steps = [
        t('thought_record.steps.situation'),
        t('thought_record.steps.negative_thought'),
        t('thought_record.steps.challenge'),
        t('thought_record.steps.alternative'),
        t('thought_record.steps.outcome')
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [situation, setSituation] = useState('');
    const [negativeThought, setNegativeThought] = useState('');
    const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
    const [challenge, setChallenge] = useState('');
    const [alternativeThought, setAlternativeThought] = useState('');
    const [outcome, setOutcome] = useState('');
    
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleDistortionToggle = (distortionName: string) => {
        setSelectedDistortions(prev =>
            prev.includes(distortionName)
                ? prev.filter(d => d !== distortionName)
                : [...prev, distortionName]
        );
    };
    
    const handleAiHelp = async () => {
        if (!situation || !negativeThought) return;
        setIsAiLoading(true);
        setAiError(null);
        logInteraction({ type: 'REQUEST_THOUGHT_CHALLENGE_HELP', metadata: { provider: llmProvider } });
        try {
            const helpText = await getThoughtChallengeHelp(llmProvider, ollamaModel, ollamaCloudApiKey, situation, negativeThought, i18n.language);
            setChallenge(prev => `${prev ? prev + '\n\n' : ''}AI-Suggested Questions:\n${helpText}`);
        } catch (err) {
             if (err instanceof Error) setAiError(err.message);
             else setAiError('An unknown error occurred.');
        } finally {
            setIsAiLoading(false);
        }
    }

    const handleSave = () => {
        logInteraction({
            type: 'SAVE_THOUGHT_RECORD',
            metadata: {
                num_distortions_selected: selectedDistortions.length,
            }
        });
        onSave({
            situation,
            negativeThought,
            cognitiveDistortions: selectedDistortions,
            challenge,
            alternativeThought,
            outcome
        });
    };

    const isNextDisabled = () => {
        switch (currentStep) {
            case 0: return !situation.trim();
            case 1: return !negativeThought.trim();
            case 2: return !challenge.trim();
            case 3: return !alternativeThought.trim();
            case 4: return !outcome.trim();
            default: return true;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div>
                        <label htmlFor="situation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('thought_record.situation_label')}</label>
                        <textarea id="situation" value={situation} onChange={e => setSituation(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder={t('thought_record.situation_placeholder')} />
                    </div>
                );
            case 1:
                return (
                    <div>
                        <label htmlFor="negative-thought" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('thought_record.negative_thought_label')}</label>
                        <textarea id="negative-thought" value={negativeThought} onChange={e => setNegativeThought(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder={t('thought_record.negative_thought_placeholder')} />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{t('thought_record.distortions_label')}</p>
                            <div className="flex flex-wrap gap-2">
                                {cognitiveDistortions.map(d => {
                                    const name = t(d.nameKey);
                                    return (
                                        <button key={d.key} onClick={() => handleDistortionToggle(name)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedDistortions.includes(name) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100'}`} title={t(d.descriptionKey)}>{name}</button>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="challenge" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('thought_record.challenge_label')}</label>
                            <textarea id="challenge" value={challenge} onChange={e => setChallenge(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder={t('thought_record.challenge_placeholder')} />
                        </div>
                        <div>
                             <Tooltip text={t('tooltip.get_ai_help')}>
                                <button onClick={handleAiHelp} disabled={isAiLoading} className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50">
                                    {isAiLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            {t('thought_record.ai_help_loading')}
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H9a1 1 0 001-1v-.5z" /><path d="M5.5 9.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H9a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V15a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1v-.5zM14.5 9.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H19a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V15a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H14a1 1 0 001-1v-.5z" /></svg>
                                            {t('thought_record.ai_help_button')}
                                        </>
                                    )}
                                </button>
                            </Tooltip>
                            {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <label htmlFor="alternative-thought" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('thought_record.alternative_label')}</label>
                        <textarea id="alternative-thought" value={alternativeThought} onChange={e => setAlternativeThought(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder={t('thought_record.alternative_placeholder')} />
                    </div>
                );
            case 4:
                return (
                     <div>
                        <label htmlFor="outcome" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('thought_record.outcome_label')}</label>
                        <textarea id="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder={t('thought_record.outcome_placeholder')} />
                    </div>
                )
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{t('thought_record.title')}</h3>
                    <p className="text-primary-700 dark:text-primary-300 font-semibold text-sm">{t('thought_record.step_prefix', { step: currentStep + 1 })} {steps[currentStep]}</p>
                </div>
                <Tooltip text={t('tooltip.close')}>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label="Close exercise">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </Tooltip>
            </div>
            
             {/* Progress Bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
            </div>

            <div className="min-h-[200px] py-4">{renderStepContent()}</div>
            
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0} className="px-4 py-2 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50">{t('thought_record.previous_button')}</button>
                {currentStep < steps.length - 1 ? (
                    <button onClick={() => setCurrentStep(s => s + 1)} disabled={isNextDisabled()} className="px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 dark:disabled:bg-neutral-600">{t('thought_record.next_button')}</button>
                ) : (
                    <button onClick={handleSave} disabled={isNextDisabled()} className="px-4 py-2 text-sm font-medium rounded-md border border-transparent text-white bg-green-600 hover:bg-green-700 disabled:bg-neutral-400">{t('thought_record.save_button')}</button>
                )}
            </div>
        </div>
    );
};

export default ThoughtRecord;
