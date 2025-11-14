
import React, { useState, useEffect, useRef } from 'react';
import { Screen, Language } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-slate-500 hover:bg-primary-light hover:text-white'
    }`}
  >
    {children}
  </button>
);

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: { code: Language; name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'he', name: 'עברית' },
        { code: 'ar', name: 'العربية' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
    ];

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode); // This function from the context now handles saving and reloading.
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors flex items-center"
            >
                <ion-icon name="globe-outline" class="align-middle text-lg mr-1 rtl:ml-1 rtl:mr-0"></ion-icon>
                <span className="hidden md:inline">{languages.find(l => l.code === language)?.name}</span>
                 <ion-icon name="chevron-down-outline" class="text-xs ml-1 rtl:mr-1 rtl:ml-0 hidden md:inline"></ion-icon>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-36 bg-white rounded-md shadow-lg border border-slate-200 z-10 start-0">
                    <ul className="py-1">
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full text-start px-4 py-2 text-sm ${language === lang.code ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onNavigate, currentScreen }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer" onClick={() => onNavigate(Screen.Home)}>
          <LogoIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-slate-800">
            Symptom<span className="text-primary">Scan</span>
          </h1>
        </div>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <NavLink onClick={() => onNavigate(Screen.Home)} isActive={currentScreen === Screen.Home}>{t('home')}</NavLink>
          <NavLink onClick={() => onNavigate(Screen.Scan)} isActive={currentScreen === Screen.Scan}>{t('newScan')}</NavLink>
          <NavLink onClick={() => onNavigate(Screen.History)} isActive={currentScreen === Screen.History}>{t('history')}</NavLink>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default Header;
