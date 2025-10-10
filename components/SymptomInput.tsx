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
        <form onSubmit={onSubmit} className="w-full space-y-6">
            <label htmlFor="symptoms-input" className="block text-xl font-medium text-neutral-700 dark:text-neutral-300 text-center">
                {t('symptom_input.title')}
            </label>
            <div className="w-full">
                <textarea
                    id="symptoms-input"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('symptom_input.placeholder')}
                    className="w-full h-32 p-4 border border-neutral-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
                    disabled={isLoading}
                    aria-label={t('symptom_input.aria_label')}
                />
            </div>

            <SymptomSelector onSymptomSelect={handleSymptomSelect} selectedSymptoms={symptoms} />

            <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('symptom_input.loading_button')}
                    </>
                ) : (
                    t('symptom_input.submit_button')
                )}
            </button>
        </form>
    );
};

export default SymptomInput;