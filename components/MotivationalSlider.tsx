import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';

/**
 * A React functional component that displays a motivational quote slider.
 * The component fetches quotes from an API and cycles through them with a fade-in/out animation.
 *
 * Features:
 * - Fetches motivational quotes from a backend API using user-specific settings.
 * - Displays one quote at a time, transitioning between quotes every 7 seconds.
 * - Handles fade-in and fade-out animations for smooth transitions.
 * - Adapts to the user's language preference using the `i18n` context.
 * - Ensures layout stability by reserving space when no quotes are available.
 *
 * Dependencies:
 * - `useTranslation` for language support.
 * - `useUser` for retrieving user-specific settings like LLM provider, model, and API key.
 * - `useState` and `useEffect` for managing state and side effects.
 *
 * @component
 * @returns {JSX.Element} The rendered motivational slider component.
 */
const MotivationalSlider: React.FC = () => {
    const { i18n } = useTranslation();
    const { llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey } = useUser();
    const [quotes, setQuotes] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: llmProvider,
                        model: llmProvider === 'groq' ? groqModel : ollamaModel,
                        apiKey: llmProvider === 'groq' ? groqApiKey : ollamaCloudApiKey,
                        language: i18n.language,
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch quotes');
                }
                const data = await response.json();
                setQuotes(data.quotes);
            } catch (error) {
                console.error("Failed to fetch motivational quotes:", error);
                // Silently fail, don't show an error message on the hero screen.
            }
        };
        fetchQuotes();
    }, [i18n.language, llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey]);
    
    useEffect(() => {
        if (quotes.length > 1) {
            const interval = setInterval(() => {
                setIsFading(true);
                setTimeout(() => {
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
                    setIsFading(false);
                }, 500); // CSS transition duration
            }, 7000); // Change quote every 7 seconds

            return () => clearInterval(interval);
        }
    }, [quotes.length]);

    if (quotes.length === 0) {
        return <div className="h-12"></div>; // Reserve space to prevent layout shift
    }

    return (
        <div className="h-12 flex items-center justify-center">
            <p className={`text-center text-neutral-600 dark:text-neutral-300 italic transition-all duration-500 ${isFading ? 'opacity-0' : 'opacity-100'} [text-shadow:0_0_10px_var(--tw-shadow-color)] shadow-primary-500/30 dark:shadow-primary-400/40`}>
                "{quotes[currentIndex]}"
            </p>
        </div>
    );
};

export default MotivationalSlider;
