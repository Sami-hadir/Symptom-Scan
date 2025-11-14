
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = 'symptom-scan-language';

const getInitialLanguage = (): Language => {
  try {
    const storedLang = window.localStorage.getItem(LANGUAGE_KEY);
    if (storedLang) {
      const parsedLang = JSON.parse(storedLang);
      if (['en', 'he', 'ar', 'es', 'fr', 'de'].includes(parsedLang)) {
        return parsedLang;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored language", e);
  }
  
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages: Language[] = ['en', 'he', 'ar', 'es', 'fr', 'de'];
  if (supportedLanguages.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  
  return 'en';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = (language === 'he' || language === 'ar') ? 'rtl' : 'ltr';
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    try {
        window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(lang));
        // By updating the state, we trigger a re-render of all components consuming the context.
        // This is the "React way" to handle such changes, avoiding a full page reload.
        setLanguageState(lang);
    } catch(e) {
        console.error("Failed to persist language. Updating state locally.", e);
        setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
