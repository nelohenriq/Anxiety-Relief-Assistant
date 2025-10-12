import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple English translations fallback
const enTranslations = {
  header: {
    title: "Serene",
    settings_aria_label: "Open user profile and settings",
    crisis_support_aria_label: "Open crisis support resources"
  },
  home: {
    title: "Welcome back, Sarah",
    subtitle: "Your calm and centered space awaits.",
    how_are_you_feeling: "How are you feeling today?",
    recommended_for_you: "Recommended for you",
    get_personalized_exercises: "Get Personalized Exercises",
    generating_exercises: "Generating Exercises..."
  },
  activities: {
    guided_meditation: "Guided Meditation",
    meditation_desc: "Find peace and focus with our guided meditations.",
    journaling_prompts: "Journaling Prompts",
    journal_desc: "Explore your thoughts and feelings with our prompts.",
    breathing_exercises: "Breathing Exercises",
    breathing_desc: "Relax and center yourself with our breathing exercises."
  },
  search: {
    placeholder: "Search exercises, entries, programs...",
    aria_label: "Search all content"
  },
  theme_toggle: {
    aria_label_light: "Switch to light mode",
    aria_label_dark: "Switch to dark mode"
  },
  user_profile: {
    title: "Profile & Settings",
    cancel_button: "Cancel",
    save_button: "Save Changes",
    language_title: "Language",
    ai_provider_title: "AI Provider",
    provider_label: "Provider",
    consent_title: "Data Consent",
    consent_subtitle: "Higher consent levels allow the AI to generate more personalized exercises using the profile data you provide below.",
    consent_essential: "Essential: No personalization. Profile is disabled.",
    consent_enhanced: "Enhanced: Enables personalization with non-sensitive data.",
    consent_complete: "Complete: Enables full personalization with all available fields.",
    form_disabled_message: "Personalization is disabled. To enable it, please select an enhanced data consent level.",
    reminders_title: "Daily Reminders",
    reminders_enable_label: "Enable Reminders",
    reminders_time_label: "Reminder Time",
    reminders_type_label: "Reminder Type",
    reminders_type_options: {
      gentle: "Gentle Reminder",
      motivational: "Motivational Quote"
    },
    feedback_title: "Help Us Improve",
    feedback_subtitle: "Have a suggestion or found a bug? Let us know!",
    provide_feedback_button: "Provide Feedback",
    data_privacy_title: "Data & Privacy",
    data_privacy_subtitle: "All of your data (profile, history, journal) is stored exclusively on your device's local storage. Deleting your data is permanent and cannot be undone.",
    clear_data_button: "Clear My Data...",
    clear_data_confirm_title: "Are you sure?",
    clear_data_confirm_body: "This will permanently delete all your entries and profile information.",
    clear_data_confirm_button: "Yes, delete everything",
    download_log_button: "Download Interaction Log",
    download_log_subtitle: "Download a log of your interactions for debugging purposes.",
    about_you_title: "About You",
    age_label: "Age",
    location_label: "Location",
    location_placeholder: "City, State/Country",
    wellness_profile_title: "Wellness Profile",
    sleep_label: "Average hours of sleep per night",
    caffeine_label: "Daily caffeine intake",
    caffeine_options: {
      none: "None",
      low: "Low (1-2 cups)",
      moderate: "Moderate (3-4 cups)",
      high: "High (5+ cups)"
    },
    interests_title: "Interests & Hobbies",
    interests_placeholder: "Programming languages and AI",
    conditions_label: "Medical Conditions",
    conditions_placeholder: "Any diagnosed conditions that may affect your mental health...",
    conditions_help_text: "This information helps us provide more relevant exercise recommendations.",
    lifestyle_title: "Lifestyle",
    work_env_label: "Work Environment",
    work_env_options: {
      office: "Office",
      remote: "Remote",
      student: "Student",
      outdoors_manual: "Outdoors/Manual Labor",
      other: "Other"
    },
    nature_access_label: "Access to Nature",
    nature_access_options: {
      yes: "Yes, regular access",
      limited: "Limited access",
      no: "No access"
    },
    activity_level_label: "Physical Activity Level",
    activity_level_options: {
      sedentary: "Sedentary",
      lightly_active: "Lightly Active",
      moderately_active: "Moderately Active",
      very_active: "Very Active"
    },
    coping_styles_label: "Current Coping Strategies",
    coping_styles_placeholder: "What techniques or activities help you manage stress?",
    learning_style_label: "Preferred Learning Style",
    learning_style_options: {
      visual: "Visual",
      auditory: "Auditory",
      kinesthetic: "Kinesthetic"
    },
    ollama_cloud_api_key_label: "Ollama Cloud API Key",
    ollama_cloud_api_key_placeholder: "Enter your Ollama Cloud API key",
    ollama_cloud_api_key_helper: "Get your API key from ollama.ai",
    ollama_model_label: "Ollama Model",
    ollama_model_helper: "Select your preferred Ollama model",
    ollama_status_testing: "Testing connection...",
    ollama_test_connection_tooltip: "Test connection to Ollama services",
    reminders_permission_denied: "Notifications are blocked. Please enable them in your browser settings.",
    close_aria_label: "Close profile modal"
  },
  feedback_modal: {
    title: "Provide Feedback",
    type_label: "Feedback Type",
    types: {
      suggestion: "Suggestion",
      bug: "Bug Report",
      general: "General Feedback"
    },
    message_label: "Message",
    message_placeholder: "Please provide as much detail as possible...",
    submit_button: "Submit Feedback",
    submitted_message: "Thank you!"
  },
  crisis_modal: {
    title: "It sounds like you're going through a lot.",
    body: "If you are in distress or immediate danger, please reach out for help. You are not alone.",
    cta_button_call: "Call {{name}} ({{number}})",
    cta_button_web: "Visit {{name}}",
    close_button: "Close this window"
  },
  exercise_history: {
    title: "Completed Exercise History",
    empty_state: "You haven't completed any exercises yet. Your history will appear here once you rate an exercise.",
    completed_on: "Completed On",
    your_rating: "Your Rating"
  },
  feedback_history: {
    title: "My Feedback History",
    empty_state: "You haven't submitted any feedback yet. Your submissions will be logged here."
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        translation: enTranslations
      }
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Prevent initialization during SSR
    initImmediate: typeof window !== 'undefined',
  });

export default i18n;