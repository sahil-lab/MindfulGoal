import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector: React.FC = () => {
    const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
    const btnRef = useRef<HTMLButtonElement | null>(null);

    const themeIcons: Record<string, string> = {
        zen: '🧘',
        forest: '🌲',
        ocean: '🌊',
        sunset: '🌅',
        lavender: '🌸',
        rose: '🌹',
        midnight: '🌙',
        aurora: '🌌',
        desert: '🏜️',
        glacier: '🧊',
        cherry: '🌸',
        emerald: '💎',
        cosmic: '✨',
        golden: '☀️',
        storm: '⛈️',
        coral: '🪸',
        mint: '🌿',
        sapphire: '💙',
        ruby: '❤️',
        lime: '🍋',
        amethyst: '💜',
        peach: '🍑',
        turquoise: '🐚',
        bronze: '🥉',
        silver: '🌕',
        ivory: '🤍',
        crimson: '🔴',
        navy: '⚓',
        jade: '🟢',
        magenta: '💖',
        topaz: '💛',
        onyx: '⚫',
        aqua: '💧',
        plum: '🟣',
        champagne: '🥂',
        steel: '⚔️',
        maroon: '🍷',
        olive: '🫒',
        indigo: '🔵',
        rust: '🦀',
        teal: '🌊',
        vanilla: '🍦',
        charcoal: '⚫',
        blush: '🌺',
        sage: '🍃'
    };

    const updatePosition = () => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (!rect) return;
        setCoords({
            top: rect.bottom + 8, // 8px gap
            left: rect.left,
            width: rect.width,
        });
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen]);

    const handleThemeSelect = (newTheme: string) => {
        setTheme(newTheme);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-xl
          ${currentTheme.surface} ${currentTheme.border} border
          ${currentTheme.text} hover:scale-105 transition-all duration-300
          ${currentTheme.shadow} hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50
        `}
            >
                <span className="text-xs">{themeIcons[themeName]}</span>
                <span className="font-medium whitespace-nowrap">{currentTheme.name}</span>
                <svg
                    className={`w-2.5 h-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[9998] cursor-default"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div
                        style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
                        className={`fixed z-[9999] w-64 ${currentTheme.surface} ${currentTheme.border} border
                          rounded-xl shadow-zen-lg backdrop-blur-xl animate-in slide-in-from-top-2 duration-200`}
                    >
                        <div className="p-2 max-h-[60vh] overflow-y-auto">
                            <div className={`px-3 py-2 ${currentTheme.textSecondary} text-sm font-medium border-b border-current/10 mb-2`}>Choose Your Sanctuary</div>

                            {availableThemes.map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => handleThemeSelect(theme)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left
                                      ${theme === themeName ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg` : `${currentTheme.text} hover:bg-gradient-to-r hover:${currentTheme.gradient} hover:scale-[1.02]`}
                                    `}
                                >
                                    <span className="text-xl">{themeIcons[theme]}</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm truncate">{themes[theme]?.name}</div>
                                        <div className={`text-xs opacity-70 ${theme === themeName ? 'text-white/80' : currentTheme.textSecondary}`}>{getThemeDescription(theme)}</div>
                                    </div>
                                    {theme === themeName && <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

function getThemeDescription(theme: string): string {
    const descriptions: Record<string, string> = {
        zen: 'Peaceful blue & purple harmony',
        forest: 'Nature\'s green tranquility',
        ocean: 'Deep cyan & blue serenity',
        sunset: 'Warm orange & rose glow',
        lavender: 'Dreamy purple elegance',
        rose: 'Gentle pink & rose beauty',
        midnight: 'Dark mysterious elegance',
        aurora: 'Magical northern lights',
        desert: 'Warm sandy golden tones',
        glacier: 'Cool icy blue freshness',
        cherry: 'Delicate blossom pink',
        emerald: 'Rich forest green luxury',
        cosmic: 'Deep space purple mystery',
        golden: 'Bright sunny warmth',
        storm: 'Dramatic gray power',
        coral: 'Vibrant reef orange',
        mint: 'Fresh cool green breeze',
        sapphire: 'Deep royal blue elegance',
        ruby: 'Passionate red fire',
        lime: 'Zesty bright green energy',
        amethyst: 'Royal purple crystal',
        peach: 'Soft sunset warmth',
        turquoise: 'Tropical water blue',
        bronze: 'Warm metallic glow',
        silver: 'Cool moonlight shine',
        ivory: 'Pure creamy elegance',
        crimson: 'Bold passionate red',
        navy: 'Classic deep blue',
        jade: 'Ancient green wisdom',
        magenta: 'Vibrant pink energy',
        topaz: 'Golden yellow brilliance',
        onyx: 'Sleek dark sophistication',
        aqua: 'Crystal clear freshness',
        plum: 'Rich velvet purple',
        champagne: 'Elegant bubbly gold',
        steel: 'Strong blue metal',
        maroon: 'Deep wine richness',
        olive: 'Earthy green peace',
        indigo: 'Midnight blue depth',
        rust: 'Warm copper earth',
        teal: 'Balanced blue-green',
        vanilla: 'Sweet creamy comfort',
        charcoal: 'Sophisticated gray',
        blush: 'Soft romantic pink',
        sage: 'Wise green serenity'
    };
    return descriptions[theme] || '';
}

// Import themes for local use
import { themes } from '../contexts/ThemeContext';

export default ThemeSelector; 