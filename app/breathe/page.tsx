'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import BreathingVisualizer from '../../components/BreathingVisualizer';
import UserProfile from '../../components/UserProfile';
import CrisisModal from '../../components/CrisisModal';
import ReminderHandler from '../../components/ReminderHandler';
import { BreathingExercise } from '../../types';

const BreathingExercisesPage: React.FC = () => {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);

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

  // Mock data for breathing exercises - in a real app this would come from an API or data file
  const breathingExercises = [
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'A simple technique to calm your nerves.',
      category: 'Calming',
      icon: '🟦',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      steps: [
        { label: 'Inhale', duration: 4, type: 'inhale' as const },
        { label: 'Hold', duration: 4, type: 'hold' as const },
        { label: 'Exhale', duration: 4, type: 'exhale' as const },
        { label: 'Hold', duration: 4, type: 'hold' as const },
      ]
    },
    {
      id: 'diaphragmatic',
      name: 'Diaphragmatic',
      description: 'Deep breathing from the diaphragm.',
      category: 'Deep',
      icon: '🫁',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      steps: [
        { label: 'Inhale', duration: 5, type: 'inhale' as const },
        { label: 'Hold', duration: 2, type: 'hold' as const },
        { label: 'Exhale', duration: 5, type: 'exhale' as const },
      ]
    },
    {
      id: 'alternate-nostril',
      name: 'Alternate Nostril',
      description: 'Balancing breath for harmony.',
      category: 'Balancing',
      icon: '⚖️',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      steps: [
        { label: 'Inhale Left', duration: 4, type: 'inhale' as const },
        { label: 'Switch', duration: 2, type: 'hold' as const },
        { label: 'Exhale Right', duration: 4, type: 'exhale' as const },
        { label: 'Inhale Right', duration: 4, type: 'inhale' as const },
        { label: 'Switch', duration: 2, type: 'hold' as const },
        { label: 'Exhale Left', duration: 4, type: 'exhale' as const },
      ]
    },
    {
      id: 'lions-breath',
      name: "Lion's Breath",
      description: 'Energizing breath to release tension.',
      category: 'Energizing',
      icon: '🦁',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      steps: [
        { label: 'Inhale', duration: 4, type: 'inhale' as const },
        { label: 'Exhale Roar', duration: 6, type: 'exhale' as const },
      ]
    },
    {
      id: 'humming-bee',
      name: 'Humming Bee',
      description: 'Soothing vibration for relaxation.',
      category: 'Soothing',
      icon: '🐝',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      steps: [
        { label: 'Inhale', duration: 4, type: 'inhale' as const },
        { label: 'Hum Exhale', duration: 6, type: 'exhale' as const },
      ]
    },
    {
      id: 'ocean-breath',
      name: 'Ocean Breath',
      description: 'Relaxing breath like ocean waves.',
      category: 'Relaxing',
      icon: '🌊',
      color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      steps: [
        { label: 'Inhale', duration: 4, type: 'inhale' as const },
        { label: 'Exhale', duration: 6, type: 'exhale' as const },
      ]
    }
  ];

  const categories = ['All', 'Calming', 'Deep', 'Balancing', 'Energizing', 'Soothing', 'Relaxing'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExercises = breathingExercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedExercise) {
    return (
      <BreathingVisualizer
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    );
  }

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
              Breathe
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Find a breathing exercise to help you relax, focus, or energize.
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
                placeholder="Search breathing exercises"
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

          {/* Featured Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Featured</h2>
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Box Breathing</h3>
                  <p className="text-primary-100 mb-4">A simple technique to calm your nerves.</p>
                  <button
                    onClick={() => setSelectedExercise(breathingExercises[0])}
                    className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  >
                    Start Exercise
                  </button>
                </div>
                <div className="text-6xl">🟦</div>
              </div>
            </div>
          </div>

          {/* All Exercises */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              All Breathing Exercises
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
                  <button
                    onClick={() => setSelectedExercise(exercise)}
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

export default BreathingExercisesPage;