import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

const ReminderHandler: React.FC = () => {
    const { reminderSettings } = useUser();
    const [lastShownDate, setLastShownDate] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // Clear any existing interval when settings change
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (reminderSettings.isEnabled && Notification.permission === 'granted') {
            intervalRef.current = window.setInterval(() => {
                const now = new Date();
                const currentDate = now.toISOString().split('T')[0];
                
                // Reset lastShownDate if it's a new day
                if (lastShownDate !== currentDate) {
                    setLastShownDate(null);
                }

                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                if (currentTime === reminderSettings.time && lastShownDate !== currentDate) {
                    let title = 'Time for your daily check-in';
                    let body = 'Just a gentle reminder to take a moment for yourself.';

                    if (reminderSettings.type === 'motivational') {
                        title = 'A Moment for You';
                        body = "It's time for your daily moment of calm. You've got this!";
                    }
                    
                    new Notification(title, {
                        body: body,
                        // icon: '/vite.svg', // Optional: Add an icon URL - removed as file doesn't exist
                    });

                    setLastShownDate(currentDate);
                }
            }, 30000); // Check every 30 seconds
        }

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };

    }, [reminderSettings, lastShownDate]);

    return null; // This component does not render anything
};

export default ReminderHandler;