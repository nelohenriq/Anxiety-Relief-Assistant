import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'pt-pt', // Set Portuguese Portugal as default language
    fallbackLng: 'en', // Fallback to English if translation not found
    supportedLngs: ['en', 'pt-pt', 'es', 'fr', 'de'], // Explicitly support all languages

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Fallback resources in case backend fails to load
    resources: {
      en: {
        translation: {
          app: {
            title: 'Anxiety Relief Assistant',
            subtitle: 'Your personal AI-powered companion for anxiety relief and mental wellness'
          },
          ollama: {
            status: 'Ollama Status',
            checking: 'Checking Ollama status...',
            healthy: 'Ollama is running',
            unhealthy: 'Ollama is not accessible',
            no_models: 'Ollama running - no models installed',
            models: 'Available models:',
            retry: 'Retry',
            description: 'Ollama is required for AI-powered features like personalized exercises and journal analysis.'
          },
          symptom_categories: {
            physical: 'Physical',
            cognitive: 'Cognitive',
            mood: 'Mood',
            behavioral: 'Behavioral',
            physical_full: 'Physical Symptoms',
            cognitive_full: 'Cognitive Symptoms',
            mood_full: 'Mood Symptoms',
            behavioral_full: 'Behavioral Symptoms'
          }
        }
      },
      es: {
        translation: {
          symptom_categories: {
            physical_full: 'Síntomas Físicos',
            cognitive_full: 'Síntomas Cognitivos',
            mood_full: 'Síntomas Anímicos',
            behavioral_full: 'Síntomas Conductuales'
          }
        }
      },
      fr: {
        translation: {
          symptom_categories: {
            physical_full: 'Symptômes Physiques',
            cognitive_full: 'Symptômes Cognitifs',
            mood_full: 'Symptômes d\'Humeur',
            behavioral_full: 'Symptômes Comportementaux'
          }
        }
      },
      de: {
        translation: {
          symptom_categories: {
            physical_full: 'Körperliche Symptome',
            cognitive_full: 'Kognitive Symptome',
            mood_full: 'Stimmungssymptome',
            behavioral_full: 'Verhaltenssymptome'
          }
        }
      },
      'pt-pt': {
        translation: {
          app: {
            title: 'Assistente de Alívio da Ansiedade',
            subtitle: 'Seu companheiro pessoal alimentado por IA para alívio da ansiedade e bem-estar mental'
          },
          ollama: {
            status: 'Status do Ollama',
            checking: 'Verificando status do Ollama...',
            healthy: 'Ollama está funcionando',
            unhealthy: 'Ollama não está acessível',
            no_models: 'Ollama funcionando - nenhum modelo instalado',
            models: 'Modelos disponíveis:',
            retry: 'Tentar novamente',
            description: 'Ollama é necessário para recursos alimentados por IA como exercícios personalizados e análise de diário.'
          },
          symptom_categories: {
            physical: 'Físicos',
            cognitive: 'Cognitivos',
            mood: 'De Humor',
            behavioral: 'Comportamentais',
            physical_full: 'Sintomas Físicos',
            cognitive_full: 'Sintomas Cognitivos',
            mood_full: 'Sintomas de Humor',
            behavioral_full: 'Sintomas Comportamentais'
          }
        }
      }
    },

    ns: ['translation'],
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;