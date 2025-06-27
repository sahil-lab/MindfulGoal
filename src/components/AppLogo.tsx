import React from 'react';

interface AppLogoProps {
    size?: number;
    className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 64, className = '' }) => {
    return (
        <img
            src="/assets/logotracker.png"
            alt="Mindful Goals Logo"
            width={size}
            height={size}
            className={`${className} object-contain`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
        />
    );
};

export default AppLogo; 