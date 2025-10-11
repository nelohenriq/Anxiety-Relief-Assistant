import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathingExercise } from '../types';
import Tooltip from './Tooltip';

interface BreathingVisualizerProps {
    exercise: BreathingExercise;
    onClose: () => void;
}

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A React functional component that visualizes a breathing exercise.
 * It animates a circular progress indicator and provides visual and textual
 * cues for each step of the exercise (e.g., inhale, exhale, hold).
 *
 * @component
 * @param {BreathingVisualizerProps} props - The props for the component.
 * @param {Object} props.exercise - The breathing exercise data.
 * @param {Array} props.exercise.steps - The steps of the exercise, each containing
 * a `type` (e.g., "inhale", "exhale", "hold"), `duration` (in seconds), and `label`.
 * @param {string} props.exercise.name - The name of the breathing exercise.
 * @param {Function} props.onClose - Callback function triggered when the close button is clicked.
 *
 * @returns {JSX.Element} The rendered BreathingVisualizer component.
 *
 * @remarks
 * - The component uses `useEffect` hooks to manage animations, step progression,
 * and countdown timers.
 * - The circular progress indicator is animated using CSS keyframes.
 * - Tooltips are displayed to provide additional context for each step.
 * - The component is styled using Tailwind CSS classes.
 *
 * @example
 * ```tsx
 * const exercise = {
 *   name: "Relaxing Breath",
 *   steps: [
 *     { type: "inhale", duration: 4, label: "Inhale" },
 *     { type: "hold", duration: 7, label: "Hold" },
 *     { type: "exhale", duration: 8, label: "Exhale" },
 *   ],
 * };
 *
 * <BreathingVisualizer exercise={exercise} onClose={() => console.log('Closed')} />
 * ```
 */
const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({ exercise, onClose }) => {
    const { t } = useTranslation();
    const { steps } = exercise;
    const [stepIndex, setStepIndex] = useState(0);
    const [countdown, setCountdown] = useState(steps[0].duration);
    const [scaleClass, setScaleClass] = useState('scale-75');
    const [tooltipText, setTooltipText] = useState('');

    // Inject animation styles into the head
    useEffect(() => {
        const styleId = 'progress-circle-animation';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes progress-circle {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    // Effect for managing the exercise cycle (step progression)
    useEffect(() => {
        const currentDuration = steps[stepIndex].duration * 1000;
        const timer = setTimeout(() => {
            setStepIndex((prevIndex) => (prevIndex + 1) % steps.length);
        }, currentDuration);
        return () => clearTimeout(timer);
    }, [stepIndex, steps]);

    // Effect for updating animation, countdown display, and tooltip when step changes
    useEffect(() => {
        setCountdown(Math.ceil(steps[stepIndex].duration));
        const currentStepType = steps[stepIndex].type;

        if (currentStepType === 'inhale') {
            setScaleClass('scale-125');
            setTooltipText(t('breathing_visualizer_tooltips.inhale'));
        } else if (currentStepType === 'exhale') {
            setScaleClass('scale-75');
            setTooltipText(t('breathing_visualizer_tooltips.exhale'));
        } else if (currentStepType === 'hold') {
             setTooltipText(t('breathing_visualizer_tooltips.hold'));
        }
        // For 'Hold', the scale class remains unchanged from the previous step
    }, [stepIndex, steps, t]);
    
    // Effect for the 1-second countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const animationDuration = steps[stepIndex].duration;
    const currentStepLabel = steps[stepIndex].label;

    return (
        <div className="w-full p-6 bg-white dark:bg-neutral-800/50 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 text-center flex flex-col items-center justify-center relative h-96">
            <div className="absolute top-4 right-4">
                <Tooltip text={t('tooltip.close')}>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full p-1" aria-label={t('breathing_visualizer.close_aria_label')}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </Tooltip>
            </div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-4">{exercise.name}</h3>
            <Tooltip text={tooltipText} position="bottom">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        <circle
                            cx="100"
                            cy="100"
                            r={RADIUS}
                            strokeWidth="8"
                            className="stroke-current text-primary-200/60 dark:text-primary-800/50"
                            fill="transparent"
                        />
                        <circle
                            key={stepIndex} // This key change resets the animation on each step
                            cx="100"
                            cy="100"
                            r={RADIUS}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="stroke-current text-primary-500"
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            style={{
                                strokeDashoffset: CIRCUMFERENCE,
                                animation: `progress-circle ${animationDuration}s linear forwards`
                            }}
                        />
                    </svg>
                    <div
                        className={`absolute w-[160px] h-[160px] bg-primary-200 dark:bg-primary-800/50 rounded-full transition-transform ease-in-out ${scaleClass}`}
                        style={{ transitionDuration: `${animationDuration}s` }}
                    ></div>
                    <div className="relative z-10 text-center">
                        <p className="text-2xl font-semibold text-primary-800 dark:text-primary-200">{currentStepLabel}</p>
                        <p className="text-5xl font-bold text-primary-900 dark:text-primary-50">{countdown}</p>
                    </div>
                </div>
            </Tooltip>
            <p className="mt-6 text-neutral-500 dark:text-neutral-400">{t('breathing_visualizer.instruction')}</p>
        </div>
    );
};

export default BreathingVisualizer;