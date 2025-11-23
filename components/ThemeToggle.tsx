import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        p-2 rounded-xl transition-all duration-300 ease-in-out
        ${theme === 'dark'
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-yellow-400/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'
                }
      `}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="animate-spin-slow" />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
};
