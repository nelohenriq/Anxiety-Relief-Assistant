'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Header from '../components/Header';
import MoodSelector from '../components/MoodSelector';
import RecommendedActivities from '../components/RecommendedActivities';
import UserProfile from '../components/UserProfile';
import CrisisModal from '../components/CrisisModal';
import ReminderHandler from '../components/ReminderHandler';
import { Exercise, ExerciseFeedback, FeedbackRating, PlanHistoryEntry, CompletedExerciseLog, FeedbackEntry } from '../types';
import { useUser } from '../context/UserContext';
import useLocalStorage from '../lib/useLocalStorage';

/**
 * The `Home` component serves as the main page of the application, providing
 * a user interface for generating personalized exercise plans based on user input.
 * It includes features such as symptom input, exercise generation, feedback handling,
 * and history tracking. The component also manages various UI states and interactions,
 * such as onboarding, profile management, and crisis modal handling.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered `Home` component.
 *
 * @remarks
 * - This component uses multiple `useState` hooks to manage local state, including
 *   user input, loading states, and UI visibility.
 * - The `useLocalStorage` hook is used to persist certain states across sessions.
 * - The `useTranslation` hook is used for internationalization support.
 * - The `useEffect` hook is used to handle scroll-based UI changes.
 *
 * @example
 * ```tsx
 * import Home from './page';
 *
 * function App() {
 *   return <Home />;
 * }
 * ```
 *
 * @dependencies
 * - `useTranslation`: Provides translation functionality.
 * - `useUser`: Retrieves user-related data such as profile and consent level.
 * - `useLocalStorage`: Custom hook for persisting state in local storage.
 *
 * @state
 * - `symptoms` (`string`): Tracks the user's symptom input.
 * - `exercises` (`Exercise[]`): Stores the generated exercises.
 * - `isLoading` (`boolean`): Indicates whether the exercise generation is in progress.
 * - `error` (`string | null`): Stores error messages, if any.
 * - `isProfileOpen` (`boolean`): Controls the visibility of the user profile modal.
 * - `isCrisisModalOpen` (`boolean`): Controls the visibility of the crisis modal.
 * - `feedback` (`ExerciseFeedback`): Stores user feedback on exercises.
 * - `planHistory` (`PlanHistoryEntry[]`): Tracks the history of generated plans.
 * - `exerciseHistory` (`CompletedExerciseLog[]`): Tracks the history of completed exercises.
 * - `feedbackHistory` (`FeedbackEntry[]`): Tracks the history of user feedback entries.
 * - `showHeaderBg` (`boolean`): Determines whether the header background is visible.
 * - `searchQuery` (`string`): Tracks the current search query.
 * - `hasCompletedOnboarding` (`boolean`): Indicates whether the user has completed onboarding.
 * - `calmImageUrl` (`string | null`): Stores the URL of a calming image.
 *
 * @methods
 * - `handleScroll`: Updates the `showHeaderBg` state based on the scroll position.
 * - `handleSubmit`: Handles the submission of symptoms to generate exercises.
 * - `handleFeedback`: Manages user feedback for specific exercises.
 * - `handleSaveFeedback`: Saves user feedback to the feedback history.
 * - `handleGetStartedClick`: Scrolls the page to the main content section.
 * - `openCrisisModal`: Opens the crisis modal based on a trigger event.
 *
 * @layout
 * - Displays a hero section with a title, subtitle, and "Get Started" button.
 * - Renders either a dashboard layout (no plan generated) or a focused layout
 *   (plan is loading or has been generated).
 * - Includes additional sections such as live coaching, breathing exercises,
 *   guided meditations, and more.
 *
 * @modals
 * - `OnboardingModal`: Displays onboarding steps for new users.
 * - `UserProfile`: Allows users to view and manage their profile and history.
 * - `CrisisModal`: Provides crisis-related resources and support.
 *
 * @errorHandling
 * - Displays error messages when exercise generation fails.
 * - Clears exercises and calming images on error.
 *
 * @accessibility
 * - Includes smooth scrolling for navigation.
 * - Provides focus and hover states for interactive elements.
 */
export default function Home() {
  const { t, i18n } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Missing state variables that are referenced in the component
  const [symptoms, setSymptoms] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useLocalStorage<ExerciseFeedback>('feedback', {});
  const [planHistory, setPlanHistory] = useLocalStorage<PlanHistoryEntry[]>('planHistory', []);
  const [exerciseHistory, setExerciseHistory] = useLocalStorage<CompletedExerciseLog[]>('exerciseHistory', []);
  const [feedbackHistory, setFeedbackHistory] = useLocalStorage<FeedbackEntry[]>('feedbackHistory', []);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage<boolean>('hasCompletedOnboarding', false);
  const [calmImageUrl, setCalmImageUrl] = useState<string | null>(null);

  const {
    profile,
    consentLevel,
    llmProvider,
    groqModel,
    ollamaModel,
    groqApiKey,
    ollamaCloudApiKey,
  } = useUser();

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
          provider: llmProvider,
          model: llmProvider === 'groq' ? groqModel : ollamaModel,
          apiKey: llmProvider === 'groq' ? groqApiKey : ollamaCloudApiKey,
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Welcome back, Sarah
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Your calm and centered space awaits.
            </p>
          </div>

          {/* Symptoms Input Form */}
          <div className="mb-16">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="mb-4">
                <label htmlFor="symptoms" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  How are you feeling today? Describe your symptoms or mood:
                </label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., I'm feeling anxious and having trouble sleeping..."
                  className="w-full p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!symptoms.trim() || isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Exercises...' : 'Get Personalized Exercises'}
              </button>
              {error && (
                <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}
            </form>
          </div>

          {/* Mood Selector */}
          <div className="mb-16">
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={(mood) => {
                setSelectedMood(mood);
                // Auto-populate symptoms based on mood selection
                if (mood) {
                  setSymptoms(`I'm feeling ${mood}`);
                }
              }}
            />
          </div>

          {/* Generated Exercises */}
          {exercises.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Your Personalized Exercises
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Based on your input, here are some exercises to help you feel better
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise, index) => (
                  <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      {exercise.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-sm">
                      {exercise.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {exercise.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-xs flex items-center justify-center font-medium">
                            {stepIndex + 1}
                          </span>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Duration: {exercise.duration_minutes ? `${exercise.duration_minutes} min` : 'N/A'}
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleFeedback(exercise.title, exercise.title, rating as FeedbackRating)}
                            className={`w-8 h-8 rounded-full transition-colors ${
                              feedback[exercise.title]?.rating === rating
                                ? 'bg-yellow-400 text-neutral-900'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                            title={`Rate ${rating} star${rating !== 1 ? 's' : ''}`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredExercises.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No exercises match your search. Try adjusting your search terms.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recommended Activities */}
          <RecommendedActivities />

          {/* Quick Actions */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/meditate" className="block">
              <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">🧘‍♀️</div>
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Meditate</div>
                </div>
              </button>
            </Link>
            <Link href="/journal" className="block">
              <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Journal</div>
                </div>
              </button>
            </Link>
            <Link href="/breathe" className="block">
              <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">🫁</div>
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Breathe</div>
                </div>
              </button>
            </Link>
            <Link href="/sleep" className="block">
              <button className="w-full p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">😴</div>
                  <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Sleep</div>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </main>

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
