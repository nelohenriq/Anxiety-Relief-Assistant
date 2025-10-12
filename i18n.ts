import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpApi from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    supportedLngs: ['en', 'es', 'fr', 'de', 'pt'],
    fallbackLng: 'en',
    detection: {
      order: ['cookie', 'htmlTag', 'localStorage', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
