import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface LoadingScreenProps {
    selectedLanguage: Language;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ selectedLanguage }) => {
    const t = getTranslation(selectedLanguage.code);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fdfaf1] transition-opacity duration-1000">
            {/* 3D Book Animation */}
            <div className="relative w-32 h-44 mb-12 perspective-[1000px]">
                <div className="absolute inset-0 bg-[#3a1c1c] rounded-r-lg shadow-2xl transform rotate-y-[-20deg] animate-pulse">
                    <div className="absolute top-4 left-4 right-4 bottom-4 border border-amber-500/30 rounded-r-sm"></div>
                </div>
                <div className="absolute inset-y-1 left-0 w-4 bg-amber-900 rounded-l-sm shadow-inner"></div>
                {/* Pages */}
                <div className="absolute top-2 bottom-2 left-3 right-2 bg-white rounded-r-sm shadow-md animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <span className="text-lg font-gentle text-amber-800/70 animate-in fade-in slide-in-from-bottom-4 duration-1000">{t.titlePrefix}</span>
                <h1 className={`text-4xl ${selectedLanguage.code === 'hi' ? 'md:text-4xl' : 'md:text-5xl'} font-cursive text-amber-900 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100`}>
                    {t.titleMain}
                </h1>
            </div>

            <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-50">
                <div className="w-12 h-1 bg-amber-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 w-1/3 animate-[shimmer_1.5s_infinite_linear]"></div>
                </div>
                <p className="text-[10px] font-sans text-amber-900/40 tracking-widest uppercase">{t.loading}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
