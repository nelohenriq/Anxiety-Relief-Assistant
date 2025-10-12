'use client';

import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface I18nProviderProps {
  children: React.ReactNode;
}

const LanguageUpdater = ({ children }: I18nProviderProps) => {
    const { i18n } = useTranslation();
    useEffect(() => {
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return <>{children}</>;
}


export function I18nextProvider({ children }: I18nProviderProps) {
  return (
    <ReactI18nextProvider i18n={i18n}>
      <LanguageUpdater>
        {children}
      </LanguageUpdater>
    </ReactI18nextProvider>
  );
}
