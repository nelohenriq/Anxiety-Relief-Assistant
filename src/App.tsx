import React from 'react';
import { useTranslation } from 'react-i18next';
import { OllamaHealthCheck } from './components/OllamaHealthCheck';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('app.title', 'Anxiety Relief Assistant')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('app.subtitle', 'Your personal AI-powered companion for anxiety relief and mental wellness')}
          </p>
        </header>

        <main>
          <OllamaHealthCheck />
        </main>
      </div>
    </div>
  );
}

export default App;