
import React from 'react';
import { LogoIcon } from './icons';

interface HeaderProps {
    theme: string;
    onThemeChange: (theme: string) => void;
}

const themes: { [key: string]: string } = {
    'theme-branded': 'Branded',
    'theme-synthwave': 'Synthwave',
    'theme-daylight': 'Daylight',
    'theme-forest': 'Forest',
};

export const Header: React.FC<HeaderProps> = ({ theme, onThemeChange }) => (
  <header className="relative text-center bg-panel-bg/80 rounded-t-xl border-x border-t border-panel-border shadow-lg backdrop-blur-sm h-full flex items-center justify-center">
    <div className="flex justify-center items-center gap-3">
       <LogoIcon className="w-8 h-8 text-accent" />
       <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-accent to-blue-300 text-transparent bg-clip-text">
        mini Music Muse drummAroo
      </h1>
    </div>
    <div className="absolute top-1/2 -translate-y-1/2 right-4">
        <label htmlFor="theme-selector" className="sr-only">Theme Selector</label>
        <select
            id="theme-selector"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="bg-panel-bg border border-panel-border rounded-md py-1 px-2 text-text-secondary focus:ring-2 focus:ring-accent focus:outline-none transition text-sm"
        >
            {Object.entries(themes).map(([value, label]) => (
                <option key={value} value={value} style={{backgroundColor: 'var(--color-brand-bg)', color: 'var(--color-text-primary)'}}>{label}</option>
            ))}
        </select>
    </div>
  </header>
);
