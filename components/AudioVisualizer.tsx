import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  isPaused: boolean;
  audioUrl?: string | null;
  className?: string;
  width?: number;
  height?: number;
  barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  isPaused,
  audioUrl,
  className = '',
  width = 200,
  height = 40,
  barCount = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>([]);

  // Generate random bar heights for recording visualization
  const generateRecordingBars = () => {
    if (!isRecording || isPaused) return;

    barsRef.current = barsRef.current.map(() =>
      Math.random() * 0.6 + 0.2 // Random height between 0.2 and 0.8
    );
  };

  // Create static bars for recorded audio (placeholder)
  const generateStaticBars = () => {
    barsRef.current = Array.from({ length: barCount }, () =>
      Math.random() * 0.8 + 0.1 // Varied heights for visual interest
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (isRecording && !isPaused) {
        // Generate new bar heights for live recording
        generateRecordingBars();
      } else if (audioUrl && barsRef.current.length === 0) {
        // Generate static bars for recorded audio
        generateStaticBars();
      }

      // Draw bars
      const barWidth = width / barCount;
      const barSpacing = barWidth * 0.2;

      barsRef.current.forEach((barHeight, index) => {
        const x = index * barWidth + barSpacing / 2;
        const y = height - (barHeight * height);
        const barH = barHeight * height;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        if (isRecording && !isPaused) {
          gradient.addColorStop(0, '#ef4444');
          gradient.addColorStop(1, '#dc2626');
        } else {
          gradient.addColorStop(0, '#6b7280');
          gradient.addColorStop(1, '#4b5563');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - barSpacing, barH);
      });

      if (isRecording && !isPaused) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused, audioUrl, width, height, barCount]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="rounded"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};

export default AudioVisualizer;