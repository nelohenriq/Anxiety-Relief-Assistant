import React from 'react';
import { useTranslation } from 'react-i18next';
import { symptomCategories } from '../data/symptoms';
import SymptomCategory from './SymptomCategory';

interface SymptomSelectorProps {
    onSymptomSelect: (symptom: string) => void;
    selectedSymptoms: string;
}

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ onSymptomSelect, selectedSymptoms }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4 pt-4">
             <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('symptom_selector.helper_text')}
            </p>
            {Object.entries(symptomCategories).map(([categoryKey, symptomKeys]) => (
                <SymptomCategory 
                    key={categoryKey}
                    categoryKey={categoryKey}
                    symptomKeys={symptomKeys}
                    onSymptomSelect={onSymptomSelect}
                    selectedSymptoms={selectedSymptoms}
                />
            ))}
        </div>
    );
};

export default SymptomSelector;
