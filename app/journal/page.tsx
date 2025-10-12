'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import UserProfile from '../../components/UserProfile';
import CrisisModal from '../../components/CrisisModal';
import ReminderHandler from '../../components/ReminderHandler';

const JournalPage: React.FC = () => {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showHeaderBg, setShowHeaderBg] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [journalData, setJournalData] = useState({
    situation: '',
    thoughts: '',
    emotions: '',
    physicalSensations: '',
    behavior: ''
  });

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

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setJournalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "What situation led to this thought?",
          description: "Describe the situation, e.g., 'I gave a presentation at work and my boss seemed distracted.'",
          field: 'situation',
          placeholder: "Describe the situation..."
        };
      case 2:
        return {
          title: "What thoughts went through your mind?",
          description: "What were you thinking in that moment?",
          field: 'thoughts',
          placeholder: "What were you thinking..."
        };
      case 3:
        return {
          title: "What emotions did you feel?",
          description: "How did this situation make you feel emotionally?",
          field: 'emotions',
          placeholder: "How did you feel..."
        };
      case 4:
        return {
          title: "What physical sensations did you notice?",
          description: "Did you notice any physical reactions in your body?",
          field: 'physicalSensations',
          placeholder: "What did you notice in your body..."
        };
      case 5:
        return {
          title: "What was your behavior or action urge?",
          description: "What did you do or feel like doing in response?",
          field: 'behavior',
          placeholder: "What did you do or feel like doing..."
        };
      default:
        return {
          title: "What situation led to this thought?",
          description: "",
          field: 'situation',
          placeholder: ""
        };
    }
  };

  const stepContent = renderStepContent();

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                New Journal Entry
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Today is a new day. Let's capture your thoughts.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Step {currentStep} of 5
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-500">
                {Math.round((currentStep / 5) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {stepContent.title}
            </h2>

            <div className="mb-6">
              <textarea
                value={journalData[stepContent.field as keyof typeof journalData]}
                onChange={(e) => handleInputChange(stepContent.field, e.target.value)}
                placeholder={stepContent.placeholder}
                className="w-full h-48 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-transparent resize-none"
              />
            </div>

            {stepContent.description && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  <strong>Example:</strong> {stepContent.description}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center"
            >
              {currentStep === 5 ? 'Complete Entry' : 'Next'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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

export default JournalPage;