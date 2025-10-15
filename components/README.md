# Components Documentation

This directory contains all the React components for the Serene mental health application. Each component is designed to be reusable, accessible, and follows modern React patterns with TypeScript.

## Recent Updates and New Features

### Progressive Web App (PWA) Support
- **PWARegistration.tsx**: Added Progressive Web App registration with ServiceWorker support
- **sw.js**: ServiceWorker implementation for offline caching and app installation
- **manifest.json**: Web app manifest for PWA installation and metadata

### Enhanced Configuration
- **next.config.js**: Updated with CORS headers for cross-origin isolation and PWA support
- **layout.tsx**: Fixed TypeScript props interface with Readonly wrapper for React 18+ compatibility

### Console Error Fixes
- Fixed ServiceWorker registration 404 errors by creating missing files
- Resolved HTML validation errors by changing `<p>` to `<div>` for subtitle decoration
- Removed deprecated `swcMinify` configuration option
- Added production-only ServiceWorker registration to prevent development interference

### Component Architecture Improvements
- Enhanced error handling and loading states across components
- Improved accessibility with proper ARIA attributes and keyboard navigation
- Better responsive design patterns and mobile optimization

## Component Overview

### Core UI Components

#### [BreathingExercises](./BreathingExercises.tsx)
A component that displays a list of breathing exercises and allows users to start a selected exercise.

**Props:**
- `searchQuery: string` - Search query to filter exercises by name or description

**Features:**
- Randomized exercise selection (shows 3 exercises)
- Search functionality
- Integration with breathing visualizer
- Interaction logging

#### [BreathingVisualizer](./BreathingVisualizer.tsx)
Interactive breathing exercise visualizer with animated circular progress indicator.

**Props:**
- `exercise: BreathingExercise` - The breathing exercise data
- `onClose: () => void` - Callback when exercise is closed

**Features:**
- Animated circular progress indicator
- Step-by-step breathing guidance
- Tooltips for breathing instructions
- Responsive design

#### [CalmImage](./CalmImage.tsx)
Displays calming AI-generated images with loading states.

**Props:**
- `imageUrl: string | null` - URL of the image to display
- `isLoading: boolean` - Loading state indicator

**Features:**
- Skeleton loading animation
- Responsive image display
- Accessibility considerations

### Cognitive and Therapeutic Components

#### [CognitiveTools](./CognitiveTools.tsx)
Main component for cognitive behavioral therapy tools, specifically thought records.

**Props:**
- `searchQuery: string` - Search query for filtering thought record history

**Features:**
- Thought record creation and management
- History tracking with search
- AI-assisted cognitive restructuring
- Local storage persistence

#### [ThoughtRecord](./ThoughtRecord.tsx)
Multi-step wizard for creating cognitive behavioral therapy thought records.

**Props:**
- `onSave: (record: ThoughtRecordEntry) => void` - Save callback
- `onClose: () => void` - Close callback

**Features:**
- 5-step guided process
- Cognitive distortion identification
- AI assistance for challenging thoughts
- Progress tracking

#### [ThoughtRecordHistory](./ThoughtRecordHistory.tsx)
Displays history of completed thought records with search functionality.

**Props:**
- `history: ThoughtRecordEntry[]` - Array of thought record entries
- `searchQuery: string` - Search query for filtering

#### [ThoughtRecordHistoryCard](./ThoughtRecordHistoryCard.tsx)
Individual card component for displaying thought record history entries.

**Props:**
- `entry: ThoughtRecordEntry` - Single thought record entry

### Exercise and Activity Components

#### [ExerciseCard](./ExerciseCard.tsx)
Displays individual exercise information with expandable details and rating system.

**Props:**
- `exercise: Exercise` - Exercise data
- `onFeedback: (id: string, title: string, rating: number) => void` - Feedback callback
- `feedbackRating?: number` - Current rating

**Features:**
- Expandable exercise details
- Star rating system
- Keyboard navigation support
- Accessibility features

#### [ExerciseHistory](./ExerciseHistory.tsx)
Displays user's completed exercise history.

**Props:**
- `history: CompletedExerciseLog[]` - Array of completed exercises

#### [ExerciseHistoryCard](./ExerciseHistoryCard.tsx)
Individual card for exercise history entries with ratings.

**Props:**
- `log: CompletedExerciseLog` - Single exercise log entry

#### [ExerciseIcon](./ExerciseIcon.tsx)
SVG icon component that displays appropriate icons based on exercise categories.

**Props:**
- `category: Exercise['category']` - Exercise category
- `className?: string` - Additional CSS classes

**Supported Categories:**
- Mindfulness, Cognitive, Somatic, Behavioral, Grounding, Interest-Based

### Journaling Components

#### [Journal](./Journal.tsx)
Main journaling interface with entry creation and history display.

**Props:**
- `searchQuery: string` - Search query for filtering entries

**Features:**
- Real-time entry creation
- AI-powered journal analysis
- Search functionality
- Local storage persistence

