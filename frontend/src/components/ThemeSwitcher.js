import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
    const { theme, toggleTheme, THEME_MODES } = useTheme();

    return (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
            <button
                onClick={() => toggleTheme(THEME_MODES.LIGHT)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === THEME_MODES.LIGHT
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-label="Light Mode"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>
            <button
                onClick={() => toggleTheme(THEME_MODES.DARK)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === THEME_MODES.DARK
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-label="Dark Mode"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            </button>
        </div>
    );
};

export default ThemeSwitcher; 