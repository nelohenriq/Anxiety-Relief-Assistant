import React from 'react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import Tooltip from './Tooltip';

interface HeaderProps {
    onOpenProfile: () => void;
    showBackground: boolean;
    onOpenCrisisModal: () => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenProfile, showBackground, onOpenCrisisModal, searchQuery, onSearchQueryChange }) => {
    const { t } = useTranslation();
    return (
        <header className={`w-full fixed top-0 z-40 transition-all duration-300 ${showBackground ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-md border-b border-neutral-200 dark:border-neutral-800' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 10.8295 3 7.5 3C4.17048 3 3 6.25278 3 6.25278C3 6.25278 3 8.87327 5.25 10.5C7.5 12.1267 12 15 12 15C12 15 16.5 12.1267 18.75 10.5C21 8.87327 21 6.25278 21 6.25278C21 6.25278 19.8295 3 16.5 3C13.1705 3 12 6.25278 12 6.25278Z" stroke="currentColor" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V21" stroke="currentColor"/>
                         </svg>
                        <span className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{t('header.title')}</span>
                    </div>
                    
                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex justify-center flex-1 px-4">
                        <SearchBar query={searchQuery} onQueryChange={onSearchQueryChange} />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                        <Tooltip text={t('header.crisis_support_aria_label')}>
                            <button
                                onClick={onOpenCrisisModal}
                                className="relative p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 transition-colors"
                                aria-label={t('header.crisis_support_aria_label')}
                            >
                                <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </button>
                        </Tooltip>
                        <ThemeToggle />
                        <Tooltip text={t('header.settings_aria_label')}>
                            <button
                                onClick={onOpenProfile}
                                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:ring-offset-neutral-900 transition-colors"
                                aria-label={t('header.settings_aria_label')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;