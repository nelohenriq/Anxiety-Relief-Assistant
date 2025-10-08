import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SymptomSelector from './SymptomSelector';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';

const crisisKeywords = [
    'suicide', 'kill myself', 'want to die', 'ending my life',
    'end it all', 'no reason to live', 'hopeless'
];

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

interface SymptomInputProps {
    symptoms: string;
    // FIX: Updated type to allow functional updates for state, fixing an error on line 123.
    setSymptoms: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onCrisisDetect: () => void;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ symptoms, setSymptoms, onSubmit, isLoading, onCrisisDetect }) => {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});


    useEffect(() => {
        const lowerCaseSymptoms = symptoms.toLowerCase();
        if (crisisKeywords.some(keyword => lowerCaseSymptoms.includes(keyword))) {
            onCrisisDetect();
        }
    }, [symptoms, onCrisisDetect]);

    const handleSymptomSelect = (symptom: string) => {
        const currentSymptoms = symptoms.trim();
        if (currentSymptoms.toLowerCase().includes(symptom.toLowerCase())) {
            return; 
        }

        const separator = currentSymptoms.length > 0 ? '. ' : '';
        const newSymptoms = `${currentSymptoms}${separator}${symptom}`;
        setSymptoms(newSymptoms);
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
                            setSymptoms(prev => (prev ? prev + ' ' : '') + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        stopRecording();
                    },
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
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, []);


    return (
        <form onSubmit={onSubmit} className="w-full space-y-6">
            <label htmlFor="symptoms-input" className="block text-xl font-medium text-neutral-700 dark:text-neutral-300 text-center">
                {t('symptom_input.title')}
            </label>
            <div className="relative w-full">
                <textarea
                    id="symptoms-input"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={t('symptom_input.placeholder')}
                    className="w-full h-32 p-4 pr-12 border border-neutral-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow duration-200 bg-white dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400"
                    disabled={isLoading}
                    aria-label={t('symptom_input.aria_label')}
                />
                 <button
                    type="button"
                    onClick={handleToggleRecording}
                    disabled={isLoading}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 ${isRecording ? 'bg-red-500/20 text-red-500' : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
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

            <SymptomSelector onSymptomSelect={handleSymptomSelect} selectedSymptoms={symptoms} />

            <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('symptom_input.loading_button')}
                    </>
                ) : (
                    t('symptom_input.submit_button')
                )}
            </button>
        </form>
    );
};

export default SymptomInput;