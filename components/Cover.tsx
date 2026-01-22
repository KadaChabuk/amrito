
import React, { useState, useEffect } from 'react';
import { LANGUAGES, Language } from '../types';
import { getTranslation } from '../translations';

interface CoverProps {
  onOpen: () => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const Cover: React.FC<CoverProps> = ({ onOpen, selectedLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const t = getTranslation(selectedLanguage.code);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onOpen();
      }, 500);
    }, 1200);
  };

  const portraitUrl = "/images/cover.jpg";
  const fallbackUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1a0f0f] overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent"></div>
      </div>

      <div
        className={`book-container relative flex transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) 
          ${isMounted ? (isExiting ? 'opacity-0 scale-[1.05] translate-y-[-20px]' : 'opacity-100 scale-100 translate-y-0') : 'opacity-0 scale-90 translate-y-8'}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Book Spine - Cleaner & Thinner */}
        <div className="relative z-30 w-8 md:w-12 h-[80vh] max-h-[600px] bg-[#2d1b1b] shadow-[inset_-2px_0_10px_rgba(0,0,0,0.5),-10px_5px_20px_rgba(0,0,0,0.4)] rounded-l-[3px] border-r border-black/40 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-y-0 left-1 w-1 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="h-full py-10 flex flex-col items-center justify-between pointer-events-none select-none opacity-70">
            <div className="w-px h-16 bg-amber-600/40"></div>
            <div className="flex flex-col items-center gap-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <span className="text-amber-500/90 font-cursive font-bold text-[10px] md:text-[14px] tracking-wide whitespace-nowrap">{t.spineText}</span>
            </div>
            <div className="w-px h-16 bg-amber-600/40"></div>
          </div>
        </div>

        {/* Book Body */}
        <div className="relative w-[85vw] max-w-[440px] h-[80vh] max-h-[600px]">
          {/* Internal Page (Visible when cover opens) */}
          <div className="absolute inset-0 bg-[#fdfaf1] shadow-xl rounded-r-[3px] p-8 flex flex-col justify-center items-center text-center paper-texture border-l border-stone-200">
            <h1 className="flex flex-col items-center gap-2 text-stone-800 leading-tight">
              <span className="font-gentle text-lg text-amber-900/60 tracking-wider">{t.titlePrefix}</span>
              <span className={`text-4xl md:text-5xl font-cursive text-amber-900 drop-shadow-sm`}>{t.titleMain}</span>
            </h1>
            <div className="mt-8 w-1 h-12 bg-amber-900/20"></div>
          </div>

          <div
            onClick={!isOpen ? handleOpen : undefined}
            className={`book-cover absolute inset-0 rounded-r-[3px] bg-[#2d1b1b] shadow-[10px_10px_30px_rgba(0,0,0,0.6)] flex flex-col items-center p-6 md:p-8 border-l border-black/40 overflow-hidden ${isOpen ? 'open' : ''}`}
            style={{
              zIndex: isOpen ? 40 : 50,
              boxShadow: isOpen ? 'none' : '20px 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.05)',
              background: 'linear-gradient(135deg, #2d1b1b 0%, #1a0f0f 100%)'
            }}
          >
            {/* Elegant Inner Border */}
            <div className="absolute inset-3 border border-amber-600/20 rounded-[2px] pointer-events-none"></div>
            <div className="absolute inset-4 border border-amber-600/10 rounded-[1px] pointer-events-none"></div>

            {/* Title Area - Fluid Typography & Clean Layout */}
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center z-10 pointer-events-none select-none min-h-0">
              <span className="text-sm md:text-base font-gentle text-amber-400/70 tracking-[0.3em] mb-3 uppercase">{t.titlePrefix}</span>

              <div className="relative px-2 w-full flex items-center justify-center">
                {/* Decorative horizontal lines */}
                <div className="hidden md:block absolute left-4 w-8 h-px bg-gradient-to-r from-transparent to-amber-700/50"></div>
                <div className="hidden md:block absolute right-4 w-8 h-px bg-gradient-to-l from-transparent to-amber-700/50"></div>

                <h1 className={`font-cursive font-bold text-[#eecfa1] leading-[1.1] text-center drop-shadow-md w-full`}
                  style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>
                  {t.titleMain}
                </h1>
              </div>
            </div>

            {/* Portrait Area - Refined Frame */}
            <div className="relative z-10 w-full flex justify-center py-4 flex-shrink-0">
              <div className="relative w-[55%] aspect-[3/4] max-w-[200px] shadow-2xl">
                {/* Frame Image */}
                <div className="absolute -inset-1 border border-amber-600/30 rounded-[1px]"></div>
                <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#151010] relative">
                  <img
                    src={imgError ? fallbackUrl : portraitUrl}
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105 opacity-90 brightness-[0.85] contrast-[1.15] sepia-[0.2]"
                    alt="Portrait"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Bottom Area - Clean Controls */}
            <div className={`z-20 w-full flex flex-col items-center justify-end flex-1 pb-2 min-h-0 transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-100'}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang)}
                    className={`px-2 py-0.5 rounded-[1px] text-[9px] uppercase tracking-wider transition-all duration-300 ${selectedLanguage.code === lang.code
                      ? 'text-amber-200 border-b border-amber-500 bg-amber-900/20 font-bold'
                      : 'text-amber-700/60 hover:text-amber-500 border-b border-transparent'
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <div className="text-amber-700/30 text-[9px] tracking-[0.5em] font-sans animate-pulse">
                {t.touchToOpen}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cover;
