'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import LanguageManager from '@/components/language-manager';
import { ReactNode } from 'react';

export default function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
        <LanguageManager>
            {children}
        </LanguageManager>
    </I18nextProvider>
  );
}
