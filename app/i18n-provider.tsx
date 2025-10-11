'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import i18n from '../i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nextProvider({ children }: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      if (!isInitialized && !i18n.isInitialized) {
        await i18n.init();
        setIsInitialized(true);
      } else if (i18n.isInitialized) {
        setIsInitialized(true);
      }
    };

    initI18n();
  }, [isInitialized]);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      console.log('Language changed to:', lng);
      // Force re-render by updating a state
      setIsInitialized(prev => !prev);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const currentLang = i18n.language;
      const pathLang = pathname.split('/')[1];

      if (pathLang && pathLang !== currentLang && ['en', 'pt', 'es', 'fr', 'de'].includes(pathLang)) {
        i18n.changeLanguage(pathLang).then(() => {
          // Force re-render of all components after language change
          setTimeout(() => {
            window.location.reload();
          }, 100);
        });
      }
    }
  }, [pathname, isInitialized]);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <ReactI18nextProvider i18n={i18n}>
      {children}
    </ReactI18nextProvider>
  );
}