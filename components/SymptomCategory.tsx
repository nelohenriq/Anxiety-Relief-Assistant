import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SymptomCategoryProps {
    categoryKey: string;
    symptomKeys: string[];
    onSymptomSelect: (symptom: string) => void;
    selectedSymptoms: string;
    isInitiallyExpanded?: boolean;
}

const SymptomCategory: React.FC<SymptomCategoryProps> = ({ categoryKey, symptomKeys, onSymptomSelect, selectedSymptoms, isInitiallyExpanded = false }) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
    const categoryName = t(`symptom_categories.${categoryKey}`);

    const translatedSymptoms = useMemo(() => {
        return symptomKeys.map(symptomKey => ({
            key: symptomKey,
            name: t(`symptoms.${symptomKey}`)
        }));
    }, [symptomKeys, i18n.language]);

    return (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 id={`category-header-${categoryKey}`}>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
                    aria-expanded={isExpanded}
                    aria-controls={`symptoms-${categoryKey}`}
                >
                    <span className="text-md font-semibold text-neutral-800 dark:text-neutral-200">{categoryName} {t('symptom_input.symptoms_suffix')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </h3>
            <div
                id={`symptoms-${categoryKey}`}
                role="region"
                aria-labelledby={`category-header-${categoryKey}`}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="flex flex-wrap gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                    {translatedSymptoms.map(({ key, name }) => {
                        const isSelected = selectedSymptoms.toLowerCase().includes(name.toLowerCase());
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSymptomSelect(name)}
                                disabled={isSelected}
                                className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 border
                                    ${isSelected
                                        ? 'bg-primary-600 text-white border-primary-600 cursor-default dark:bg-primary-500 dark:border-primary-500'
                                        : 'bg-white border-primary-200 text-primary-800 hover:bg-primary-100 dark:bg-neutral-900 dark:border-neutral-600 dark:text-primary-300 dark:hover:bg-neutral-700'
                                    }`}
                                aria-pressed={isSelected}
                            >
                                {name}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default SymptomCategory;