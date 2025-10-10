import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingSpinner: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 border-4 border-primary-500 border-dashed rounded-full animate-spin"></div>
            <p className="text-neutral-600 dark:text-neutral-400">{t('loading_spinner.message')}</p>
        </div>
    );
};

export default LoadingSpinner;
