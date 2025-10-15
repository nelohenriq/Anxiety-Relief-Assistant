import { useState, useRef, useCallback, useEffect } from 'react';

export interface RealTimeAudioState {
  isListening: boolean;
  isProcessing: boolean;
  audioLevel: number;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export interface RealTimeAudioControls {
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
}

// AudioWorkletProcessor code as a string
const audioWorkletCode = `
class RealTimeAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastVoiceTime = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputData = input[0];

    // Calculate audio level
    let sum = 0;
    for (let i = 0; i < inputData.length; i++) {
      sum += Math.abs(inputData[i]);
    }
    const average = sum / inputData.length;

    // Voice activity detection
    const now = currentTime;
    if (average > 0.01) {
      this.lastVoiceTime = now;
      this.port.postMessage({ type: 'voice_detected', volume: average, timestamp: now });
    }

    // Send audio data for processing
    this.port.postMessage({
      type: 'audio_data',
      audioData: inputData.slice(),
      volume: average,
      timestamp: now
    });

    return true;
  }
}

registerProcessor('real-time-audio-processor', RealTimeAudioProcessor);
`;

export const useRealTimeAudio = (
  onAudioData?: (audioData: Float32Array) => void,
  onTranscript?: (transcript: string) => void
): RealTimeAudioState & RealTimeAudioControls => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const workletLoadedRef = useRef(false);

  // Check if real-time audio is supported
  const isSupported = typeof AudioContext !== 'undefined' &&
                     typeof AudioWorkletNode !== 'undefined' &&
                     typeof navigator !== 'undefined' &&
                     !!navigator.mediaDevices;

  const calculateAudioLevel = useCallback((analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

    setAudioLevel(normalizedLevel);

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(() => calculateAudioLevel(analyser));
    }
  }, [isListening]);

  // Load AudioWorklet module
  const loadAudioWorklet = useCallback(async (audioContext: AudioContext) => {
    if (workletLoadedRef.current) return;

    try {
      // Convert the worklet code to a blob URL
      const blob = new Blob([audioWorkletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);

      await audioContext.audioWorklet.addModule(workletUrl);

      // Clean up the blob URL
      URL.revokeObjectURL(workletUrl);

      workletLoadedRef.current = true;
      console.log('AudioWorklet loaded successfully');
    } catch (err) {
      console.error('Failed to load AudioWorklet:', err);
      throw new Error('AudioWorklet not supported in this browser');
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Real-time audio is not supported in this browser');
      return;
    }

    try {
      setError(null);
      setTranscript('');

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Load AudioWorklet
      await loadAudioWorklet(audioContext);

      // Create analyser node for real-time visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create microphone input
      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;

      // Create AudioWorkletNode
      const workletNode = new AudioWorkletNode(audioContext, 'real-time-audio-processor');
      workletNodeRef.current = workletNode;

      // Handle messages from AudioWorklet
      workletNode.port.onmessage = (event) => {
        const { type, audioData, volume, timestamp } = event.data;

        if (type === 'audio_data' && audioData) {
          // Send audio data to callback
          onAudioData?.(new Float32Array(audioData));

          // Voice activity detection
          if (volume > 0.01) {
            setIsProcessing(true);

            // Simulate real-time processing feedback
            setTimeout(() => {
              setIsProcessing(false);
            }, 300);
          }
        }
      };

      // Connect nodes: microphone -> analyser -> worklet
      microphone.connect(analyser);
      analyser.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsListening(true);

      // Start audio level monitoring
      calculateAudioLevel(analyser);

    } catch (err) {
      console.error('Error starting real-time audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to start real-time audio');
    }
  }, [isSupported, isListening, calculateAudioLevel, onAudioData, loadAudioWorklet]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setIsProcessing(false);
    setAudioLevel(0);

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Close audio nodes
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    workletLoadedRef.current = false;
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    // State
    isListening,
    isProcessing,
    audioLevel,
    transcript,
    error,
    isSupported,

    // Controls
    startListening,
    stopListening,
    toggleListening,
  };
};