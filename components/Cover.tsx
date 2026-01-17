
import React, { useState, useEffect } from 'react';

interface CoverProps {
  onOpen: () => void;
}

const Cover: React.FC<CoverProps> = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#120505] overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent"></div>
      </div>

      {/* Unified Book Assembly */}
      <div className={`book-container relative flex transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) 
        ${isMounted ? (isExiting ? 'opacity-0 scale-[1.05] translate-y-[-20px]' : 'opacity-100 scale-100 translate-y-0') : 'opacity-0 scale-90 translate-y-8'}`}
      >
        
        {/* Book Spine - Permanently Attached */}
        <div className="relative z-30 w-12 md:w-16 h-[75vh] max-h-[650px] leather-texture shadow-[inset_-5px_0_15px_rgba(0,0,0,0.6),-10px_0_30px_rgba(0,0,0,0.5)] rounded-l-sm border-r border-black/40 flex flex-col items-center justify-center">
          <div className="h-full py-12 flex flex-col items-center justify-between pointer-events-none select-none">
            {/* Decorative Spine Bands */}
            <div className="w-full flex flex-col gap-1 items-center">
              <div className="w-full h-0.5 bg-amber-600/20"></div>
              <div className="w-full h-0.5 bg-amber-600/20"></div>
            </div>
            
            {/* Vertical Title on Spine */}
            <h2 className="gold-text font-book font-bold text-sm md:text-lg whitespace-nowrap tracking-widest uppercase" 
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
            </h2>

            <div className="w-full flex flex-col gap-1 items-center">
              <div className="w-full h-0.5 bg-amber-600/20"></div>
              <div className="w-full h-0.5 bg-amber-600/20"></div>
            </div>
          </div>
          
          {/* Subtle gold line indicating the hinge junction */}
          <div className="absolute top-0 right-0 w-[1px] h-full bg-amber-500/10 shadow-[1px_0_2px_rgba(255,191,0,0.2)]"></div>
        </div>

        {/* Book Main Body (Pages Stack and Moving Cover) */}
        <div className="relative w-[75vw] max-w-[420px] h-[75vh] max-h-[650px]">
          
          {/* The Pages Stack (Interior "Page" shown behind the cover) */}
          <div className="absolute inset-0 bg-[#fdfaf1] shadow-2xl rounded-r-sm p-10 flex flex-col justify-center items-center text-center paper-texture border-l border-stone-300">
             <div className="opacity-40 mb-4">
               <img src="https://www.svgrepo.com/show/338902/ornament.svg" className="w-16 h-16 ornament" alt="deco" />
             </div>
             <h2 className="text-stone-400 font-book italic text-xl">অক্ষর ব্রহ্মের বাণী</h2>
             <div className="mt-8 w-20 h-px bg-stone-300"></div>
             
             {/* Realistic Page Edge Shadow */}
             <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/10 to-transparent"></div>
          </div>

          {/* The Moving Cover */}
          <div 
            onClick={!isOpen ? handleOpen : undefined}
            className={`book-cover absolute inset-0 rounded-r-sm shadow-[15px_0_40px_rgba(0,0,0,0.7)] leather-texture flex flex-col items-center justify-between p-8 border-l border-black/50 ${isOpen ? 'open' : ''}`}
            style={{ 
              zIndex: isOpen ? 40 : 50,
              boxShadow: isOpen ? 'none' : '15px_0_40px_rgba(0,0,0,0.7)'
            }}
          >
            {/* Decorative Gold Frame */}
            <div className="absolute inset-4 border-2 border-amber-600/30 rounded pointer-events-none"></div>
            <div className="absolute inset-6 border-[1px] border-amber-600/20 rounded pointer-events-none"></div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-500/60 rounded-tl-xl pointer-events-none"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-500/60 rounded-tr-xl pointer-events-none"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-500/60 rounded-bl-xl pointer-events-none"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-amber-500/60 rounded-br-xl pointer-events-none"></div>

            <div className="mt-12 text-center z-10 pointer-events-none select-none">
              <p className="text-amber-500/80 font-book tracking-[0.3em] uppercase text-[10px] mb-8 opacity-70">শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান</p>
              <h1 className="text-4xl md:text-5xl font-book font-bold gold-text leading-tight px-4 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী
              </h1>
            </div>

            <div className="flex flex-col items-center z-10 mb-12 pointer-events-none select-none">
              <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse"></div>
                <img 
                  src="https://www.svgrepo.com/show/302061/meditation.svg" 
                  className="w-full h-full p-4 ornament opacity-80" 
                  alt="meditation"
                />
              </div>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4"></div>
              <p className="text-amber-400 font-book italic tracking-widest text-[10px] uppercase">সংগ্রহ ও সম্পাদনা</p>
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
