// FIX: Define and export types used throughout the application.
export interface Exercise {
    id: string;
    title: string;
    description: string;
    category: 'Mindfulness' | 'Cognitive' | 'Somatic' | 'Behavioral' | 'Grounding';
    steps: string[];
    duration_minutes: number;
}

export type FeedbackRating = number;

export interface ExerciseFeedback {
    [exerciseId: string]: {
        rating: FeedbackRating;
        title: string;
    };
}

export interface BreathingStep {
    label: string;
    duration: number;
    type: 'inhale' | 'exhale' | 'hold';
}

export interface BreathingExercise {
    name: string;
    description: string;
    steps: BreathingStep[];
}

export type DataConsentLevel = 'essential' | 'enhanced' | 'complete';

export interface UserProfile {
    age?: number;
    location?: string;
    sleepHours?: number;
    caffeineIntake?: 'none' | 'low' | 'moderate' | 'high' | '';
    diagnosedDisorders?: string;
    copingStyles?: string;
    learningModality?: 'visual' | 'auditory' | 'kinesthetic' | '';
    workEnvironment?: 'office' | 'remote' | 'student' | 'outdoors_manual' | 'other' | '';
    accessToNature?: 'yes' | 'limited' | 'no' | '';
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | '';
}

export interface JournalEntry {
    id: string;
    text: string;
    timestamp: string;
}

export interface PlanHistoryEntry {
    id:string;
    timestamp: string;
    userInput: string;
    generatedExercises: Exercise[];
    sources?: { url: string; title: string }[];
}

// Types for Guided Programs
export interface ProgramDay {
    day: number;
    title: string;
    concept: string;
    exercise: Omit<Exercise, 'id'>;
}

export interface Program {
    id: string;
    title: string;
    description: string;
    days: ProgramDay[];
}

export interface ProgramProgress {
    [programId: string]: {
        currentDay: number;
    };
}

// Type for CBT Thought Record
export interface ThoughtRecordEntry {
    id: string;
    timestamp: string;
    situation: string;
    negativeThought: string;
    cognitiveDistortions: string[];
    challenge: string;
    alternativeThought: string;
    outcome: string;
}

// Type for Daily Reminders
export interface ReminderSettings {
    isEnabled: boolean;
    time: string; // "HH:MM"
    type: 'gentle' | 'motivational';
}

// Type for Exercise History
export interface CompletedExerciseLog {
    exerciseId: string;
    exerciseTitle: string;
    completedAt: string; // ISO timestamp
    rating: FeedbackRating;
}

// Type for Mood Tracking
export interface MoodLog {
    id: string;
    rating: 1 | 2 | 3 | 4 | 5; // 1: Awful, 5: Great
    timestamp: string; // ISO timestamp
}

// Type for User Feedback
export interface FeedbackEntry {
    id: string;
    timestamp: string;
    type: 'suggestion' | 'bug' | 'general';
    message: string;
}

// Type for Anonymous Interaction Logging
export interface InteractionEvent {
    type: string; // e.g., 'GENERATE_PLAN', 'RATE_EXERCISE'
    metadata?: Record<string, any>;
}