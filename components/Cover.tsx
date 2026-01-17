
import React, { useState, useEffect } from 'react';

interface CoverProps {
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Initial entrance animation trigger
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    // After turn is complete, trigger the zoom/fade exit
    setTimeout(() => {
      setIsExiting(true);
      // Wait for exit transition before unmounting
      setTimeout(() => {
        onOpen();
      }, 500); 
    }, 1200); 
  };

  // Primary URL from user's provided context
  const portraitUrl = "https://images.canvas.com/67ac68420917244903df3d5f/67ac68420917244903df3d5f.jpg"; 
  // Reliable high-quality fallback of a generic spiritual elder/saint if the primary fails
  const fallbackUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#120505] overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent"></div>
      </div>

      {/* Unified Book Assembly */}
      <div 
        className={`book-container relative flex transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) 
          ${isMounted ? (isExiting ? 'opacity-0 scale-[1.05] translate-y-[-20px]' : 'opacity-100 scale-100 translate-y-0') : 'opacity-0 scale-90 translate-y-8'}`}
        style={{ 
          transformStyle: 'preserve-3d'
        }}
      >
        
        {/* Book Spine */}
        <div className="relative z-30 w-12 md:w-16 h-[75vh] max-h-[650px] leather-texture shadow-[inset_-5px_0_15px_rgba(0,0,0,0.8),-15px_5px_30px_rgba(0,0,0,0.6)] rounded-l-md border-r border-black/60 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-y-0 left-1 w-2 bg-gradient-to-r from-white/10 to-transparent"></div>
          
          <div className="h-full py-12 flex flex-col items-center justify-between pointer-events-none select-none">
            <div className="w-full flex flex-col gap-1 items-center">
              <div className="w-full h-0.5 bg-amber-600/30"></div>
              <div className="w-full h-0.5 bg-amber-600/30"></div>
            </div>
            
            <h2 className="gold-text font-book font-bold text-[10px] md:text-sm whitespace-nowrap tracking-[0.2em] uppercase opacity-90" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
            </h2>

            <div className="w-full flex flex-col gap-1 items-center">
              <div className="w-full h-0.5 bg-amber-600/30"></div>
              <div className="w-full h-0.5 bg-amber-600/30"></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[2px] h-full bg-black/40"></div>
        </div>

        {/* Book Main Body */}
        <div className="relative w-[75vw] max-w-[420px] h-[75vh] max-h-[650px]">
          
          {/* The Pages Stack (Interior) */}
          <div className="absolute inset-0 bg-[#fdfaf1] shadow-2xl rounded-r-sm p-10 flex flex-col justify-center items-center text-center paper-texture border-l border-stone-300">
             <div className="opacity-40 mb-4">
               <img src="https://www.svgrepo.com/show/338902/ornament.svg" className="w-16 h-16 ornament" alt="deco" />
             </div>
             <h2 className="text-stone-400 font-book italic text-xl">অক্ষর ব্রহ্মের বাণী</h2>
             <div className="mt-8 w-20 h-px bg-stone-300"></div>
             <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/10 to-transparent"></div>
          </div>

          {/* The Moving Cover */}
          <div 
            onClick={!isOpen ? handleOpen : undefined}
            className={`book-cover absolute inset-0 rounded-r-sm shadow-[15px_5px_40px_rgba(0,0,0,0.8)] leather-texture flex flex-col items-center justify-between p-6 md:p-8 border-l border-black/50 ${isOpen ? 'open' : ''}`}
            style={{ 
              zIndex: isOpen ? 40 : 50,
              boxShadow: isOpen ? 'none' : '20px 10px 50px rgba(0,0,0,0.8)'
            }}
          >
            {/* Decorative Gold Frame */}
            <div className="absolute inset-4 border-2 border-amber-600/30 rounded pointer-events-none"></div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg pointer-events-none"></div>

            {/* Title Area */}
            <div className="mt-6 text-center z-10 pointer-events-none select-none">
              <p className="text-amber-500/60 font-book tracking-[0.2em] uppercase text-[9px] mb-4 opacity-70">শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-book font-bold gold-text leading-tight px-2 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
              </h1>
            </div>

            {/* Framed Portrait Area - Centered and optimized */}
            <div className="relative flex flex-col items-center z-10 w-full px-4 flex-1 justify-center my-4">
              <div className="relative w-full max-w-[240px] md:max-w-[280px] aspect-[4/5] overflow-hidden rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.7)] border-4 border-double border-amber-600/50 bg-[#1e1e1e]">
                <div className="absolute inset-0 bg-stone-900 flex items-center justify-center overflow-hidden">
                   <img 
                    src={imgError ? fallbackUrl : portraitUrl} 
                    className="w-full h-full object-cover transition-all duration-700 brightness-95 contrast-105 scale-110 origin-center" 
                    style={{ objectPosition: 'center 45%' }} 
                    alt="Sri Sri Thakur Portrait"
                    onError={() => setImgError(true)}
                  />
                  {/* Subtle Antique Overlay */}
                  <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay pointer-events-none"></div>
                  {/* Inner Frame Glow */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Footer Area */}
            <div className="flex flex-col items-center z-10 mb-8 pointer-events-none select-none">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent mb-3"></div>
              <p className="text-amber-500/70 font-book italic tracking-widest text-[9px] uppercase">সংগ্রহ ও সম্পাদনা</p>
            </div>

            <div className={`absolute bottom-6 text-amber-600/40 text-[9px] tracking-[0.5em] font-sans transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'animate-pulse opacity-100'}`}>
              TOUCH TO OPEN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cover;
