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

  const { profile, consentLevel, llmProvider, groqModel, groqApiKey, ollamaModel, ollamaCloudApiKey } = useUser();

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

      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-neutral-900 dark:to-accent-950">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-200/20 dark:bg-accent-800/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-100/30 to-transparent dark:from-primary-900/30 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent-100/20 dark:bg-accent-900/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-100/20 dark:bg-primary-900/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>

        {/* Enhanced floating elements with more variety */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-8 w-4 h-4 bg-primary-300/40 dark:bg-primary-700/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/3 right-12 w-3 h-3 bg-accent-300/40 dark:bg-accent-700/40 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 left-16 w-2 h-2 bg-primary-400/40 dark:bg-primary-600/40 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/4 right-8 w-5 h-5 bg-accent-400/40 dark:bg-accent-600/40 rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/2 left-4 w-3 h-3 bg-primary-500/30 dark:bg-primary-500/50 rounded-full animate-pulse delay-800"></div>
          <div className="absolute top-2/3 right-4 w-2 h-2 bg-accent-500/30 dark:bg-accent-500/50 rounded-full animate-pulse delay-1200"></div>
          <div className="absolute top-1/6 left-1/3 w-6 h-6 bg-primary-200/30 dark:bg-primary-800/30 rounded-full animate-pulse delay-1500"></div>
          <div className="absolute bottom-1/6 right-1/3 w-4 h-4 bg-accent-200/30 dark:bg-accent-800/30 rounded-full animate-pulse delay-1800"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 max-w-4xl mx-auto">
          {/* Main heading with enhanced typography and animations */}
          <div className="mb-6 relative">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 dark:from-primary-400 dark:via-primary-300 dark:to-accent-400 bg-clip-text text-transparent leading-tight tracking-tight animate-fade-in hover:scale-105 transition-transform duration-500">
              Find Your
              <span className="block text-6xl md:text-8xl lg:text-9xl bg-gradient-to-r from-accent-500 to-primary-500 dark:from-accent-300 dark:to-primary-300 bg-clip-text text-transparent animate-pulse">
                Calm.
              </span>
            </h1>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 dark:from-primary-400 dark:via-primary-300 dark:to-accent-400 bg-clip-text text-transparent leading-tight tracking-tight opacity-20 blur-sm animate-pulse">
              Find Your
              <span className="block text-6xl md:text-8xl lg:text-9xl bg-gradient-to-r from-accent-500 to-primary-500 dark:from-accent-300 dark:to-primary-300 bg-clip-text text-transparent">
                Calm.
              </span>
            </div>
          </div>

          {/* Enhanced subtitle with better typography */}
          <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto text-neutral-700 dark:text-neutral-300 leading-relaxed font-light animate-fade-in delay-200">
            Describe how you're feeling, and let our AI create a
            <span className="font-semibold text-primary-600 dark:text-primary-400 relative">
              personalized plan
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-60"></div>
            </span>
            with coping exercises to guide you toward relief.
          </p>

          {/* Enhanced CTA button with more sophisticated effects */}
          <button
            onClick={handleGetStartedClick}
            className="mt-10 group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-500 ease-out transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-500/50 active:scale-95"
          >
            {/* Main gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full shadow-lg group-hover:shadow-2xl transition-all duration-500"></div>

            {/* Hover state gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="absolute inset-[2px] rounded-full bg-gradient-to-r from-primary-600 to-accent-600"></div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-200 animate-ping"></div>

            <span className="relative flex items-center gap-3 text-lg">
              Get Started
              <svg className="w-5 h-5 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Enhanced motivational slider */}
          <div className="mt-12 w-full max-w-3xl animate-fade-in delay-500">
            <MotivationalSlider />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <div id="main-content" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="lg:hidden px-4 pb-8 -mt-8">
          <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
        </div>

        {!showFocusedLayout ? (
           // === ENHANCED DASHBOARD LAYOUT ===
           <div className="space-y-20">
             {/* Main content section */}
             <div className="space-y-20">
               <div className="animate-fade-in transform hover:scale-105 transition-all duration-500">
                 <ForYouCard />
               </div>

               <div className="animate-fade-in delay-200 transform hover:scale-105 transition-all duration-500">
                 <div className="bg-gradient-to-br from-white via-white to-neutral-50/50 dark:from-neutral-800/50 dark:via-neutral-800/80 dark:to-neutral-700/30 p-8 sm:p-12 rounded-3xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 hover-lift hover:shadow-2xl backdrop-blur-sm">
                   <SymptomInput
                     symptoms={symptoms}
                     setSymptoms={setSymptoms}
                     onSubmit={handleSubmit}
                     isLoading={isLoading}
                     onCrisisDetect={() => openCrisisModal('keyword_detection')}
                   />
                 </div>
               </div>

               {error && (
                 <div className="animate-fade-in delay-300 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                   <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                 </div>
               )}
             </div>

            {/* Enhanced grid layout with staggered animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="animate-fade-in delay-300 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <LiveCoach searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-400 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <BreathingExercises searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-500 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <GuidedMeditations searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-600 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <MoodTracker searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-700 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <CognitiveTools searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-800 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <GuidedPrograms searchQuery={searchQuery} />
              </div>
              <div className="animate-fade-in delay-900 md:col-span-2 transform hover:scale-105 transition-all duration-500 hover:shadow-xl">
                <Journal searchQuery={searchQuery} />
              </div>
            </div>

            {/* History section */}
            <div className="pt-12 animate-fade-in delay-1000">
              <PlanHistory history={filteredHistory} />
              {filteredHistory.length === 0 && searchQuery && planHistory.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">No plan history entries match your search.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
           // === ENHANCED FOCUSED LAYOUT (Plan is loading or has been generated) ===
           <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
             <main className="w-full lg:w-2/3 space-y-12">
               <div className="transform hover:scale-105 transition-all duration-500">
                 <ForYouCard />
               </div>
               <div className="bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-800/50 dark:to-neutral-700/30 p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm hover-lift">
                 <SymptomInput
                   symptoms={symptoms}
                   setSymptoms={setSymptoms}
                   onSubmit={handleSubmit}
                   isLoading={isLoading}
                   onCrisisDetect={() => openCrisisModal('keyword_detection')}
                 />
               </div>

               {isLoading && (
                 <div className="flex justify-center items-center py-12">
                   <LoadingSpinner />
                 </div>
               )}

               {error && (
                 <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                   <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                 </div>
               )}

               {(isLoading || calmImageUrl) && (llmProvider === 'gemini' || llmProvider === 'groq') && (
                 <div className="animate-fade-in">
                   <CalmImage imageUrl={calmImageUrl} isLoading={isLoading} />
                 </div>
               )}

               {exercises.length > 0 && (
                 <div className="space-y-8 mt-8 animate-fade-in">
                   <div className="text-center py-6">
                     <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                       {t('personalized_plan.title')}
                     </h2>
                     <div className="mt-2 w-24 h-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mx-auto"></div>
                   </div>
                   <div className="grid gap-6">
                     {filteredExercises.map((exercise, index) => (
                       <div
                         key={exercise.id}
                         className="animate-fade-in"
                         style={{ animationDelay: `${index * 100}ms` }}
                       >
                         <ExerciseCard
                           exercise={exercise}
                           onFeedback={handleFeedback}
                           feedbackRating={feedback[exercise.id]?.rating}
                         />
                       </div>
                     ))}
                   </div>
                   {filteredExercises.length === 0 && searchQuery && (
                     <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                       <p className="text-neutral-500 dark:text-neutral-400">No exercises match your search.</p>
                     </div>
                   )}
                 </div>
               )}

               <div className="pt-8">
                 <PlanHistory history={filteredHistory} />
                 {filteredHistory.length === 0 && searchQuery && planHistory.length > 0 && (
                   <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl mt-4">
                     <p className="text-neutral-500 dark:text-neutral-400">No plan history entries match your search.</p>
                   </div>
                 )}
               </div>
             </main>

             <aside className="w-full lg:w-1/3 space-y-8">
               <div className="animate-fade-in delay-200 transform hover:scale-105 transition-all duration-500">
                 <LiveCoach searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-300 transform hover:scale-105 transition-all duration-500">
                 <BreathingExercises searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-400 transform hover:scale-105 transition-all duration-500">
                 <GuidedMeditations searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-500 transform hover:scale-105 transition-all duration-500">
                 <MoodTracker searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-600 transform hover:scale-105 transition-all duration-500">
                 <CognitiveTools searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-700 transform hover:scale-105 transition-all duration-500">
                 <GuidedPrograms searchQuery={searchQuery} />
               </div>
               <div className="animate-fade-in delay-800 transform hover:scale-105 transition-all duration-500">
                 <Journal searchQuery={searchQuery} />
               </div>
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