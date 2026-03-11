import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'default' | 'footer';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'default' }) => {
    return (
        <div className={`flex items-center gap-4 select-none ${className}`}>
            {/* The Icon: Legendary Winged Emblem */}
            <svg 
                viewBox="0 0 120 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto drop-shadow-lg"
            >
                <defs>
                    {/* Richer, darker gold gradient for a 'Solid Gold' look */}
                    <linearGradient id="legendary-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FBF5B7" />
                        <stop offset="30%" stopColor="#C69C48" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="70%" stopColor="#aa771c" />
                        <stop offset="100%" stopColor="#806921" />
                    </linearGradient>
                    
                    {/* A shine effect for the crest */}
                    <linearGradient id="shine-cut" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* --- Left Wing (Falcon/Speed) --- */}
                {/* 3 Feathers, sharp geometric style */}
                <path 
                    d="M5 45 L45 50 L45 55 L10 55 L5 45 Z" 
                    fill="url(#legendary-gold)" 
                />
                <path 
                    d="M12 35 L48 48 L48 52 L15 42 L12 35 Z" 
                    fill="url(#legendary-gold)" 
                />
                <path 
                    d="M22 25 L50 45 L50 48 L25 30 L22 25 Z" 
                    fill="url(#legendary-gold)" 
                />

                {/* --- Right Wing (Mirrored) --- */}
                <path 
                    d="M115 45 L75 50 L75 55 L110 55 L115 45 Z" 
                    fill="url(#legendary-gold)" 
                />
                <path 
                    d="M108 35 L72 48 L72 52 L105 42 L108 35 Z" 
                    fill="url(#legendary-gold)" 
                />
                <path 
                    d="M98 25 L70 45 L70 48 L95 30 L98 25 Z" 
                    fill="url(#legendary-gold)" 
                />

                {/* --- Center Shield (The Master Badge) --- */}
                <path 
                    d="M60 20 L80 35 L75 75 L60 85 L45 75 L40 35 L60 20 Z" 
                    fill="url(#legendary-gold)" 
                    stroke="#020617"
                    strokeWidth="1"
                />
                
                {/* Shield Shine Overlay */}
                <path 
                    d="M60 20 L80 35 L75 50 L45 50 L40 35 L60 20 Z" 
                    fill="url(#shine-cut)" 
                />

                {/* --- The "M" Monogram (Cutout style) --- */}
                {/* A sharp M inside the shield, navy color to look like a cutout */}
                <path 
                    d="M50 45 L50 65 L55 65 L60 55 L65 65 L70 65 L70 45 L65 45 L65 58 L60 48 L55 58 L55 45 L50 45 Z" 
                    fill="#020617" 
                />
                
                {/* --- The Star (Excellence) --- */}
                <path 
                    d="M60 10 L62 15 L67 16 L63 19 L64 24 L60 21 L56 24 L57 19 L53 16 L58 15 L60 10 Z" 
                    fill="url(#legendary-gold)"
                />

            </svg>

            {/* The Typography - Bold & Official */}
            <div className={`flex flex-col justify-center ${variant === 'footer' ? 'items-start' : 'items-start'}`}>
                <h1 className="font-cinzel text-white tracking-[0.05em] leading-none font-black text-xl sm:text-2xl drop-shadow-lg">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FBF5B7] via-[#d4af37] to-[#aa771c]">
                        MURTADA
                    </span>
                </h1>
                <div className="flex items-center gap-2 w-full mt-1">
                    <span className="h-[1px] w-4 bg-gold-500"></span>
                    <span className="text-[9px] sm:text-[10px] text-slate-300 font-cairo font-bold uppercase tracking-[0.2em]">
                        DUBAI
                    </span>
                    <span className="h-[1px] w-full bg-gradient-to-r from-gold-500 to-transparent"></span>
                </div>
            </div>
        </div>
    );
};