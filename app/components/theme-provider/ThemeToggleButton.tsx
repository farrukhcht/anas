'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('ThemeToggleButton clicked, current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 mx-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 active:scale-95 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      type="button"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute h-5 w-5 text-amber-500 transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
          aria-hidden="true"
        />
        <Moon 
          className={`absolute h-5 w-5 text-indigo-600 transition-all duration-300 ${
            theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
          }`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
} 