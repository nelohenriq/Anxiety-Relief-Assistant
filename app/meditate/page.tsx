'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import UserProfile from '../../components/UserProfile';
import CrisisModal from '../../components/CrisisModal';
import ReminderHandler from '../../components/ReminderHandler';

interface MeditationExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  duration_minutes: number;
  steps: string[];
}

const MeditateExercisesPage: React.FC = () => {
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

  // Meditation exercises data
  const meditationExercises: MeditationExercise[] = [
    {
      id: 'mindfulness-breathing',
      name: 'Mindful Breathing',
      description: 'Focus on your breath to anchor yourself in the present moment.',
      category: 'Mindfulness',
      icon: '🫁',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      duration_minutes: 10,
      steps: [
        'Sit comfortably with your back straight',
        'Close your eyes or soften your gaze',
        'Bring attention to your natural breath',
        'Notice the sensation of air entering and leaving your nostrils',
        'When your mind wanders, gently return to the breath',
        'Continue for the duration of your practice'
      ]
    },
    {
      id: 'body-scan-meditation',
      name: 'Body Scan Meditation',
      description: 'Systematically bring awareness to each part of your body.',
      category: 'Awareness',
      icon: '🧘',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      duration_minutes: 15,
      steps: [
        'Lie down or sit comfortably',
        'Close your eyes and take a few deep breaths',
        'Bring attention to your toes and feet',
        'Slowly move awareness up through your legs, torso, arms, and head',
        'Notice any sensations, tension, or relaxation',
        'Breathe into any areas of tension and let them soften'
      ]
    },
    {
      id: 'loving-kindness',
      name: 'Loving Kindness Meditation',
      description: 'Cultivate compassion for yourself and others through loving intentions.',
      category: 'Compassion',
      icon: '💝',
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      duration_minutes: 12,
      steps: [
        'Sit comfortably and close your eyes',
        'Begin by directing love and kindness toward yourself',
        'Repeat phrases like "May I be happy, May I be healthy"',
        'Extend these wishes to loved ones',
        'Include neutral people in your practice',
        'Finally, extend loving kindness to all beings'
      ]
    },
    {
      id: 'walking-meditation',
      name: 'Walking Meditation',
      description: 'Practice mindfulness while walking slowly and deliberately.',
      category: 'Movement',
      icon: '🚶',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      duration_minutes: 20,
      steps: [
        'Find a quiet path where you can walk slowly',
        'Walk at a comfortable, slow pace',
        'Focus on the sensation of your feet touching the ground',
        'Notice how your body moves with each step',
        'When your mind wanders, gently return attention to walking',
        'Maintain awareness of your breath and body'
      ]
    },
    {
      id: 'mantra-meditation',
      name: 'Mantra Meditation',
      description: 'Use a repeated word or phrase to focus the mind.',
      category: 'Concentration',
      icon: '🔊',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      duration_minutes: 15,
      steps: [
        'Choose a simple mantra like "peace" or "om"',
        'Sit comfortably and close your eyes',
        'Repeat your mantra silently or aloud',
        'Focus fully on the sound and vibration',
        'When thoughts arise, gently return to the mantra',
        'Continue for your desired duration'
      ]
    },
    {
      id: 'chakra-meditation',
      name: 'Chakra Meditation',
      description: 'Balance your energy centers through focused awareness.',
      category: 'Energy',
      icon: '🌈',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      duration_minutes: 25,
      steps: [
        'Sit or lie down comfortably',
        'Focus on each chakra starting from the root',
        'Visualize each energy center as a colored light',
        'Breathe into each chakra for several minutes',
        'Notice any sensations or emotions that arise',
        'End with a few minutes of overall body awareness'
      ]
    }
  ];

  const categories = ['All', 'Mindfulness', 'Awareness', 'Compassion', 'Movement', 'Concentration', 'Energy'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExercises = meditationExercises.filter(exercise => {
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
              Meditate
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Discover various meditation practices to cultivate mindfulness, compassion, and inner peace.
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
                placeholder="Search meditation practices"
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

          {/* Meditation Tips Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Meditation Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">🧘‍♀️</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Start Small</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Begin with just 5 minutes a day. Consistency matters more than duration.
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Create Space</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Designate a quiet, comfortable space for your practice free from distractions.
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl mb-4">💭</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Be Patient</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Your mind will wander. That's normal. Gently return your focus without judgment.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Meditation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Featured Today</h2>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Mindful Breathing</h3>
                  <p className="text-purple-100 mb-4">A simple practice to center yourself and find inner calm.</p>
                  <div className="flex items-center gap-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">10 minutes</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Mindfulness</span>
                  </div>
                </div>
                <div className="text-6xl">🫁</div>
              </div>
            </div>
          </div>

          {/* All Meditation Exercises */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              All Meditation Practices
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
                    Start Meditation
                  </button>
                </div>
              ))}
            </div>
            {filteredExercises.length === 0 && (
              <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                <p className="text-neutral-500 dark:text-neutral-400">No meditations match your search.</p>
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

export default MeditateExercisesPage;