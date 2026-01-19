
import React, { useState, useEffect } from 'react';
import { LANGUAGES, Language } from '../types';

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

  const portraitUrl = "https://images.canvas.com/67ac68420917244903df3d5f/67ac68420917244903df3d5f.jpg"; 
  const fallbackUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#120505] overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent"></div>
      </div>

      <div 
        className={`book-container relative flex transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) 
          ${isMounted ? (isExiting ? 'opacity-0 scale-[1.05] translate-y-[-20px]' : 'opacity-100 scale-100 translate-y-0') : 'opacity-0 scale-90 translate-y-8'}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Book Spine */}
        <div className="relative z-30 w-10 md:w-16 h-[80vh] max-h-[650px] leather-texture shadow-[inset_-5px_0_15px_rgba(0,0,0,0.8),-15px_5px_30px_rgba(0,0,0,0.6)] rounded-l-md border-r border-black/60 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-y-0 left-1 w-2 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="h-full py-12 flex flex-col items-center justify-between pointer-events-none select-none">
            <div className="w-full h-0.5 bg-amber-600/30"></div>
            <h2 className="gold-text font-book font-bold text-[9px] md:text-sm whitespace-nowrap tracking-[0.2em] uppercase opacity-90" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
            </h2>
            <div className="w-full h-0.5 bg-amber-600/30"></div>
          </div>
        </div>

        {/* Book Body */}
        <div className="relative w-[80vw] max-w-[420px] h-[80vh] max-h-[650px]">
          {/* Internal Page (Visible when cover opens) */}
          <div className="absolute inset-0 bg-[#fdfaf1] shadow-2xl rounded-r-sm p-8 flex flex-col justify-center items-center text-center paper-texture border-l border-stone-300">
             <h1 className="text-2xl md:text-3xl font-cursive text-stone-800 leading-tight">
               শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
             </h1>
             <div className="mt-8 w-12 h-px bg-amber-200"></div>
          </div>

          <div 
            onClick={!isOpen ? handleOpen : undefined}
            className={`book-cover absolute inset-0 rounded-r-sm shadow-[15px_5px_40px_rgba(0,0,0,0.8)] leather-texture flex flex-col items-center justify-between p-4 md:p-8 border-l border-black/50 ${isOpen ? 'open' : ''}`}
            style={{ zIndex: isOpen ? 40 : 50, boxShadow: isOpen ? 'none' : '20px 10px 50px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute inset-3 md:inset-4 border-2 border-amber-600/30 rounded pointer-events-none"></div>
            
            {/* Title Area */}
            <div className="mt-4 md:mt-6 text-center z-10 pointer-events-none select-none">
              <p className="text-amber-500/60 font-book tracking-[0.2em] uppercase text-[8px] md:text-[9px] mb-2 md:mb-4 opacity-70">শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান</p>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-book font-bold gold-text leading-tight px-2 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
              </h1>
            </div>

            {/* Framed Portrait Area */}
            <div className="relative flex flex-col items-center z-10 w-full px-4 flex-1 justify-center my-3 md:my-4">
              <div className="relative w-full max-w-[180px] md:max-w-[260px] aspect-[4/5] overflow-hidden rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.7)] border-4 border-double border-amber-600/50 bg-[#1e1e1e]">
                <img 
                  src={imgError ? fallbackUrl : portraitUrl} 
                  className="w-full h-full object-cover transition-all duration-700 brightness-95 contrast-105 scale-110 origin-center" 
                  style={{ objectPosition: 'center 45%' }} 
                  alt="Sri Sri Thakur Portrait"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none"></div>
              </div>
            </div>

            {/* Language Selection UI */}
            <div className={`z-20 transition-opacity duration-300 w-full ${isOpen ? 'opacity-0' : 'opacity-100'}`} onClick={(e) => e.stopPropagation()}>
               <p className="text-amber-500/40 text-[9px] md:text-[10px] uppercase tracking-widest text-center mb-2 md:mb-3 font-book">ভাষা নির্বাচন করুন</p>
               <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 px-1 md:px-2">
                 {LANGUAGES.map((lang) => (
                   <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-sm text-[10px] md:text-xs font-book transition-all duration-300 border ${
                      selectedLanguage.code === lang.code 
                        ? 'bg-amber-600/20 border-amber-500 gold-text shadow-[0_0_8px_rgba(180,83,9,0.3)]' 
                        : 'bg-black/20 border-amber-900/40 text-amber-900/60 hover:border-amber-700 hover:text-amber-600'
                    }`}
                   >
                     {lang.name}
                   </button>
                 ))}
               </div>
            </div>

            {/* Footer Area */}
            <div className="flex flex-col items-center z-10 mb-2 md:mb-4 pointer-events-none select-none">
              <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent mb-2 md:mb-3"></div>
              <p className="text-amber-500/70 font-book italic tracking-widest text-[8px] md:text-[9px] uppercase">সংগ্রহ ও সম্পাদনা</p>
            </div>

            {/* Touch Hint */}
            <div className={`absolute bottom-3 md:bottom-6 text-amber-600/30 text-[8px] md:text-[9px] tracking-[0.4em] font-sans transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'animate-pulse opacity-100'}`}>
              TOUCH TO OPEN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cover;
