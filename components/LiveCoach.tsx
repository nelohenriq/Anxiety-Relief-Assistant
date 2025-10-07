import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import Tooltip from './Tooltip';
import { logInteraction } from '../services/interactionLogger';

// --- Audio Helper Functions from @google/genai guidelines ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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

// --- Component ---

interface Transcript {
    id: number;
    speaker: 'user' | 'coach';
    text: string;
}

const LiveCoach: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    
    // Mutable references for audio contexts, nodes, and session state
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const handleStartSession = () => {
        logInteraction({ type: 'START_LIVE_COACH_SESSION' });
        setStatus('connecting');
        setIsSessionActive(true);
    };

    const handleEndSession = () => {
        logInteraction({ type: 'END_LIVE_COACH_SESSION' });
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        }
        // Cleanup function will handle the rest
        setIsSessionActive(false);
    };

    useEffect(() => {
        if (!isSessionActive) {
            // Cleanup previous session
            if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
            if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
            if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close().catch(console.error);
            if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close().catch(console.error);
            
            scriptProcessorRef.current = null;
            mediaStreamSourceRef.current = null;
            inputAudioContextRef.current = null;
            outputAudioContextRef.current = null;
            sessionPromiseRef.current = null;
            
            setStatus('idle');
            setTranscripts([]);
            return;
        }

        let stream: MediaStream | null = null;
        
        const setupSession = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                console.error("Microphone access denied", e);
                setStatus('error');
                setIsSessionActive(false);
                return;
            }

            // --- Initialize Audio Contexts ---
            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });
            outputNodeRef.current = outputAudioContextRef.current.createGain();

            // --- Connect to Gemini Live API ---
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!inputAudioContextRef.current || !stream) return;
                        setStatus('listening');
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
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
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputRef.current.trim();
                            const coachInput = currentOutputRef.current.trim();
                            
                            // FIX: Explicitly create new transcript entries with the correct type to resolve TypeScript error.
                            if (userInput || coachInput) {
                                setTranscripts(prev => {
                                    const newEntries: Transcript[] = [];
                                    const now = Date.now();
                                    if (userInput) {
                                        newEntries.push({ id: now, speaker: 'user', text: userInput });
                                    }
                                    if (coachInput) {
                                        newEntries.push({ id: now + 1, speaker: 'coach', text: coachInput });
                                    }
                                    return [...prev, ...newEntries];
                                });
                            }
                            
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                            setStatus('listening');
                        }

                        // Handle audio output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
                            setStatus('speaking');
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNodeRef.current);
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) {
                                    setStatus('listening');
                                }
                            });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                    },
                    onclose: () => {
                       // Handled by handleEndSession
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are Serene, a calm, compassionate, and supportive mindfulness coach. Your voice should be gentle and soothing. Your goal is to help the user feel grounded and safe in the present moment. Listen attentively to what they say. Guide them with short, simple prompts. You can suggest gentle breathing exercises, grounding techniques, or simply provide a space for them to talk. Keep your responses concise and reassuring. Do not provide medical advice. Start the conversation by gently greeting the user and asking how you can support them right now. Your responses must be in the following language: ${i18n.language}`
                },
            });
        };
        
        setupSession();
        
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };

    }, [isSessionActive, i18n.language]);
    

    const title = t('live_coach.title');
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    const renderStatusIndicator = () => {
        let text = '';
        switch(status) {
            case 'connecting': text = t('live_coach.status_connecting'); break;
            case 'listening': text = t('live_coach.status_listening'); break;
            case 'speaking': text = t('live_coach.status_speaking'); break;
            case 'error': text = t('live_coach.status_error'); break;
            default: return null;
        }
        return <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-2">{text}</p>;
    }
    
    // --- Render Logic ---
    if (!isSessionActive) {
        return (
            <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('live_coach.subtitle')}</p>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-900/70 p-4 rounded-lg shadow-sm flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600 dark:text-primary-400 mb-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm mt-2 text-center flex-grow">{t('live_coach.description')}</p>
                    <button onClick={handleStartSession} className="mt-4 w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors">
                        {t('live_coach.start_button')}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                <Tooltip text={t('tooltip.close')}>
                     <button onClick={handleEndSession} className="p-2 -m-2 rounded-full text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600" aria-label="Close session">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </Tooltip>
            </div>
            
            {/* Visualizer */}
            <div className="relative h-32 flex items-center justify-center">
                <div className={`absolute w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/50 transition-all duration-500 ${status === 'speaking' ? 'animate-ping opacity-75' : ''}`}></div>
                <div className={`absolute w-24 h-24 rounded-full bg-primary-200 dark:bg-primary-800/50 transition-all duration-300 ${status === 'listening' ? 'animate-pulse' : ''}`}></div>
                 <div className="w-20 h-20 rounded-full bg-primary-300 dark:bg-primary-700/80 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-800 dark:text-primary-100" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                </div>
            </div>
            {renderStatusIndicator()}
            
            {/* Transcripts */}
            <div className="h-40 bg-neutral-100 dark:bg-neutral-900/70 rounded-lg p-3 overflow-y-auto space-y-2 text-sm">
                {transcripts.map(t => (
                    <div key={t.id}>
                       <span className={`font-bold ${t.speaker === 'user' ? 'text-accent-600' : 'text-primary-700 dark:text-primary-300'}`}>
                           {t.speaker === 'user' ? 'You: ' : 'Coach: '}
                       </span>
                        <span className="text-neutral-700 dark:text-neutral-300">{t.text}</span>
                    </div>
                ))}
            </div>
            
            <button onClick={handleEndSession} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-neutral-800 transition-colors">
                {t('live_coach.end_button')}
            </button>
        </div>
    );
};

export default LiveCoach;