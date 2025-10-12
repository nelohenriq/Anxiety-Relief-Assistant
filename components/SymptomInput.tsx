import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SymptomSelector from './SymptomSelector';

const crisisKeywords = [
    'suicide', 'kill myself', 'want to die', 'ending my life',
    'end it all', 'no reason to live', 'hopeless'
];

interface SymptomInputProps {
    symptoms: string;
    setSymptoms: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onCrisisDetect: () => void;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ symptoms, setSymptoms, onSubmit, isLoading, onCrisisDetect }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const lowerCaseSymptoms = symptoms.toLowerCase();
        if (crisisKeywords.some(keyword => lowerCaseSymptoms.includes(keyword))) {
            onCrisisDetect();
        }
    }, [symptoms, onCrisisDetect]);

    const handleSymptomSelect = (symptom: string) => {
        const currentSymptoms = symptoms.trim();
        if (currentSymptoms.toLowerCase().includes(symptom.toLowerCase())) {
            return;
        }

        const separator = currentSymptoms.length > 0 ? '. ' : '';
        const newSymptoms = `${currentSymptoms}${separator}${symptom}`;
        setSymptoms(newSymptoms);
    };

    return (
        <form onSubmit={onSubmit} className="w-full space-y-8">
            <div className="text-center">
                <label htmlFor="symptoms-input" className="block text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-2">
                    {t('symptom_input.title')}
                </label>
                <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    Share what's troubling you, and we'll create a personalized plan to help
                </p>
            </div>

            <div className="relative">
                <textarea
                    id="symptoms-input"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('symptom_input.placeholder')}
                    className="w-full h-40 p-6 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 text-lg resize-none hover-lift"
                    disabled={isLoading}
                    aria-label={t('symptom_input.aria_label')}
                />
                <div className="absolute bottom-4 right-4 text-sm text-neutral-400 dark:text-neutral-500">
                    {symptoms.length}/500
                </div>
            </div>

            <SymptomSelector onSymptomSelect={handleSymptomSelect} selectedSymptoms={symptoms} />

            <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="group w-full flex justify-center items-center px-8 py-4 border-2 border-transparent text-xl font-bold rounded-2xl shadow-lg text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:from-neutral-400 disabled:to-neutral-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Your Plan...
                    </>
                ) : (
                    <>
                        Get My Personalized Plan
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
};

export default SymptomInput;