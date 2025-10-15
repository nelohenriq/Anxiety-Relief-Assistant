import React, { useRef, useEffect } from 'react';

interface RealTimeAudioVisualizerProps {
  isListening: boolean;
  audioLevel: number;
  className?: string;
  width?: number;
  height?: number;
  barCount?: number;
}

const RealTimeAudioVisualizer: React.FC<RealTimeAudioVisualizerProps> = ({
  isListening,
  audioLevel,
  className = '',
  width = 200,
  height = 40,
  barCount = 15,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>([]);

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

      if (!isListening) {
        // Draw inactive state
        barsRef.current = Array.from({ length: barCount }, () => 0.1);
      } else {
        // Update bars based on audio level
        barsRef.current = barsRef.current.map((bar, index) => {
          // Create wave-like animation
          const wave = Math.sin((Date.now() * 0.005) + (index * 0.5)) * 0.3 + 0.7;
          return Math.max(0.1, Math.min(1, audioLevel * wave + 0.1));
        });
      }

      // Draw bars
      const barWidth = width / barCount;
      const barSpacing = barWidth * 0.2;

      barsRef.current.forEach((barHeight, index) => {
        const x = index * barWidth + barSpacing / 2;
        const y = height - (barHeight * height);
        const barH = barHeight * height;

        // Create gradient based on state
        const gradient = ctx.createLinearGradient(0, y, 0, height);

        if (isListening) {
          // Active listening state - green to blue gradient
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#1e40af');
        } else {
          // Inactive state - gray gradient
          gradient.addColorStop(0, '#6b7280');
          gradient.addColorStop(1, '#4b5563');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - barSpacing, barH);

        // Add glow effect for active state
        if (isListening && audioLevel > 0.3) {
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fillRect(x, y, barWidth - barSpacing, barH);
          ctx.shadowBlur = 0;
        }
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [isListening, audioLevel, width, height, barCount]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className={`rounded transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-60'}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />

      {/* Voice activity indicator */}
      {isListening && audioLevel > 0.2 && (
        <div className="absolute flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Listening...
          </span>
        </div>
      )}
    </div>
  );
};

export default RealTimeAudioVisualizer;