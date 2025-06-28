import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColors = {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    gradient: string;
    gradientText: string;
    shadow: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
};

export const themes: Record<string, ThemeColors> = {
    zen: {
        name: 'Zen Mindfulness',
        primary: 'from-blue-500 to-purple-600',
        secondary: 'from-emerald-400 to-cyan-500',
        accent: 'from-pink-400 to-rose-500',
        background: 'from-slate-50 via-blue-50 to-slate-100',
        surface: 'bg-white/80 backdrop-blur-xl',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
        gradient: 'from-blue-500/10 via-purple-500/5 to-emerald-500/10',
        gradientText: 'from-blue-600 via-purple-600 to-pink-600',
        shadow: 'shadow-blue-200/50',
        border: 'border-blue-200/30',
        success: 'from-emerald-400 to-teal-500',
        warning: 'from-amber-400 to-orange-500',
        error: 'from-red-400 to-pink-500',
        info: 'from-blue-400 to-indigo-500'
    },
    forest: {
        name: 'Forest Sanctuary',
        primary: 'from-emerald-500 to-green-600',
        secondary: 'from-teal-400 to-emerald-500',
        accent: 'from-lime-400 to-green-500',
        background: 'from-emerald-50 via-green-50 to-teal-50',
        surface: 'bg-white/85 backdrop-blur-xl',
        text: 'text-emerald-900',
        textSecondary: 'text-emerald-700',
        gradient: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
        gradientText: 'from-emerald-600 via-green-600 to-teal-600',
        shadow: 'shadow-emerald-200/50',
        border: 'border-emerald-200/30',
        success: 'from-green-400 to-emerald-500',
        warning: 'from-yellow-400 to-amber-500',
        error: 'from-red-400 to-rose-500',
        info: 'from-cyan-400 to-teal-500'
    },
    ocean: {
        name: 'Ocean Depths',
        primary: 'from-cyan-500 to-blue-600',
        secondary: 'from-blue-400 to-indigo-500',
        accent: 'from-teal-400 to-cyan-500',
        background: 'from-cyan-50 via-blue-50 to-indigo-50',
        surface: 'bg-white/80 backdrop-blur-xl',
        text: 'text-blue-900',
        textSecondary: 'text-blue-700',
        gradient: 'from-cyan-500/10 via-blue-500/5 to-indigo-500/10',
        gradientText: 'from-cyan-600 via-blue-600 to-indigo-600',
        shadow: 'shadow-cyan-200/50',
        border: 'border-cyan-200/30',
        success: 'from-teal-400 to-cyan-500',
        warning: 'from-amber-400 to-yellow-500',
        error: 'from-red-400 to-pink-500',
        info: 'from-blue-400 to-cyan-500'
    },
    sunset: {
        name: 'Sunset Warmth',
        primary: 'from-orange-500 to-red-600',
        secondary: 'from-pink-400 to-rose-500',
        accent: 'from-yellow-400 to-orange-500',
        background: 'from-orange-50 via-rose-50 to-pink-50',
        surface: 'bg-white/85 backdrop-blur-xl',
        text: 'text-rose-900',
        textSecondary: 'text-rose-700',
        gradient: 'from-orange-500/10 via-rose-500/5 to-pink-500/10',
        gradientText: 'from-orange-600 via-rose-600 to-pink-600',
        shadow: 'shadow-orange-200/50',
        border: 'border-orange-200/30',
        success: 'from-emerald-400 to-green-500',
        warning: 'from-amber-400 to-orange-500',
        error: 'from-red-400 to-rose-500',
        info: 'from-blue-400 to-indigo-500'
    },
    lavender: {
        name: 'Lavender Dreams',
        primary: 'from-purple-500 to-violet-600',
        secondary: 'from-indigo-400 to-purple-500',
        accent: 'from-pink-400 to-purple-500',
        background: 'from-purple-50 via-violet-50 to-indigo-50',
        surface: 'bg-white/80 backdrop-blur-xl',
        text: 'text-purple-900',
        textSecondary: 'text-purple-700',
        gradient: 'from-purple-500/10 via-violet-500/5 to-indigo-500/10',
        gradientText: 'from-purple-600 via-violet-600 to-indigo-600',
        shadow: 'shadow-purple-200/50',
        border: 'border-purple-200/30',
        success: 'from-emerald-400 to-green-500',
        warning: 'from-amber-400 to-yellow-500',
        error: 'from-red-400 to-rose-500',
        info: 'from-indigo-400 to-purple-500'
    },
    rose: {
        name: 'Rose Garden',
        primary: 'from-rose-500 to-pink-600',
        secondary: 'from-pink-400 to-rose-500',
        accent: 'from-fuchsia-400 to-pink-500',
        background: 'from-rose-50 via-pink-50 to-fuchsia-50',
        surface: 'bg-white/85 backdrop-blur-xl',
        text: 'text-rose-900',
        textSecondary: 'text-rose-700',
        gradient: 'from-rose-500/10 via-pink-500/5 to-fuchsia-500/10',
        gradientText: 'from-rose-600 via-pink-600 to-fuchsia-600',
        shadow: 'shadow-rose-200/50',
        border: 'border-rose-200/30',
        success: 'from-emerald-400 to-green-500',
        warning: 'from-amber-400 to-orange-500',
        error: 'from-red-400 to-rose-500',
        info: 'from-blue-400 to-indigo-500'
    }
};

interface ThemeContextType {
    currentTheme: ThemeColors;
    themeName: string;
    setTheme: (themeName: string) => void;
    availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeName, setThemeName] = useState('zen');

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('mindful-goals-theme');
        if (savedTheme && themes[savedTheme]) {
            setThemeName(savedTheme);
        }
    }, []);

    const setTheme = (newThemeName: string) => {
        if (themes[newThemeName]) {
            setThemeName(newThemeName);
            localStorage.setItem('mindful-goals-theme', newThemeName);
        }
    };

    const value: ThemeContextType = {
        currentTheme: themes[themeName],
        themeName,
        setTheme,
        availableThemes: Object.keys(themes)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}; 