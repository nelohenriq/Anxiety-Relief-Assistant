import React from 'react';
import { useTranslation } from 'react-i18next';
import { crisisHotlines } from '../data/crisisHotlines';

interface CrisisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * CrisisModal is a React functional component that displays a modal dialog
 * for crisis hotlines. It provides users with a way to access crisis support
 * via a phone number or a web link, depending on the configuration.
 *
 * @component
 * @param {CrisisModalProps} props - The props for the CrisisModal component.
 * @param {boolean} props.isOpen - Determines whether the modal is visible.
 * @param {() => void} props.onClose - Callback function to close the modal.
 *
 * @returns {JSX.Element | null} The rendered modal component if `isOpen` is true, otherwise `null`.
 *
 * @example
 * <CrisisModal
 *   isOpen={true}
 *   onClose={() => console.log('Modal closed')}
 * />
 *
 * @remarks
 * - The modal uses the `useTranslation` hook for internationalization.
 * - It dynamically selects the appropriate crisis hotline based on the user's language.
 * - The modal supports both phone numbers and web links for the crisis hotline.
 *
 * @accessibility
 * - The modal uses `role="dialog"` and `aria-modal="true"` for accessibility.
 * - The title of the modal is associated with the `aria-labelledby` attribute.
 *
 * @dependencies
 * - `useTranslation` from `react-i18next` for internationalization.
 * - Tailwind CSS classes for styling.
 */
const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    if (!isOpen) return null;

    const lang = i18n.language; // e.g., 'en', 'pt-pt'
    const langShort = lang.split('-')[0]; // e.g., 'pt'
    const hotline = crisisHotlines[lang] || crisisHotlines[langShort] || crisisHotlines.default;

    const isWebLink = hotline.phone.startsWith('http');
    const ctaText = isWebLink
        ? t('crisis_modal.cta_button_web', { name: hotline.name })
        : t('crisis_modal.cta_button_call', { name: hotline.name, number: hotline.phoneDisplay });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="crisis-title">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 id="crisis-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">{t('crisis_modal.title')}</h2>
                    <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                        {t('crisis_modal.body')}
                    </p>
                    <div className="mt-6">
                        <a 
                            href={hotline.phone} 
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            {...(isWebLink && { target: '_blank', rel: 'noopener noreferrer' })}
                        >
                           {ctaText}
                        </a>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="mt-4 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                        {t('crisis_modal.close_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CrisisModal;