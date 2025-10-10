'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import SymptomInput from '../components/SymptomInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ExerciseCard from '../components/ExerciseCard';
import Disclaimer from '../components/Disclaimer';
import BreathingExercises from '../components/BreathingExercises';
import Journal from '../components/Journal';
import UserProfile from '../components/UserProfile';
import CrisisModal from '../components/CrisisModal';
import PlanHistory from '../components/PlanHistory';
import ForYouCard from '../components/ForYouCard';
import GuidedPrograms from '../components/GuidedPrograms';
import GuidedMeditations from '../components/GuidedMeditations';
import CognitiveTools from '../components/CognitiveTools';
import MoodTracker from '../components/MoodTracker';
import ReminderHandler from '../components/ReminderHandler';
import SearchBar from '../components/SearchBar';
import MotivationalSlider from '../components/MotivationalSlider';
import LiveCoach from '../components/LiveCoach';
import OnboardingModal from '../components/OnboardingModal';
import CalmImage from '../components/CalmImage';
import { Exercise, ExerciseFeedback, FeedbackRating, PlanHistoryEntry, CompletedExerciseLog, FeedbackEntry } from '@/types';
import { useUser } from '../context/UserContext';
import useLocalStorage from '../hooks/useLocalStorage';

export default function Home() {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [feedback, setFeedback] = useLocalStorage<ExerciseFeedback>('exerciseFeedback', {});
  const [planHistory, setPlanHistory] = useLocalStorage<PlanHistoryEntry[]>('planHistory', []);
  const [exerciseHistory, setExerciseHistory] = useLocalStorage<CompletedExerciseLog[]>('exerciseHistory', []);
  const [feedbackHistory, setFeedbackHistory] = useLocalStorage<FeedbackEntry[]>('feedbackHistory', []);
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('hasCompletedOnboarding', false);
  const [calmImageUrl, setCalmImageUrl] = useState<string | null>(null);

  const { profile, consentLevel, llmProvider, ollamaModel, ollamaCloudApiKey } = useUser();

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setShowHeaderBg(true);
    } else {
      setShowHeaderBg(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchQuery(''); // Clear search on new submission
    setCalmImageUrl(null);
    setExercises([]);

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          profile,
          consentLevel,
          feedback,
          language: i18n.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate exercises');
      }

      const { exercises: result, sources, calmImageUrl: imageUrl } = await response.json();
      setExercises(result);
      setCalmImageUrl(imageUrl);

      const newHistoryEntry: PlanHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userInput: symptoms,
        generatedExercises: result,
        sources: sources,
        calmImageUrl: imageUrl || undefined,
      };
      setPlanHistory([newHistoryEntry, ...planHistory]);

    } catch (err) {
      setExercises([]); // Clear exercises on error
      setCalmImageUrl(null);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (exerciseId: string, exerciseTitle: string, rating: FeedbackRating) => {
    const newFeedback = { ...feedback };
    const isNewRating = newFeedback[exerciseId]?.rating !== rating;

    if (newFeedback[exerciseId]?.rating === rating) {
      delete newFeedback[exerciseId];
    } else {
      newFeedback[exerciseId] = { rating, title: exerciseTitle };
    }
    setFeedback(newFeedback);

    // Add to completion history only when a new rating is set
    if (isNewRating) {
      const newLogEntry: CompletedExerciseLog = {
        exerciseId,
        exerciseTitle,
        completedAt: new Date().toISOString(),
        rating,
      };
      setExerciseHistory([newLogEntry, ...exerciseHistory]);
    }
  };

  const handleSaveFeedback = (newFeedback: Omit<FeedbackEntry, 'id' | 'timestamp'>) => {
    const feedbackEntry: FeedbackEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...newFeedback,
    };
    setFeedbackHistory([feedbackEntry, ...feedbackHistory]);
  };

  const handleGetStartedClick = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openCrisisModal = (trigger: 'manual_click' | 'keyword_detection') => {
    setIsCrisisModalOpen(true);
  };

  const lowerCaseQuery = searchQuery.toLowerCase();

  const filteredExercises = exercises.filter(ex =>
    ex.title.toLowerCase().includes(lowerCaseQuery) ||
    ex.description.toLowerCase().includes(lowerCaseQuery) ||
    ex.steps.some(step => step.toLowerCase().includes(lowerCaseQuery))
  );

  const filteredHistory = planHistory.filter(entry =>
    entry.userInput.toLowerCase().includes(lowerCaseQuery) ||
    entry.generatedExercises.some(ex =>
      ex.title.toLowerCase().includes(lowerCaseQuery) ||
      ex.description.toLowerCase().includes(lowerCaseQuery)
    )
  );

  const showFocusedLayout = isLoading || exercises.length > 0;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 font-sans transition-colors duration-300 text-neutral-800 dark:text-neutral-300">
      {!hasCompletedOnboarding && (
        <OnboardingModal onComplete={() => setHasCompletedOnboarding(true)} />
      )}
      <Header
        onOpenProfile={() => setIsProfileOpen(true)}
        showBackground={showHeaderBg}
        onOpenCrisisModal={() => openCrisisModal('manual_click')}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      <ReminderHandler />

      <section className="relative h-screen flex items-center justify-center text-center bg-gradient-to-br from-primary-100 via-neutral-100 to-accent-100 dark:from-primary-950 dark:via-neutral-900 dark:to-accent-950 px-4">
        <div className="z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-800 dark:text-primary-200 tracking-tight">{t('hero.title')}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-neutral-600 dark:text-neutral-300">
            {t('hero.subtitle')}
          </p>
          <button onClick={handleGetStartedClick} className="mt-8 inline-block bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/50">
            {t('hero.get_started_button')}
          </button>
          <div className="mt-8 w-full max-w-2xl">
            <MotivationalSlider />
          </div>
        </div>
      </section>

      <div id="main-content" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="lg:hidden px-4 pb-8 -mt-8">
          <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
        </div>

        {!showFocusedLayout ? (
          // === DASHBOARD LAYOUT (No plan generated) ===
          <div className="space-y-12">
            <div className="space-y-12">
              <ForYouCard />
              <div className="bg-white dark:bg-neutral-800/50 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <SymptomInput
                  symptoms={symptoms}
                  setSymptoms={setSymptoms}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onCrisisDetect={() => openCrisisModal('keyword_detection')}
                />
              </div>
              {error && <p className="text-center text-red-500 mt-4">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <LiveCoach searchQuery={searchQuery} />
              <BreathingExercises searchQuery={searchQuery} />
              <GuidedMeditations searchQuery={searchQuery} />
              <MoodTracker searchQuery={searchQuery} />
              <CognitiveTools searchQuery={searchQuery} />
              <GuidedPrograms searchQuery={searchQuery} />
              <Journal searchQuery={searchQuery} />
            </div>

            <div className="pt-8">
              <PlanHistory history={filteredHistory} />
              {filteredHistory.length === 0 && searchQuery && planHistory.length > 0 && (
                <p className="text-center text-neutral-500 dark:text-neutral-400 mt-4">No plan history entries match your search.</p>
              )}
            </div>
          </div>
        ) : (
          // === FOCUSED LAYOUT (Plan is loading or has been generated) ===
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <main className="w-full lg:w-2/3 space-y-12">
              <ForYouCard />
              <div className="bg-white dark:bg-neutral-800/50 p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <SymptomInput
                  symptoms={symptoms}
                  setSymptoms={setSymptoms}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onCrisisDetect={() => openCrisisModal('keyword_detection')}
                />
              </div>

              {isLoading && <LoadingSpinner />}

              {error && <p className="text-center text-red-500 mt-4">{error}</p>}

              {(isLoading || calmImageUrl) && llmProvider === 'gemini' && (
                <CalmImage imageUrl={calmImageUrl} isLoading={isLoading} />
              )}

              {exercises.length > 0 && (
                <div className="space-y-6 mt-8 animate-fade-in">
                  <h2 className="text-3xl font-bold text-center text-neutral-800 dark:text-neutral-100">{t('personalized_plan.title')}</h2>
                  {filteredExercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onFeedback={handleFeedback}
                      feedbackRating={feedback[exercise.id]?.rating}
                    />
                  ))}
                  {filteredExercises.length === 0 && searchQuery && (
                    <p className="text-center text-neutral-500 dark:text-neutral-400">No exercises match your search.</p>
                  )}
                </div>
              )}

              <div className="pt-8">
                <PlanHistory history={filteredHistory} />
                {filteredHistory.length === 0 && searchQuery && planHistory.length > 0 && (
                  <p className="text-center text-neutral-500 dark:text-neutral-400 mt-4">No plan history entries match your search.</p>
                )}
              </div>
            </main>

            <aside className="w-full lg:w-1/3 space-y-8">
              <LiveCoach searchQuery={searchQuery} />
              <BreathingExercises searchQuery={searchQuery} />
              <GuidedMeditations searchQuery={searchQuery} />
              <MoodTracker searchQuery={searchQuery} />
              <CognitiveTools searchQuery={searchQuery} />
              <GuidedPrograms searchQuery={searchQuery} />
              <Journal searchQuery={searchQuery} />
            </aside>
          </div>
        )}
      </div>
      <Disclaimer />
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        exerciseHistory={exerciseHistory}
        feedbackHistory={feedbackHistory}
        onSaveFeedback={handleSaveFeedback}
      />
      <CrisisModal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} />
    </div>
  );
}