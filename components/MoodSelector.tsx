import React from 'react';
import { useTranslation } from 'react-i18next';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const { t } = useTranslation();

  const moodOptions: MoodOption[] = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'content', label: 'Content', emoji: '😌', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {t('home.how_are_you_feeling', 'How are you feeling today?')}
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {moodOptions.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
              selectedMood === mood.id
                ? `${mood.color} ring-2 ring-offset-2 ring-primary-400 dark:ring-offset-neutral-800`
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <div className="text-2xl mb-2">{mood.emoji}</div>
            <div className="text-sm font-medium">{mood.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;