import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackEntry } from '../types';
import Tooltip from './Tooltip';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>) => void;
}

/**
 * FeedbackModal is a React functional component that renders a modal dialog
 * for collecting user feedback. The modal includes a form with fields for
 * selecting feedback type and entering a message. It also provides options
 * to submit the feedback or cancel the operation.
 *
 * @component
 * @param {FeedbackModalProps} props - The props for the FeedbackModal component.
 * @param {boolean} props.isOpen - Determines whether the modal is visible.
 * @param {() => void} props.onClose - Callback function to close the modal.
 * @param {(feedback: { type: 'suggestion' | 'bug' | 'general'; message: string }) => void} props.onSave - Callback function to handle saving the feedback.
 *
 * @returns {JSX.Element | null} The rendered modal component if `isOpen` is true, otherwise null.
 *
 * @example
 * <FeedbackModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSave={handleSaveFeedback}
 * />
 */
const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useTranslation();
    const [type, setType] = useState<'suggestion' | 'bug' | 'general'>('suggestion');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSave({ type, message });
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
            // Reset form for next time
            setIsSubmitted(false);
            setMessage('');
            setType('suggestion');
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 id="feedback-title" className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{t('feedback_modal.title')}</h2>
                            <Tooltip text={t('tooltip.close')}>
                                <button type="button" onClick={onClose} className="p-2 -m-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label={t('tooltip.close')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </Tooltip>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="feedback-type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('feedback_modal.type_label')}</label>
                                <select 
                                    id="feedback-type" 
                                    value={type} 
                                    onChange={e => setType(e.target.value as any)}
                                    className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="suggestion">{t('feedback_modal.types.suggestion')}</option>
                                    <option value="bug">{t('feedback_modal.types.bug')}</option>
                                    <option value="general">{t('feedback_modal.types.general')}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="feedback-message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('feedback_modal.message_label')}</label>
                                <textarea
                                    id="feedback-message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={5}
                                    className="mt-1 block w-full rounded-md border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder={t('feedback_modal.message_placeholder')}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 flex justify-end rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-neutral-700 py-2 px-4 border border-neutral-300 dark:border-neutral-500 rounded-md shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">{t('user_profile.cancel_button')}</button>
                        <button
                            type="submit"
                            disabled={!message.trim() || isSubmitted}
                            className={`ml-3 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                                isSubmitted 
                                    ? 'bg-green-600' 
                                    : 'bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                            }`}
                        >
                            {isSubmitted ? (
                                <>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                {t('feedback_modal.submitted_message')}
                                </>
                            ) : (
                                t('feedback_modal.submit_button')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;