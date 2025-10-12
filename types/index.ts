export interface Exercise {
  title: string;
  description: string;
  steps: string[];
  duration?: string;
  duration_minutes?: number;
  category?: string;
}

export interface ExerciseFeedback {
  [exerciseId: string]: {
    rating: FeedbackRating;
    title: string;
  };
}

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface PlanHistoryEntry {
  id: string;
  timestamp: string;
  userInput: string;
  generatedExercises: Exercise[];
  sources?: string[];
  calmImageUrl?: string;
}

export interface CompletedExerciseLog {
  exerciseId: string;
  exerciseTitle: string;
  completedAt: string;
  rating: FeedbackRating;
}

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  exerciseTitle: string;
  rating: FeedbackRating;
  comments?: string;
}