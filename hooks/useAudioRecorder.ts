import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  downloadRecording: () => void;
}

export const useAudioRecorder = (): AudioRecorderState & AudioRecorderControls => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser. Please try using a modern browser like Chrome, Firefox, or Edge.');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Try different MIME types in order of preference and compatibility
      const supportedTypes = [
        'audio/wav',
        'audio/mp4',
        'audio/webm',
        'audio/webm;codecs=pcm',
      ];

      let mimeType = '';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log(`Using audio format: ${type}`);
          break;
        }
      }

      // If no supported types found, try without specifying MIME type
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      // Log the actual format being used for debugging
      if (mediaRecorder.mimeType) {
        console.log(`MediaRecorder using MIME type: ${mediaRecorder.mimeType}`);
      } else {
        console.log('MediaRecorder using default format');
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          // Use the actual MIME type from the MediaRecorder
          const mimeType = mediaRecorder.mimeType || 'audio/wav';
          const blob = new Blob(chunksRef.current, { type: mimeType });

          console.log(`Created audio blob with MIME type: ${mimeType}, size: ${blob.size} bytes`);

          // Validate that the audio can be played (basic check)
          const audio = new Audio();
          const objectUrl = URL.createObjectURL(blob);

          const validationTimeout = setTimeout(() => {
            console.warn('Audio validation timeout - proceeding anyway');
            setAudioBlob(blob);
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
            }
            setAudioUrl(objectUrl);
          }, 1000);

          audio.addEventListener('loadedmetadata', () => {
            clearTimeout(validationTimeout);
            console.log(`Audio validation successful - duration: ${audio.duration}s`);
            setAudioBlob(blob);
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
            }
            setAudioUrl(objectUrl);
          });

          audio.addEventListener('error', (e) => {
            clearTimeout(validationTimeout);
            console.error('Audio validation failed:', audio.error?.message || 'Unknown error');
            URL.revokeObjectURL(objectUrl);
            setError(`Audio format not supported by this browser. Please try using Chrome, Firefox, or Edge.`);
          });

          audio.src = objectUrl;
        } catch (error) {
          console.error('Error creating audio blob:', error);
          setError('Failed to create audio recording. Please try again.');
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Track duration
      startTimeRef.current = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      console.error('Error starting recording:', err);
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsRecording(false);
      setIsPaused(false);

      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      // Pause duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume duration tracking
      startTimeRef.current = Date.now() - duration;
      durationIntervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);
    }
  }, [isRecording, isPaused, duration]);

  const resetRecording = useCallback(() => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Clean up media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear state
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);

    // Revoke object URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setError(null);
    chunksRef.current = [];
  }, [isRecording, audioUrl, stopRecording]);

  const downloadRecording = useCallback(() => {
    if (audioBlob && audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [audioBlob, audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetRecording();
    };
  }, [resetRecording]);

  return {
    // State
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,

    // Controls
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    downloadRecording,
  };
};