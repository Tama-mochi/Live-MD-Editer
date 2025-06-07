
import React from 'react';
import { Theme } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
      aria-label={theme === Theme.LIGHT ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === Theme.LIGHT ? (
        <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
