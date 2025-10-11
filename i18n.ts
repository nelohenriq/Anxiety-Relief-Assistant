import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/{{lng}}/translation.json',
      // Add crossDomain option to handle CORS properly
      crossDomain: false,
      // Add request options for Next.js compatibility
      requestOptions: {
        cache: 'default',
      },
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Prevent initialization during SSR
    initImmediate: typeof window !== 'undefined',
  });

export default i18n;