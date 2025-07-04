'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { styles } from '@/lib/styles';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return '🌗';
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System';
    }
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={handleThemeChange}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover-lift hover-glow group ${styles.button.secondary}`}
      title={`Current: ${getLabel()} mode. Click to cycle through light/dark/system.`}
    >
      <span className="text-lg transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12">{getIcon()}</span>
      <span className="hidden sm:block text-sm group-hover:text-foreground transition-colors duration-200">{getLabel()}</span>
    </button>
  );
}