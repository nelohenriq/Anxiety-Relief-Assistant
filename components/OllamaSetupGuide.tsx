'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';

interface GroqSetupGuideProps {
  language?: string;
  provider?: 'groq' | 'ollama';
}

interface DiagnosticResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  suggestions: string[];
}

export default function AISetupGuide({ language = 'en', provider = 'groq' }: GroqSetupGuideProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [setupInstructions, setSetupInstructions] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const apiBase = provider === 'groq' ? '/api/groq' : '/api/ollama';
        const [diagResponse, setupResponse] = await Promise.all([
          fetch(`${apiBase}/models?action=diagnose&language=${language}`),
          fetch(`${apiBase}/models?action=setup-instructions&language=${language}`)
        ]);

        if (diagResponse.ok) {
          const diagData = await diagResponse.json();
          setDiagnostics(diagData);
        }

        if (setupResponse.ok) {
          const setupData = await setupResponse.json();
          setSetupInstructions(setupData.instructions);
        }
      } catch (error) {
        console.error(`Failed to fetch ${provider} diagnostics:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, [language, provider]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProviderName = () => {
    return provider === 'groq' ? 'Groq' : 'Ollama Cloud';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{getProviderName()} Setup Guide</h3>
        {diagnostics && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(diagnostics.status)}`}>
            {diagnostics.message}
          </span>
        )}
      </div>

      {diagnostics && diagnostics.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Suggestions:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {diagnostics.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium">Setup Instructions:</h4>
        <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded">
          {setupInstructions}
        </div>
      </div>
    </Card>
  );
}