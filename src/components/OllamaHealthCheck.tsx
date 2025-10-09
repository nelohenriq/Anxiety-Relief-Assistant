import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getOllamaModels } from '../../services/providers/ollama';

export const OllamaHealthCheck: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const availableModels = await getOllamaModels();
      setModels(availableModels);
      setIsHealthy(availableModels.length > 0);
    } catch (err) {
      setIsHealthy(false);
      setError(err instanceof Error ? err.message : 'Ollama service not available');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      );
    }
    return isHealthy ? (
      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
    );
  };

  const getStatusText = () => {
    if (isLoading) return t('ollama.checking', 'Checking Ollama status...');
    if (isHealthy && models.length > 0) return t('ollama.healthy', 'Ollama is running');
    if (isHealthy && models.length === 0) return t('ollama.no_models', 'Ollama running - no models installed');
    return t('ollama.unhealthy', 'Ollama is not accessible');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('ollama.status', 'Ollama Status')}
        </h2>
      </div>

      <p className={`text-sm mb-4 ${
        isHealthy
          ? 'text-green-600 dark:text-green-400'
          : isLoading
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-red-600 dark:text-red-400'
      }`}>
        {getStatusText()}
      </p>

      {isHealthy && models.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('ollama.models', 'Available models:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {models.map((model, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {!isHealthy && !isLoading && (
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
        >
          {t('ollama.retry', 'Retry')}
        </button>
      )}

      {isHealthy && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {t('ollama.description', 'Ollama is required for AI-powered features like personalized exercises and journal analysis.')}
        </div>
      )}
    </div>
  );
};