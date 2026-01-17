
import React, { useEffect, useState } from 'react';

interface NavHintsProps {
  onDismiss: () => void;
}

const NavHints: React.FC<NavHintsProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    const autoDismiss = setTimeout(onDismiss, 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoDismiss);
    };
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-1000 cursor-pointer animate-in fade-in"
    >
      <div className="w-full h-full relative flex items-center justify-between px-10 md:px-20">
        
        {/* Previous Hint */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center animate-swipe-left">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <p className="text-white font-book text-lg drop-shadow-md">আগের পাতা</p>
        </div>

        {/* Center Hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-4 inline-block animate-pulse-hint">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                </svg>
            </div>
            <p className="text-white font-book text-xl font-bold tracking-wide drop-shadow-lg">পাতা উল্টাতে এখানে ক্লিক করুন</p>
        </div>

        {/* Next Hint */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center animate-swipe-right">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <p className="text-white font-book text-lg drop-shadow-md">পরের পাতা</p>
        </div>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full border border-white/30 text-white font-medium text-sm transition-all">
        বুঝেছি
      </div>
    </div>
  );
};

export default NavHints;
