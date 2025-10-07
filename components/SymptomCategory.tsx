import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface SymptomCategoryProps {
    categoryKey: string;
    symptomKeys: string[];
    onSymptomSelect: (symptom: string) => void;
    selectedSymptoms: string;
}

const SymptomCategory: React.FC<SymptomCategoryProps> = ({ categoryKey, symptomKeys, onSymptomSelect, selectedSymptoms }) => {
    const { t, i18n } = useTranslation();
    const categoryName = t(`symptom_categories.${categoryKey}`);

    const translatedSymptoms = useMemo(() => {
        return symptomKeys.map(symptomKey => ({
            key: symptomKey,
            name: t(`symptoms.${symptomKey}`)
        }));
    }, [symptomKeys, i18n.language]);

    return (
        <div>
            <h4 className="text-md font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{categoryName} {t('symptom_input.symptoms_suffix')}</h4>
            <div className="flex flex-wrap gap-2">
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
                                    : 'bg-primary-50 border-primary-200 text-primary-800 hover:bg-primary-100 dark:bg-neutral-800 dark:border-neutral-600 dark:text-primary-300 dark:hover:bg-neutral-700'
                                }`}
                            aria-pressed={isSelected}
                        >
                            {name}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default SymptomCategory;