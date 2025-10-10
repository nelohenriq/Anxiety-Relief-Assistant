// Quick script to reset LLM provider to Gemini
// Run this in your browser's console on the app page

// Check current provider setting
const currentProvider = localStorage.getItem('llmProvider');
console.log('Current provider setting:', currentProvider ? JSON.parse(currentProvider) : 'not set');

// Option 1: Reset just the provider to Gemini
localStorage.setItem('llmProvider', JSON.stringify('gemini'));
console.log('✅ Provider reset to Gemini!');

// Option 2: If you want to clear all app data and start fresh (more drastic)
const keysToRemove = [
    'userProfile', 'consentLevel', 'exerciseFeedback', 'planHistory',
    'journalEntries', 'theme', 'reminderSettings', 'thoughtRecords',
    'activeProgramId', 'programProgress', 'exerciseHistory', 'moodLogs',
    'feedbackHistory', 'interactionLog', 'llmProvider', 'ollamaModel',
    'ollamaCloudApiKey', 'hasCompletedOnboarding'
];

keysToRemove.forEach(key => localStorage.removeItem(key));
localStorage.setItem('llmProvider', JSON.stringify('gemini'));
console.log('✅ All data cleared and provider reset to Gemini!');

console.log('Please refresh the page for changes to take effect.');