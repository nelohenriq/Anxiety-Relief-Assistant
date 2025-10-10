import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
    const { t } = useTranslation();

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t('search.placeholder')}
                aria-label={t('search.aria_label')}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
        </div>
    );
};

export default SearchBar;
