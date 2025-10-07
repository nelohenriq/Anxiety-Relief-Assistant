import { InteractionEvent } from '../types';

const LOG_KEY = 'interactionLog';
const MAX_LOG_SIZE = 500;

/**
 * Logs an anonymous user interaction to localStorage for development purposes.
 * This log contains NO personally identifiable information or timestamps.
 * @param event - The interaction event to log.
 */
export const logInteraction = (event: InteractionEvent) => {
    try {
        const item = window.localStorage.getItem(LOG_KEY);
        let log: InteractionEvent[] = item ? JSON.parse(item) : [];
        
        log.unshift(event); // Add to the beginning

        if (log.length > MAX_LOG_SIZE) {
            log = log.slice(0, MAX_LOG_SIZE);
        }

        window.localStorage.setItem(LOG_KEY, JSON.stringify(log));

    } catch (error) {
        console.error("Failed to log interaction:", error);
    }
};
