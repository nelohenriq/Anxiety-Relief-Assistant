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
        <div className="pt-4">
             <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {t('symptom_selector.helper_text')}
            </p>
            <div className="space-y-2">
                {Object.entries(symptomCategories).map(([categoryKey, symptomKeys], index) => (
                    <SymptomCategory 
                        key={categoryKey}
                        categoryKey={categoryKey}
                        symptomKeys={symptomKeys}
                        onSymptomSelect={onSymptomSelect}
                        selectedSymptoms={selectedSymptoms}
                        isInitiallyExpanded={index === 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default SymptomSelector;