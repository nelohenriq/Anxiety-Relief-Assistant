import React from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AudioControlsProps {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string, duration: number) => void;
  disabled?: boolean;
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  onRecordingComplete,
  disabled = false,
  className = ''
}) => {
  const {
    isRecording,
    isPaused,
    duration,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecorder();

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStopRecording = () => {
    stopRecording();
    // The audio blob and URL will be available after recording stops
    setTimeout(() => {
      // Access the audio data from the hook after it's been set
      if (onRecordingComplete) {
        // We'll need to modify the hook to expose these values or use a ref
        onRecordingComplete(new Blob(), '', duration);
      }
    }, 100);
  };

  // Check if audio recording is supported
  const recordingSupported = typeof MediaRecorder !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices;

  if (!recordingSupported) {
    return (
      <div className={`flex flex-col items-center space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
        <div className="text-center text-neutral-500 dark:text-neutral-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm mb-2">Audio recording is not supported in this browser</p>
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            <p>For the best experience, use:</p>
            <div className="flex justify-center space-x-2 mt-1">
              <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">Chrome</span>
              <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">Firefox</span>
              <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded">Edge</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Recording Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
        </span>
      </div>

      {/* Duration Display */}
      {isRecording && (
        <div className="text-lg font-mono text-neutral-800 dark:text-neutral-200">
          {formatDuration(duration)}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Start recording"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Start Recording</span>
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              title={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isPaused ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleStopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
              title="Stop recording"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Stop</span>
            </button>

            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-500 hover:bg-neutral-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
              title="Reset recording"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Reset</span>
            </button>
          </>
        )}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex space-x-1">
            <div className={`w-2 h-4 bg-red-500 ${isRecording && !isPaused ? 'animate-pulse' : ''}`} />
            <div className={`w-2 h-4 bg-red-500 ${isRecording && !isPaused ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }} />
            <div className={`w-2 h-4 bg-red-500 ${isRecording && !isPaused ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.4s' }} />
          </div>
          <span>Recording in progress...</span>
        </div>
      )}
    </div>
  );
};

export default AudioControls;