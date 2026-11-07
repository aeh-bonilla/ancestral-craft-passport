import { createInstance } from 'i18next';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useEffect, useState, type ReactNode } from 'react';
import catalog from './catalog.json';
import { useHydrated } from '@tanstack/react-router';

export const languages = ['es', 'en', 'zh-CN'] as const;
export type Language = typeof languages[number];
export function validLanguage(value: unknown): Language {
  return languages.includes(value as Language) ? value as Language : 'es';
}
export function createTranslations() {
  const resources = Object.fromEntries(languages.map((language, index) => [language, { translation: Object.fromEntries(Object.entries(catalog).map(([key, values]) => [key, index === 0 ? key : values[index - 1]])) }]));
  const instance = createInstance();
  void instance.init({ lng: 'es', fallbackLng: 'es', resources, initAsync: false, keySeparator: false, nsSeparator: false, interpolation: { escapeValue: false }, returnNull: false });
  return instance;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(createTranslations);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('tlamatik-language'); } catch { /* Storage is optional. */ }
    void instance.changeLanguage(validLanguage(saved));
    const sync = (language: string) => { document.documentElement.lang = validLanguage(language); };
    sync(instance.language);
    instance.on('languageChanged', sync);
    return () => { instance.off('languageChanged', sync); };
  }, [instance]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

export function useI18n() {
  const { t: translate, i18n } = useTranslation();
  const hydrated = useHydrated();
  const language = hydrated ? validLanguage(i18n?.language) : 'es';
  const t = (text: string | null | undefined, params?: Record<string, unknown>) => text ? String(translate(text, { ...params, lng: language })) : '';
  const setLanguage = (value: string) => {
    const next = validLanguage(value);
    void i18n.changeLanguage(next);
    try { localStorage.setItem('tlamatik-language', next); } catch { /* Storage is optional. */ }
  };
  const locale = language === 'es' ? 'es-MX' : language === 'en' ? 'en-US' : 'zh-CN';
  const money = (amount: number, decimals = 0) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'MXN', currencyDisplay: 'code', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
  return { t, language, setLanguage, locale, money };
}