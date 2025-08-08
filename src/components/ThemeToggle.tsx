import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import IconButton from './ui/IconButton';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      icon={
        <div className="relative">
          {/* Sun/Moon Icon */}
          <div className={`transition-all duration-500 ease-in-out ${
            theme === 'dark' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
          }`}>
            <Moon className="h-5 w-5" />
          </div>
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            theme === 'light' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
          }`}>
            <Sun className="h-5 w-5" />
          </div>
          
          {/* Solar Effect Ring */}
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-400 to-purple-500 scale-0 opacity-0' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 scale-100 opacity-20'
          }`} />
        </div>
      }
      variant="ghost"
      size="md"
      onClick={toggleTheme}
      className="relative overflow-hidden group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Solar Effect Background */}
      <div className={`absolute inset-0 rounded-lg transition-all duration-700 ease-in-out ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 scale-0 opacity-0'
          : 'bg-gradient-to-r from-yellow-100/50 to-orange-100/50 scale-100 opacity-0 group-hover:opacity-100'
      }`} />
    </IconButton>
  );
};

export default ThemeToggle;
