/**
 * LiveCoach component provides a real-time audio coaching interface.
 * Users can have live conversations with an AI coach using audio input and output.
 * The component supports audio recording, playback, and real-time conversation.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.searchQuery - A search query string used to filter the component's visibility.
 *
 * @returns {JSX.Element | null} The rendered LiveCoach component or null if the search query does not match.
 *
 * @example
 * <LiveCoach searchQuery="coach" />
 *
 * @remarks
 * - The component uses the `useTranslation` hook for internationalization.
 * - It integrates with audio recording and playback functionality.
 * - Real-time conversation with AI coach using audio.
 * - Supports both text and audio interaction modes.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { logInteraction } from '../services/interactionLogger';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useRealTimeAudio } from '../hooks/useRealTimeAudio';
import AudioControls from './AudioControls';
import AudioPlayer from './AudioPlayer';
import AudioVisualizer from './AudioVisualizer';
import RealTimeAudioVisualizer from './RealTimeAudioVisualizer';

interface ConversationMessage {
    id: string;
    type: 'user' | 'coach';
    content: string;
    audioUrl?: string;
    audioBlob?: Blob;
    timestamp: string;
    isAudio?: boolean;
}

const LiveCoach: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [coachAudioUrl, setCoachAudioUrl] = useState<string | null>(null);
    const [realTimeTranscript, setRealTimeTranscript] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    // Real-time audio for continuous listening
    const {
      isListening,
      isProcessing: isRealTimeProcessing,
      audioLevel,
      error: realTimeError,
      isSupported: realTimeSupported,
      startListening,
      stopListening,
      toggleListening,
    } = useRealTimeAudio(
      // Handle real-time audio data
      (audioData) => {
        // Process audio data for speech recognition (placeholder)
        // In a real implementation, this would send to speech recognition service
        console.log('Real-time audio data received:', audioData.length);
      },
      // Handle real-time transcription
      (transcript) => {
        setRealTimeTranscript(transcript);
      }
    );
  
    // Traditional recording for sending complete messages
    const {
      isRecording,
      audioUrl: userAudioUrl,
      audioBlob: userAudioBlob,
      startRecording,
      stopRecording,
      resetRecording,
    } = useAudioRecorder();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startSession = () => {
        logInteraction({ type: 'START_LIVE_COACH_SESSION' });
        setIsSessionActive(true);

        // Add welcome message from coach
        const welcomeMessage: ConversationMessage = {
            id: Date.now().toString(),
            type: 'coach',
            content: t('live_coach.welcome_message', 'Hello! I\'m your AI coach. How are you feeling today? You can speak to me or type your thoughts.'),
            timestamp: new Date().toISOString(),
            isAudio: false,
        };
        setMessages([welcomeMessage]);
    };

    const endSession = () => {
        setIsSessionActive(false);
        setMessages([]);
        setCurrentMessage('');
        resetRecording();
        logInteraction({ type: 'END_LIVE_COACH_SESSION' });
    };

    const sendTextMessage = async () => {
        if (!currentMessage.trim()) return;

        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date().toISOString(),
            isAudio: false,
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsProcessing(true);

        // Simulate AI coach response (replace with actual AI integration)
        setTimeout(() => {
            const coachResponse: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                type: 'coach',
                content: t('live_coach.ai_response', 'Thank you for sharing that with me. This is a simulated response. In a real implementation, this would be connected to an AI service that provides personalized coaching based on your input.'),
                timestamp: new Date().toISOString(),
                isAudio: false,
            };
            setMessages(prev => [...prev, coachResponse]);
            setIsProcessing(false);
        }, 2000);
    };

    const sendAudioMessage = () => {
        if (!userAudioUrl || !userAudioBlob) return;

        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: t('live_coach.audio_message', 'Audio message'),
            audioUrl: userAudioUrl,
            audioBlob: userAudioBlob,
            timestamp: new Date().toISOString(),
            isAudio: true,
        };

        setMessages(prev => [...prev, userMessage]);
        resetRecording();
        setIsProcessing(true);

        // Simulate AI coach audio response (replace with actual AI integration)
        setTimeout(() => {
            const coachResponse: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                type: 'coach',
                content: t('live_coach.audio_response', 'I received your audio message. This is a simulated audio response.'),
                timestamp: new Date().toISOString(),
                isAudio: false,
            };
            setMessages(prev => [...prev, coachResponse]);
            setIsProcessing(false);
        }, 3000);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const title = t('live_coach.title');
    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
    }

    if (!isSessionActive) {
        return (
            <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('live_coach.subtitle')}</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-lg shadow-sm text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                        {t('live_coach.ready_title', 'Ready for Live Coaching?')}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                        {t('live_coach.ready_description', 'Start a real-time audio conversation with your AI coach. Share your thoughts, feelings, and get personalized support.')}
                    </p>
                    <button
                        onClick={startSession}
                        className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-800 transition-colors"
                    >
                        {t('live_coach.start_session', 'Start Live Session')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">{t('live_coach.active_session', 'Active Session')}</p>
                </div>
                <button
                    onClick={endSession}
                    className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                    {t('live_coach.end_session', 'End Session')}
                </button>
            </div>

            {/* Conversation Area */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 h-96 overflow-y-auto border border-neutral-200 dark:border-neutral-700">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.type === 'user'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
                                }`}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium">
                                        {message.type === 'user' ? t('live_coach.you', 'You') : t('live_coach.coach', 'Coach')}
                                    </span>
                                    <span className="text-xs opacity-70">
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>

                                {message.isAudio && message.audioUrl ? (
                                    <div className="space-y-2">
                                        <AudioVisualizer
                                            isRecording={false}
                                            isPaused={false}
                                            audioUrl={message.audioUrl}
                                            height={25}
                                            barCount={10}
                                        />
                                        <AudioPlayer
                                            audioUrl={message.audioUrl}
                                            audioBlob={message.audioBlob}
                                            className="w-full"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        {t('live_coach.coach', 'Coach')}
                                    </span>
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" />
                                        <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {t('live_coach.thinking', 'Thinking...')}
                                </p>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
                {/* Text Input */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={t('live_coach.type_message', 'Type your message...')}
                        className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                        onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                    />
                    <button
                        onClick={sendTextMessage}
                        disabled={!currentMessage.trim() || isProcessing}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('live_coach.send', 'Send')}
                    </button>
                </div>

                {/* Audio Recording */}
                {/* Real-Time Audio Input Section */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {t('live_coach.voice_input', 'Voice Input')}
                        </h3>
                        <div className="flex items-center space-x-2">
                            {isListening && (
                                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span>{t('live_coach.listening', 'Listening...')}</span>
                                </div>
                            )}
                            {realTimeError && (
                                <div className="text-sm text-red-600 dark:text-red-400">
                                    {realTimeError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Real-Time Audio Visualization */}
                    <div className="mb-4">
                        <RealTimeAudioVisualizer
                            isListening={isListening}
                            audioLevel={audioLevel}
                            width={300}
                            height={50}
                            barCount={20}
                        />
                    </div>

                    {/* Real-Time Audio Controls */}
                    <div className="flex items-center space-x-2 mb-3">
                        {!realTimeSupported ? (
                            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
                                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Real-time voice input not supported - using traditional recording
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={toggleListening}
                                disabled={!isSessionActive}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isListening
                                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                                        : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-neutral-400'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                <span>
                                    {isListening ? t('live_coach.stop_listening', 'Stop Listening') : t('live_coach.start_listening', 'Start Listening')}
                                </span>
                            </button>
                        )}

                        {/* Traditional Recording for Complete Messages */}
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="flex items-center space-x-2 px-3 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                                title="Record complete message"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{t('live_coach.record_message', 'Record')}</span>
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{t('live_coach.stop_recording', 'Stop')}</span>
                            </button>
                        )}

                        {userAudioUrl && !isRecording && (
                            <button
                                onClick={sendAudioMessage}
                                disabled={isProcessing}
                                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{t('live_coach.send_audio', 'Send')}</span>
                            </button>
                        )}
                    </div>

                    {/* Real-Time Status */}
                    {isListening && (
                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${audioLevel > 0.2 ? 'bg-green-500 animate-pulse' : 'bg-green-300'}`} />
                                    <div className={`w-2 h-2 rounded-full ${audioLevel > 0.4 ? 'bg-green-500 animate-pulse' : 'bg-green-300'}`} style={{ animationDelay: '0.2s' }} />
                                    <div className={`w-2 h-2 rounded-full ${audioLevel > 0.6 ? 'bg-green-500 animate-pulse' : 'bg-green-300'}`} style={{ animationDelay: '0.4s' }} />
                                </div>
                                <span className="text-sm text-green-800 dark:text-green-200">
                                    {isRealTimeProcessing
                                        ? t('live_coach.processing_speech', 'Processing your speech...')
                                        : t('live_coach.speak_now', 'Speak now - listening for your voice')
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Traditional Audio Recording Preview */}
                    {userAudioUrl && !isRecording && (
                        <div className="mt-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            <div className="mb-2">
                                <AudioVisualizer
                                    isRecording={false}
                                    isPaused={false}
                                    audioUrl={userAudioUrl}
                                    height={25}
                                    barCount={10}
                                />
                            </div>
                            <AudioPlayer
                                audioUrl={userAudioUrl}
                                audioBlob={userAudioBlob || undefined}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveCoach;