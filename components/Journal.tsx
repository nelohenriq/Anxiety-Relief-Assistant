import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '../hooks/useLocalStorage';
import { JournalEntry } from '../types';
import JournalEntryCard from './JournalEntryCard';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';

// --- Audio Helper Functions for Gemini Live API ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAI_Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


interface JournalProps {
    searchQuery: string;
}

const Journal: React.FC<JournalProps> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
    const [newEntry, setNewEntry] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const handleSave = () => {
        if (!newEntry.trim()) return;

        const entry: JournalEntry = {
            id: Date.now().toString(),
            text: newEntry,
            timestamp: new Date().toISOString(),
        };

        setEntries([entry, ...entries]); // Prepend new entry
        setNewEntry('');
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 2000);
    };

    const stopRecording = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close().catch(console.error);
        }
        sessionPromiseRef.current = null;
        inputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        streamRef.current = null;
        setIsRecording(false);
    };

    const startRecording = async () => {
        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!inputAudioContextRef.current || !streamRef.current) return;
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setNewEntry(prev => (prev ? prev + ' ' : '') + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => { console.error('Session error:', e); stopRecording(); },
                    onclose: () => {},
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });
        } catch (error) {
            console.error("Failed to start recording:", error);
            setIsRecording(false);
        }
    };
    
    const handleToggleRecording = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    useEffect(() => {
        return () => { if (isRecording) stopRecording(); };
    }, []);


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
                 <div className="relative w-full">
                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        placeholder={t('journal.placeholder')}
                        className="w-full h-40 p-4 pr-12 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
                        aria-label="Journal entry input"
                    />
                     <button
                        type="button"
                        onClick={handleToggleRecording}
                        className={`absolute right-3 top-3 p-2 rounded-full transition-colors duration-200 ${isRecording ? 'bg-red-500/20 text-red-500' : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                    >
                        {isRecording ? (
                            <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!newEntry.trim() || showConfirmation}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-200
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