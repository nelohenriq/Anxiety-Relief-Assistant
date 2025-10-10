import React from 'react';
import { useTranslation } from 'react-i18next';

const Disclaimer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="w-full max-w-7xl mx-auto mt-12 p-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 text-neutral-600 text-sm dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-400">
                <p><strong>{t('disclaimer.title')}</strong> {t('disclaimer.body')}</p>
            </div>
        </footer>
    );
};

export default Disclaimer;
