import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  audioBlob?: Blob;
  className?: string;
  showDownload?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioBlob,
  className = '',
  showDownload = true,
  onPlay,
  onPause,
  onEnd,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnd?.();
    };

    const handleError = () => {
      console.error('Audio element error:', audio.error);
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error('Audio format not supported by this browser');
            setError('Audio format not supported. Try recording again or use a different browser.');
            break;
          case MediaError.MEDIA_ERR_DECODE:
            console.error('Audio decode error - format may be corrupted');
            setError('Audio recording may be corrupted. Please try recording again.');
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            console.error('Network error loading audio');
            break;
          default:
            console.error('Unknown audio error');
            setError('Unable to play audio. Please try recording again.');
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onEnd, audioUrl]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Check if audio has a valid source
      if (!audio.src && !audioUrl) {
        console.error('No audio source available');
        return;
      }

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await audio.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Error playing audio:', error);

      // Handle specific error types
      if (error instanceof DOMException) {
        if (error.name === 'NotSupportedError') {
          console.error('Audio format not supported by this browser');
          // Try to convert blob to a different format or show error message
        } else if (error.name === 'NotAllowedError') {
          console.error('Audio playback was prevented by browser policy');
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (audioBlob && audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Check if audio is supported
  const audioSupported = typeof Audio !== 'undefined' && audioUrl;

  if (!audioSupported) {
    return (
      <div className={`flex flex-col space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
        <div className="text-center text-neutral-500 dark:text-neutral-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm mb-2">Audio playback is not supported in this browser</p>
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
    <div className={`flex flex-col space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Error Display */}
      {error && (
        <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!!error}
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>

      {/* Time Display and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.29 13.41a1 1 0 00-.29-.41H2a1 1 0 01-1-1V7a1 1 0 011-1h1.586a1 1 0 00.586-.41l4.29-3.41a1 1 0 01.617-.816zm8.69 5.841a1 1 0 00-1.386.083l-3 3a1 1 0 001.386 1.414l3-3a1 1 0 00.083-1.386l-1 1a1 1 0 00-.083-.111zm-9.5 0a1 1 0 011.386-.083l3 3a1 1 0 01-1.386 1.414l-3-3a1 1 0 01-.083-1.386l1-1a1 1 0 01.083-.111z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Download Button */}
          {showDownload && audioBlob && (
            <button
              onClick={downloadAudio}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-neutral-600 hover:bg-neutral-700 text-white rounded transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500"
              title="Download audio"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;