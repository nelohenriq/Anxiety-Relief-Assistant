import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Tooltip from './Tooltip';

const ThemeToggle: React.FC = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const tooltipText = t(theme === 'light' ? 'theme_toggle.aria_label_dark' : 'theme_toggle.aria_label_light');

    return (
        <Tooltip text={tooltipText}>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:ring-offset-neutral-900 transition-colors"
                aria-label={tooltipText}
            >
                {theme === 'light' ? (
                    // Moon Icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    // Sun Icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </button>
        </Tooltip>
    );
};

export default ThemeToggle;