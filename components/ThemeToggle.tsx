'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Contrast } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-4 bg-white border-2 border-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all z-50 focus:outline-none focus:ring-4 focus:ring-indigo-500"
      aria-label={theme === 'light' ? 'Switch to high contrast mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'High Contrast Mode' : 'Light Mode'}
    >
      <Contrast 
        className={`w-6 h-6 ${theme === 'high-contrast' ? 'text-yellow-600' : 'text-gray-900'}`}
        aria-hidden="true"
      />
      <span className="sr-only">
        {theme === 'light' ? 'Switch to high contrast mode' : 'Switch to light mode'}
      </span>
    </button>
  );
}
