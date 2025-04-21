import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark'
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(THEME_MODES.LIGHT);

    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && THEME_MODES[savedTheme.toUpperCase()]) {
            setTheme(savedTheme.toLowerCase());
            document.documentElement.dataset.theme = savedTheme.toLowerCase();
            return;
        }

        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        setTheme(systemTheme);
        document.documentElement.dataset.theme = systemTheme;
    }, []);

    // Apply theme
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const value = {
        theme,
        toggleTheme,
        THEME_MODES
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 