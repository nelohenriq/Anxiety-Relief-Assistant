import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) {
                return initialValue;
            }

            // Try to parse as JSON first
            try {
                return JSON.parse(item);
            } catch {
                // If JSON parsing fails, check if it's a plain string that matches a possible value
                // This handles cases where values were stored without JSON.stringify
                if (typeof initialValue === 'string' && (initialValue === 'light' || initialValue === 'dark')) {
                    if (item === 'light' || item === 'dark') {
                        return item as T;
                    }
                }
                return initialValue;
            }
        } catch (error) {
            console.error('useLocalStorage error:', error);
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                // Clear any existing corrupted values first
                if (key === 'theme') {
                    window.localStorage.removeItem(key);
                }
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error('useLocalStorage setValue error:', error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;
