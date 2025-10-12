'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import UserProfile from '../../components/UserProfile';
import CrisisModal from '../../components/CrisisModal';
import ReminderHandler from '../../components/ReminderHandler';

interface SleepExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  duration_minutes: number;
  steps: string[];
}

const SleepExercisesPage: React.FC = () => {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setShowHeaderBg(true);
    } else {
      setShowHeaderBg(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openCrisisModal = (trigger: 'manual_click' | 'keyword_detection') => {
    setIsCrisisModalOpen(true);
  };

  // Sleep exercises data
  const sleepExercises: SleepExercise[] = [
    {
      id: 'progressive-relaxation',
      name: 'Progressive Muscle Relaxation',
      description: 'Systematically tense and relax muscle groups to release physical tension.',
      category: 'Relaxation',
      icon: '💪',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      duration_minutes: 15,
      steps: [
        'Find a comfortable position in bed',
        'Start with your toes - tense for 5 seconds, then release',
        'Move to your calves - tense and release',
        'Continue with thighs, glutes, abdomen, chest, arms, and face',
        'Focus on the feeling of relaxation as each muscle group releases',
        'Breathe deeply and let go of the day\'s stress'
      ]
    },
    {
      id: 'guided-imagery',
      name: 'Guided Imagery',
      description: 'Use your imagination to create peaceful, sleep-inducing scenarios.',
      category: 'Visualization',
      icon: '🌙',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      duration_minutes: 20,
      steps: [
        'Lie down comfortably and close your eyes',
        'Take several slow, deep breaths',
        'Imagine yourself in a peaceful, safe place',
        'Engage all your senses - what do you see, hear, smell, feel?',
        'Let the peaceful scene unfold naturally',
        'Stay with the imagery until you drift off to sleep'
      ]
    },
    {
      id: 'breathing-counting',
      name: '4-7-8 Breathing',
      description: 'A calming breathing technique to slow your heart rate and prepare for sleep.',
      category: 'Breathing',
      icon: '🫁',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      duration_minutes: 10,
      steps: [
        'Place one hand on your chest, one on your abdomen',
        'Inhale quietly through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale completely through your mouth for 8 counts',
        'Repeat this cycle 4-8 times',
        'Let your breathing return to normal as you drift to sleep'
      ]
    },
    {
      id: 'body-scan',
      name: 'Body Scan Meditation',
      description: 'Bring awareness to each part of your body to release tension.',
      category: 'Meditation',
      icon: '🧘',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      duration_minutes: 12,
      steps: [
        'Lie down and close your eyes',
        'Bring attention to your breath for a few moments',
        'Starting with your toes, notice any sensations',
        'Slowly move your attention up through your body',
        'Notice areas of tension and consciously release them',
        'Continue until you\'ve scanned your entire body'
      ]
    },
    {
      id: 'gratitude-reflection',
      name: 'Gratitude Reflection',
      description: 'Reflect on positive aspects of your day to promote peaceful sleep.',
      category: 'Reflection',
      icon: '🙏',
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      duration_minutes: 8,
      steps: [
        'Lie down and get comfortable',
        'Think of 3 things you\'re grateful for today',
        'Recall one positive interaction you had',
        'Consider one thing you did well today',
        'Reflect on something that made you smile',
        'Let these positive thoughts carry you into sleep'
      ]
    },
    {
      id: 'gentle-stretching',
      name: 'Pre-Sleep Stretching',
      description: 'Gentle stretches to release physical tension before bed.',
      category: 'Movement',
      icon: '🤸',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      duration_minutes: 10,
      steps: [
        'Sit up in bed with legs extended',
        'Gently reach for your toes (or as far as comfortable)',
        'Stretch your arms overhead and to each side',
        'Gently roll your shoulders and neck',
        'Do a gentle spinal twist while seated',
        'End by hugging your knees to your chest'
      ]
    }
  ];

  const categories = ['All', 'Relaxation', 'Visualization', 'Breathing', 'Meditation', 'Reflection', 'Movement'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExercises = sleepExercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-950/20 font-sans transition-colors duration-300 text-neutral-800 dark:text-neutral-300">
      <Header
        onOpenProfile={() => setIsProfileOpen(true)}
        showBackground={showHeaderBg}
        onOpenCrisisModal={() => openCrisisModal('manual_click')}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <ReminderHandler />

      {/* Main content */}
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Sleep
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Discover techniques and exercises to help you relax, unwind, and get better sleep.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search sleep exercises"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sleep Tips Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Sleep Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">🌙</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Consistent Schedule</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Go to bed and wake up at the same time every day, even on weekends.
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Screen Time</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Avoid screens at least 1 hour before bed. Blue light can interfere with sleep.
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">🌡️</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Cool Environment</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Keep your bedroom cool (60-67°F/15-19°C) for optimal sleep conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Exercise */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Featured Tonight</h2>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Progressive Muscle Relaxation</h3>
                  <p className="text-indigo-100 mb-4">Release physical tension and prepare your body for sleep.</p>
                  <div className="flex items-center gap-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">15 minutes</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Relaxation</span>
                  </div>
                </div>
                <div className="text-6xl">💪</div>
              </div>
            </div>
          </div>

          {/* All Sleep Exercises */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              All Sleep Exercises
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-3xl ${exercise.icon}`}></div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${exercise.color}`}>
                      {exercise.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                    {exercise.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      Duration: {exercise.duration_minutes} min
                    </span>
                  </div>
                  <button
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Start Exercise
                  </button>
                </div>
              ))}
            </div>
            {filteredExercises.length === 0 && (
              <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                <p className="text-neutral-500 dark:text-neutral-400">No exercises match your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        exerciseHistory={[]}
        feedbackHistory={[]}
        onSaveFeedback={() => {}}
      />
      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
};

export default SleepExercisesPage;