import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language } from '../translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['fr']) => string;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    useEffect(() => {
        localStorage.setItem('budgetbud_lang', language);

        // Handle Direction (RTL/LTR)
        const dir = language === 'tn' ? 'rtl' : 'ltr';
        const lang = language === 'tn' ? 'ar-TN' : 'fr-FR';

        document.documentElement.dir = dir;
        document.documentElement.lang = lang;

    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'fr' ? 'tn' : 'fr');
    };

    const t = (key: keyof typeof translations['fr']) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
