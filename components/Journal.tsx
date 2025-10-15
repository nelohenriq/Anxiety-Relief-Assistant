/**
 * A React functional component that represents a journal interface.
 * It allows users to create, save, and view journal entries. The component
 * supports filtering entries based on a search query and provides a confirmation
 * message upon saving a new entry.
 *
 * @component
 * @param {JournalProps} props - The props for the Journal component.
 * @param {string} props.searchQuery - The search query used to filter journal entries.
 *
 * @returns {JSX.Element} The rendered Journal component.
 *
 * @remarks
 * - The component uses `useLocalStorage` to persist journal entries in local storage.
 * - It supports internationalization via the `useTranslation` hook.
 * - The `logInteraction` function is used to log user interactions when saving entries.
 * - The component displays a maximum of 3 recent entries and filters them based on the search query.
 *
 * @example
 * ```tsx
 * <Journal searchQuery="example" />
 * ```
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '../hooks/useLocalStorage';
import { JournalEntry } from '../types';
import JournalEntryCard from './JournalEntryCard';
import { logInteraction } from '../services/interactionLogger';
import AudioControls from './AudioControls';
import AudioPlayer from './AudioPlayer';
import AudioVisualizer from './AudioVisualizer';


interface JournalProps {
    searchQuery: string;
}

const Journal: React.FC<JournalProps> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
    const [newEntry, setNewEntry] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [showAudioControls, setShowAudioControls] = useState(false);

    const handleSave = () => {
        const hasText = newEntry.trim();
        const hasAudio = audioBlob && audioUrl;

        if (!hasText && !hasAudio) return;

        logInteraction({
            type: 'SAVE_JOURNAL_ENTRY',
            metadata: {
                entry_length: newEntry.trim().length,
                has_audio: !!hasAudio,
                audio_duration: audioDuration
            }
        });

        const entry: JournalEntry = {
            id: Date.now().toString(),
            text: newEntry,
            timestamp: new Date().toISOString(),
            audioBlob: audioBlob || undefined,
            audioUrl: audioUrl || undefined,
            audioDuration: audioDuration > 0 ? audioDuration : undefined,
        };

        setEntries([entry, ...entries]); // Prepend new entry
        setNewEntry('');
        setAudioBlob(null);
        setAudioUrl(null);
        setAudioDuration(0);
        setShowAudioControls(false);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 2000);
    };

    const handleRecordingComplete = (recordedBlob: Blob, recordedUrl: string, duration: number) => {
        setAudioBlob(recordedBlob);
        setAudioUrl(recordedUrl);
        setAudioDuration(duration);
    };

    const handleStartAudioRecording = () => {
        setShowAudioControls(true);
    };



    const filteredEntries = entries.filter(entry =>
        entry.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('journal.title')}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('journal.subtitle')}</p>
            </div>
            <div className="space-y-4">
                <div className="w-full">
                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder={t('journal.placeholder')}
                        className="w-full h-40 p-4 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
                        aria-label="Journal entry input"
                    />
                </div>

                {/* Audio Recording Section */}
                {showAudioControls && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
                                Audio Recording
                            </h3>
                            <button
                                onClick={() => setShowAudioControls(false)}
                                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <AudioControls onRecordingComplete={handleRecordingComplete} />

                        {audioUrl && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Recording Preview
                                </h4>
                                <AudioPlayer
                                    audioUrl={audioUrl}
                                    audioBlob={audioBlob || undefined}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Audio Visualizer for existing recordings */}
                {audioUrl && !showAudioControls && (
                    <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Audio Journal Entry
                            </span>
                            <button
                                onClick={() => setShowAudioControls(true)}
                                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                                Edit Recording
                            </button>
                        </div>
                        <AudioVisualizer
                            isRecording={false}
                            isPaused={false}
                            audioUrl={audioUrl}
                            height={30}
                            barCount={15}
                        />
                        <AudioPlayer
                            audioUrl={audioUrl}
                            audioBlob={audioBlob || undefined}
                            className="mt-2"
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={handleStartAudioRecording}
                        className="flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        title="Record audio journal entry"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Record Audio
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={(!newEntry.trim() && !audioBlob) || showConfirmation}
                        className={`flex-1 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-200
                            ${showConfirmation
                                ? 'bg-green-600'
                                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed'
                            }`
                        }
                    >
                        {showConfirmation ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t('journal.saved_button')}
                            </>
                        ) : (
                            t('journal.save_button')
                        )}
                    </button>
                </div>
            </div>

            {entries.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                     <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 text-center">{t('journal.past_entries_title')}</h3>
                    {filteredEntries.slice(0, 3).map(entry => ( // Show recent 3 entries
                        <JournalEntryCard key={entry.id} entry={entry} />
                    ))}
                    {filteredEntries.length === 0 && searchQuery && (
                         <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No journal entries match your search.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Journal;