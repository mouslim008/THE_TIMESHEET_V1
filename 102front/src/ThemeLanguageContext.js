import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, interpolate } from './translations';

const ThemeLanguageContext = createContext(null);

const STORAGE_THEME = 'tm_theme';
const STORAGE_LANG = 'tm_lang';

export function ThemeLanguageProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_THEME) || 'light';
        } catch {
            return 'light';
        }
    });
    const [language, setLanguageState] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_LANG) || 'en';
        } catch {
            return 'en';
        }
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem(STORAGE_THEME, theme);
        } catch {
            /* ignore */
        }
    }, [theme]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_LANG, language);
        } catch {
            /* ignore */
        }
    }, [language]);

    const setTheme = (next) => {
        setThemeState(next === 'dark' ? 'dark' : 'light');
    };

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setLanguage = (lang) => {
        if (lang === 'fr' || lang === 'en') setLanguageState(lang);
    };

    const t = useMemo(() => {
        return (key, vars) => {
            const dict = translations[language] || translations.en;
            const raw = dict[key] ?? translations.en[key] ?? key;
            return vars ? interpolate(raw, vars) : raw;
        };
    }, [language]);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            language,
            setLanguage,
            t,
        }),
        [theme, language, t]
    );

    return <ThemeLanguageContext.Provider value={value}>{children}</ThemeLanguageContext.Provider>;
}

export function useThemeLanguage() {
    const ctx = useContext(ThemeLanguageContext);
    if (!ctx) {
        throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
    }
    return ctx;
}
