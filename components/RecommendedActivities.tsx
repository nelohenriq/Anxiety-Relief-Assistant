import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface ActivityCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const RecommendedActivities: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const activities: ActivityCard[] = [
    {
      id: 'meditation',
      title: t('activities.guided_meditation', 'Guided Meditation'),
      description: t('activities.meditation_desc', 'Find peace and focus with our guided meditations.'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/meditate',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'journaling',
      title: t('activities.journaling_prompts', 'Journaling Prompts'),
      description: t('activities.journal_desc', 'Explore your thoughts and feelings with our prompts.'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      path: '/journal',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'breathing',
      title: t('activities.breathing_exercises', 'Breathing Exercises'),
      description: t('activities.breathing_desc', 'Relax and center yourself with our breathing exercises.'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      path: '/breathe',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        {t('home.recommended_for_you', 'Recommended for you')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => router.push(activity.path)}
            className="group relative bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${activity.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {activity.icon}
              </div>
              <h4 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                {activity.title}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {activity.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedActivities;