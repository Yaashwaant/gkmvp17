import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

type Language = 'en' | 'hi' | 'mr';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en,
  hi,
  mr,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('greenkarma-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi' || savedLanguage === 'mr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('greenkarma-language', lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    // Replace variables in the string
    if (variables) {
      return Object.entries(variables).reduce((str, [varKey, varValue]) => {
        return str.replace(`{${varKey}}`, String(varValue));
      }, value);
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
