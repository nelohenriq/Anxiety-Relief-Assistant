import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import Tooltip from './Tooltip';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
    onOpenProfile: () => void;
    showBackground: boolean;
    onOpenCrisisModal: () => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

/**
 * Header component that renders the top navigation bar of the application.
 * It includes a logo, title, search bar, and various controls such as theme toggle,
 * crisis support button, and profile settings button.
 *
 * @param {Object} props - The props for the Header component.
 * @param {() => void} props.onOpenProfile - Callback function triggered when the profile settings button is clicked.
 * @param {boolean} props.showBackground - Determines whether the header has a background or is transparent.
 * @param {() => void} props.onOpenCrisisModal - Callback function triggered when the crisis support button is clicked.
 * @param {string} props.searchQuery - The current search query string for the search bar.
 * @param {(query: string) => void} props.onSearchQueryChange - Callback function triggered when the search query changes.
 *
 * @returns {JSX.Element} The rendered Header component.
 */
const Header: React.FC<HeaderProps> = ({ onOpenProfile, showBackground, onOpenCrisisModal, searchQuery, onSearchQueryChange }) => {
      const { t } = useTranslation();
      const { isOnline } = useOnlineStatus();
      const pathname = usePathname();
      const router = useRouter();

      const navigationItems = [
        { name: 'Today', path: '/', active: pathname === '/' },
        { name: 'Journal', path: '/journal', active: pathname === '/journal' },
        { name: 'Meditate', path: '/meditate', active: pathname === '/meditate' },
        { name: 'Breathe', path: '/breathe', active: pathname === '/breathe' },
        { name: 'Sleep', path: '/sleep', active: pathname === '/sleep' },
      ];
    return (
        <header className={`w-full fixed top-0 z-40 transition-all duration-500 ${showBackground ? 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg border-b border-neutral-200/50 dark:border-neutral-800/50' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18">
                    {/* Enhanced Logo and Title */}
                    <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 10.8295 3 7.5 3C4.17048 3 3 6.25278 3 6.25278C3 6.25278 3 8.87327 5.25 10.5C7.5 12.1267 12 15 12 15C12 15 16.5 12.1267 18.75 10.5C21 8.87327 21 6.25278 21 6.25278C21 6.25278 19.8295 3 16.5 3C13.1705 3 12 6.25278 12 6.25278Z" stroke="currentColor" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V21" stroke="currentColor"/>
                            </svg>
                          </div>
                         <span className="font-black text-xl bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">{t('header.title')}</span>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => (
                          <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              item.active
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                    </nav>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex justify-center flex-1 px-4">
                        <SearchBar query={searchQuery} onQueryChange={onSearchQueryChange} />
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex items-center space-x-3">
                         {/* Network Status Indicator */}
                         <Tooltip text={isOnline ? t('header.online', 'Online') : t('header.offline', 'Offline')}>
                             <div className={`p-2.5 rounded-xl transition-all duration-300 ${isOnline ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'} hover:scale-110`}>
                                 {isOnline ? (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                     </svg>
                                 ) : (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                                     </svg>
                                 )}
                             </div>
                         </Tooltip>

                         {/* Enhanced Crisis Support Button */}
                         <Tooltip text={t('header.crisis_support_aria_label')}>
                             <button
                                 onClick={onOpenCrisisModal}
                                 className="relative p-2.5 rounded-xl text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-900 transition-all duration-300 hover:scale-110 shadow-sm"
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
                        <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            <ThemeToggle />
                        </div>
                        <Tooltip text={t('header.settings_aria_label')}>
                            <button
                                onClick={onOpenProfile}
                                className="p-2.5 rounded-xl text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:text-neutral-400 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:ring-offset-neutral-900 transition-all duration-300 hover:scale-110 shadow-sm"
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