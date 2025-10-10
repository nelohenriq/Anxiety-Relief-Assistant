import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoodLog } from '../types';

interface MoodChartProps {
    logs: MoodLog[];
}

const MoodChart: React.FC<MoodChartProps> = ({ logs }) => {
    const { t, i18n } = useTranslation();

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= sevenDaysAgo && logDate <= today;
    });

    const dailyAverages = Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(sevenDaysAgo);
        day.setDate(sevenDaysAgo.getDate() + i);
        const dayString = day.toISOString().split('T')[0];
        
        const logsForDay = recentLogs.filter(log => log.timestamp.startsWith(dayString));
        
        if (logsForDay.length === 0) {
            return { day: day, average: null };
        }
        
        const sum = logsForDay.reduce((acc, log) => acc + log.rating, 0);
        return { day: day, average: sum / logsForDay.length };
    });

    if (recentLogs.length < 1) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('mood_chart.empty_state')}</p>
            </div>
        );
    }
    
    const moodEmojis = ['😡', '😟', '😐', '🙂', '😁'];
    const weekDays = dailyAverages.map(d => d.day.toLocaleDateString(i18n.language, { weekday: 'short' }));

    return (
        <div className="mt-4">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 text-center mb-2">{t('mood_chart.title')}</h3>
            <div className="relative h-48 w-full p-2">
                <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                    {/* Y-axis labels and grid lines */}
                    {moodEmojis.map((emoji, i) => (
                        <g key={i}>
                            <text x="5" y={100 - i * 20} dy="0.3em" fontSize="10" fill="currentColor" className="text-neutral-500 dark:text-neutral-400">{emoji}</text>
                            <line x1="25" y1={100 - i * 20} x2="300" y2={100 - i * 20} stroke="currentColor" strokeWidth="0.5" className="text-neutral-200 dark:text-neutral-700" />
                        </g>
                    ))}

                    {/* Bars */}
                    {dailyAverages.map(({ day, average }, i) => {
                        const barHeight = average ? (average - 1) * 20 : 0;
                        const x = 30 + i * (270 / 7);
                        const width = (270 / 7) * 0.6;
                        
                        return (
                             <g key={day.toISOString()}>
                               {average && (
                                   <rect
                                       x={x}
                                       y={100 - barHeight}
                                       width={width}
                                       height={barHeight}
                                       rx="2"
                                       ry="2"
                                       className="fill-current text-primary-400 hover:text-primary-500 transition-colors"
                                   >
                                      <title>{`${t('mood_chart.avg_mood')}: ${average.toFixed(1)}`}</title>
                                   </rect>
                               )}
                                <text x={x + width / 2} y="115" textAnchor="middle" fontSize="8" fill="currentColor" className="text-neutral-600 dark:text-neutral-300">
                                   {weekDays[i]}
                               </text>
                           </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default MoodChart;
