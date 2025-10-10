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
      if (!isInitialized) {
        await i18n.init();
        setIsInitialized(true);
      }
    };

    initI18n();
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const currentLang = i18n.language;
      const pathLang = pathname.split('/')[1];

      if (pathLang && pathLang !== currentLang) {
        i18n.changeLanguage(pathLang);
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