#### [JournalEntryCard](./JournalEntryCard.tsx)
Individual journal entry display with AI analysis capability.

**Props:**
- `entry: JournalEntry` - Journal entry data

**Features:**
- AI-powered reflection analysis
- Timestamp display
- Expandable analysis results

### Program and Guided Content

#### [GuidedPrograms](./GuidedPrograms.tsx)
Displays available guided programs with progress tracking.

**Props:**
- `searchQuery: string` - Search query for filtering programs

**Features:**
- Program selection and enrollment
- Progress persistence
- Search across program content

#### [ProgramViewer](./ProgramViewer.tsx)
Interactive program viewer with day-by-day progression.

**Props:**
- `program: Program` - Program data
- `progress: ProgramProgress` - Current progress
- `onUpdateProgress: (day: number) => void` - Progress update callback
- `onExit: () => void` - Exit callback

#### [GuidedMeditations](./GuidedMeditations.tsx)
Displays available guided meditations with player integration.

**Props:**
- `searchQuery: string` - Search query for filtering meditations

**Features:**
- Meditation selection
- Search functionality
- Integration with meditation player

#### [MeditationPlayer](./MeditationPlayer.tsx)
Interactive meditation player with step-by-step guidance.

**Props:**
- `meditation: TranslatedMeditation` - Meditation data
- `onClose: () => void` - Close callback

### User Interface and Layout

#### [Header](./Header.tsx)
Main application header with navigation and controls.

**Props:**
- `onOpenProfile: () => void` - Profile modal trigger
- `showBackground: boolean` - Background visibility toggle
- `onOpenCrisisModal: () => void` - Crisis modal trigger
- `searchQuery: string` - Current search query
- `onSearchQueryChange: (query: string) => void` - Search change handler

**Features:**
- Responsive design
- Crisis support access
- Theme toggle integration
- Search bar integration

#### [SearchBar](./SearchBar.tsx)
Global search input component.

**Props:**
- `query: string` - Current search query
- `onQueryChange: (query: string) => void` - Query change handler

#### [LoadingSpinner](./LoadingSpinner.tsx)
Loading indicator component with internationalization.

#### [Disclaimer](./Disclaimer.tsx)
Application disclaimer footer component.

### User Management and Settings

#### [UserProfile](./UserProfile.tsx)
Comprehensive user profile management modal with multiple tabs.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback
- `exerciseHistory: CompletedExerciseLog[]` - User's exercise history
- `feedbackHistory: FeedbackEntry[]` - User's feedback history
- `onSaveFeedback: (feedback: FeedbackEntry) => void` - Feedback save callback

**Tabs:**
- Settings: Language, AI provider, consent, profile data
- History: Exercise completion history
- Feedback: User feedback management

**Features:**
- Multi-language support
- AI provider configuration (Gemini/Ollama)
- Data privacy controls
- Reminder system configuration

#### [FeedbackModal](./FeedbackModal.tsx)
Modal for collecting user feedback and bug reports.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback
- `onSave: (feedback: FeedbackEntry) => void` - Save callback

#### [FeedbackHistory](./FeedbackHistory.tsx)
Displays user's feedback submission history.

**Props:**
- `history: FeedbackEntry[]` - Feedback entries

#### [FeedbackHistoryCard](./FeedbackHistoryCard.tsx)
Individual feedback history card component.

**Props:**
- `entry: FeedbackEntry` - Single feedback entry

### Utility and Interactive Components

#### [Tooltip](./Tooltip.tsx)
Accessible tooltip component with positioning options.

**Props:**
- `text: string` - Tooltip content
- `children: React.ReactElement` - Trigger element
- `position?: 'top' | 'bottom'` - Tooltip position

#### [ThemeToggle](./ThemeToggle.tsx)
Theme switching component (light/dark mode).

#### [PWARegistration](./PWARegistration.tsx)
Progressive Web App registration component with ServiceWorker support and installation prompts.

**Features:**
- ServiceWorker registration for offline functionality
- PWA installation prompts
- Production-only registration to avoid development interference
- Update detection and handling
- Installation state management

#### [ReminderHandler](./ReminderHandler.tsx)
Background service for handling user reminders and notifications.

### Data Input and Selection

#### [SymptomInput](./SymptomInput.tsx)
Main symptom input interface with AI crisis detection.

**Props:**
- `symptoms: string` - Current symptom text
- `setSymptoms: (symptoms: string) => void` - Symptom update callback
- `onSubmit: (e: FormEvent) => void` - Form submission handler
- `isLoading: boolean` - Loading state
- `onCrisisDetect: () => void` - Crisis detection callback

**Features:**
- Crisis keyword detection
- Integration with symptom selector
- Form validation

#### [SymptomSelector](./SymptomSelector.tsx)
Categorized symptom selection interface.

**Props:**
- `onSymptomSelect: (symptom: string) => void` - Selection callback
- `selectedSymptoms: string` - Currently selected symptoms

#### [SymptomCategory](./SymptomCategory.tsx)
Individual symptom category with expandable symptom list.

