import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMotivationalQuotes } from '../services/geminiService';

const MotivationalSlider: React.FC = () => {
    const { i18n } = useTranslation();
    const [quotes, setQuotes] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    
    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const result = await getMotivationalQuotes(i18n.language);
                setQuotes(result);
            } catch (error) {
                console.error("Failed to fetch motivational quotes:", error);
                // Silently fail, don't show an error message on the hero screen.
            }
        };
        fetchQuotes();
    }, [i18n.language]);
    
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