**Props:**
- `categoryKey: string` - Category identifier
- `symptomKeys: string[]` - Array of symptom keys
- `onSymptomSelect: (symptom: string) => void` - Selection callback
- `selectedSymptoms: string` - Selected symptoms string
- `isInitiallyExpanded?: boolean` - Initial expansion state

### History and Analytics

#### [PlanHistory](./PlanHistory.tsx)
Displays history of generated treatment plans.

**Props:**
- `history: PlanHistoryEntry[]` - Plan history entries

#### [PlanHistoryEntryCard](./PlanHistoryEntryCard.tsx)
Detailed view of individual plan history entries.

**Props:**
- `entry: PlanHistoryEntry` - Single plan entry

**Features:**
- Plan download functionality
- Image overlay viewing
- Source link integration

#### [MoodTracker](./MoodTracker.tsx)
Daily mood tracking interface with chart visualization.

**Props:**
- `searchQuery: string` - Search query (for filtering)

**Features:**
- 5-point mood scale
- 7-day chart visualization
- Local storage persistence

#### [MoodChart](./MoodChart.tsx)
Chart component for visualizing mood tracking data.

**Props:**
- `logs: MoodLog[]` - Array of mood log entries

### Crisis and Support

#### [CrisisModal](./CrisisModal.tsx)
Emergency crisis support modal with localized hotline information.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback

**Features:**
- Localized crisis hotline data
- Phone/web link support
- Accessible design

### Live Features

#### [LiveCoach](./LiveCoach.tsx)
Placeholder component for future live coaching features.

**Props:**
- `searchQuery: string` - Search query for filtering

#### [ForYouCard](./ForYouCard.tsx)
Personalized suggestion card with AI-generated content.

**Props:** None (uses context)

**Features:**
- AI-powered personalized suggestions
- Consent-level aware rendering
- Error handling and loading states

## Shared Patterns and Conventions

### Accessibility
- All interactive elements include proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Internationalization
- All user-facing text uses `useTranslation` hook
- Consistent translation key patterns
- Language-aware date/time formatting

### State Management
- Local storage integration via `useLocalStorage` hook
- Context-based global state (user preferences, theme)
- Proper state synchronization

### Styling
- Tailwind CSS for consistent design system
- Dark mode support throughout
- Responsive design patterns
- Animation and transition consistency

### Error Handling
- Graceful error states
- User-friendly error messages
- Loading state management
- Fallback UI components

### Performance
- Memoization where appropriate (`useMemo`, `useCallback`)
- Efficient re-rendering patterns
- Lazy loading considerations
- Bundle size optimization

## Dependencies

### External Libraries
- `react`: Core React functionality
- `react-i18next`: Internationalization
- `react-router-dom`: Navigation (implied)
- `@heroicons/react`: Icon components
- `date-fns`: Date utilities (implied)
- `next/font/google`: Google Fonts integration (Inter font)

### Internal Dependencies
- `../types`: TypeScript type definitions
- `../services/*`: API and utility services
- `../data/*`: Static data files
- `../hooks/*`: Custom React hooks
- `../context/*`: React context providers

### PWA Dependencies
- ServiceWorker API: Native browser API for offline functionality
- Web App Manifest: JSON configuration for PWA installation
- Cross-Origin policies: Headers for secure resource loading

## Testing Considerations

Each component should be tested for:
- Rendering correctness
- User interaction handling
- Accessibility compliance
- Error state handling
- Internationalization support
- Responsive behavior
- Performance implications

## Recent Technical Improvements

### Progressive Web App (PWA) Features
- **ServiceWorker Implementation**: Added `sw.js` for offline caching and background sync
- **Web App Manifest**: Created `manifest.json` for PWA installation and metadata
- **Installation Prompts**: Users can now install the app on mobile devices and desktops
- **Offline Support**: Basic caching implemented for improved offline experience

### Configuration Enhancements
- **Next.js Configuration**: Updated `next.config.js` with CORS headers for cross-origin isolation
- **TypeScript Compatibility**: Fixed React 18+ compatibility issues in layout components
- **Build Optimization**: Removed deprecated configuration options for cleaner builds

### Console Error Resolution
- **ServiceWorker 404 Fix**: Resolved registration errors by creating missing PWA files
- **HTML Validation**: Fixed nested element issues in page layout
- **Development Optimization**: ServiceWorker registration now only occurs in production
- **Cross-Origin Issues**: Added proper CORS headers for external resource loading

### Component Architecture
- **Enhanced Error Handling**: Improved error states and user feedback across components
- **Accessibility Improvements**: Better ARIA attributes and keyboard navigation support
- **Responsive Design**: Enhanced mobile and tablet experience
- **Performance Optimization**: Better loading states and component lifecycle management

## Future Enhancements

Potential areas for improvement:
- Component composition patterns
- Performance optimization
- Advanced accessibility features
- Animation enhancements
- Enhanced Progressive Web App features
- Advanced offline functionality
- Push notifications integration
- App update management