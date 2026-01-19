
import React, { useState } from 'react';
import { Chapter, Theme, Quote } from '../types';

interface TableOfContentsProps {
  chapters: Chapter[];
  bookmarks: string[];
  quotes: Quote[];
  onSelect: (index: number) => void;
  onBack: () => void;
  onRemoveQuote?: (id: string) => void;
  onGoToChapterById?: (id: string) => void;
  theme: Theme;
}

type Tab = 'all' | 'bookmarks' | 'quotes';

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  chapters, 
  bookmarks, 
  quotes, 
  onSelect, 
  onBack, 
  onRemoveQuote,
  onGoToChapterById,
  theme 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const isDark = theme.mode === 'dark';

  const bookmarkedChapters = chapters.filter(ch => bookmarks.includes(ch.id));

  const renderContent = () => {
    if (activeTab === 'quotes') {
      if (!quotes || quotes.length === 0) {
        return (
          <div className="text-center py-20 opacity-40 font-book italic text-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            কোনো উদ্ধৃতি সংরক্ষণ করা হয়নি।
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {quotes.map(quote => (
            <div 
              key={quote.id} 
              className={`p-8 rounded-3xl border transition-all hover:shadow-xl relative group overflow-hidden
                ${isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-amber-100/50 shadow-sm'}
              `}
            >
              {/* Spiritual Background Ornament */}
              <div className="absolute -top-4 -right-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className={`p-2 rounded-full ${isDark ? 'bg-amber-900/20 text-amber-500' : 'bg-amber-50 text-amber-700'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h4c0 4-2 6-4 6M13 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h4c0 4-2 6-4 6" />
                    </svg>
                </div>
                {onRemoveQuote && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveQuote(quote.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 transition-all transform hover:scale-110"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
              <p className={`text-xl md:text-2xl font-book leading-relaxed italic mb-6 relative z-10 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                "{quote.text}"
              </p>
              <div className="flex items-center justify-between border-t border-dashed border-amber-200/30 pt-4">
                <button 
                  onClick={() => onGoToChapterById?.(quote.chapterId)}
                  className={`text-sm font-gentle tracking-wide hover:underline flex items-center gap-2 ${isDark ? 'text-amber-500/80' : 'text-amber-800/80'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  {quote.chapterTitle}
                </button>
                <span className="text-[10px] font-gentle opacity-30 uppercase tracking-widest">{new Date(quote.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const items = activeTab === 'all' ? chapters : bookmarkedChapters;
    
    if (items.length === 0 && activeTab === 'bookmarks') {
      return (
        <div className="text-center py-24 opacity-40 font-book italic text-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            বুকমার্ক করা কোনো অধ্যায় নেই।
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {items.map((chapter) => {
          const globalIndex = chapters.findIndex(c => c.id === chapter.id);
          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(globalIndex)}
              className={`flex items-start gap-6 text-left p-6 rounded-2xl transition-all group
                ${isDark ? 'hover:bg-amber-900/10' : 'hover:bg-amber-50 shadow-sm hover:shadow-md'}
              `}
            >
              <span className={`font-book text-base opacity-30 group-hover:opacity-100 group-hover:text-amber-600 font-bold transition-all pt-1`}>
                {String(globalIndex + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 pb-2">
                <h3 className={`text-2xl md:text-3xl font-cursive leading-tight ${isDark ? 'text-stone-100' : 'text-stone-800'} group-hover:text-amber-700 flex items-center justify-between transition-colors`}>
                  {chapter.title}
                  {bookmarks.includes(chapter.id) && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500 ml-2 animate-in zoom-in-50 duration-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                  )}
                </h3>
                <p className={`text-sm font-gentle opacity-50 mt-2 ${isDark ? 'text-stone-400' : 'text-stone-600'} group-hover:opacity-80 transition-opacity`}>
                  {chapter.writer}
                </p>
                <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 mt-4 ${isDark ? 'bg-amber-500/30' : 'bg-amber-200'}`}></div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto reader-fade-in ${isDark ? 'bg-[#1a1c1e] text-slate-200' : 'bg-[#fdfaf1] text-stone-800'} paper-texture`}>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Persistent Floating Back Button */}
        <div className="sticky top-0 z-50 flex justify-center pb-8 md:pb-12 pointer-events-none">
            <button 
                onClick={onBack}
                className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full border text-xs font-gentle font-bold tracking-widest uppercase transition-all shadow-xl hover:-translate-y-1 active:scale-95
                ${isDark ? 'border-stone-700 text-stone-400 bg-stone-900/90 backdrop-blur-md hover:text-amber-400 hover:border-amber-400/50' : 'border-amber-200 text-amber-900 bg-white/90 backdrop-blur-md hover:bg-amber-50'}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                প্রচ্ছদে ফিরুন
            </button>
        </div>
          
        <header className="flex flex-col items-center mb-16">
          <h2 className={`text-4xl sm:text-5xl md:text-8xl font-cursive mb-12 text-center ${isDark ? 'text-amber-500' : 'text-amber-900'} drop-shadow-xl select-none leading-tight`}>
            {activeTab === 'all' ? 'সুচীপত্র' : activeTab === 'bookmarks' ? 'বুকমার্কস' : 'প্রিয় উদ্ধৃতিসমূহ'}
          </h2>

          {/* Premium Icon-Centric Navigation Bar */}
          <div className={`flex items-center gap-2 md:gap-6 p-2 rounded-3xl border transition-all duration-500 shadow-2xl
            ${isDark ? 'bg-stone-900/80 border-stone-800 backdrop-blur-lg' : 'bg-stone-100/60 border-amber-200 backdrop-blur-md'}
          `}>
            <button 
              onClick={() => setActiveTab('all')}
              className={`relative px-4 py-4 md:px-10 md:py-5 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 group
                ${activeTab === 'all' ? (isDark ? 'bg-amber-500 text-stone-900' : 'bg-white text-amber-900 shadow-inner') : 'text-stone-500 hover:text-amber-600'}
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:scale-110">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className="text-[10px] md:text-xs font-gentle font-bold tracking-widest uppercase">সুচী</span>
              {activeTab === 'all' && <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-current"></div>}
            </button>
            
            <button 
              onClick={() => setActiveTab('bookmarks')}
              className={`relative px-4 py-4 md:px-10 md:py-5 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 group
                ${activeTab === 'bookmarks' ? (isDark ? 'bg-amber-500 text-stone-900' : 'bg-white text-amber-900 shadow-inner') : 'text-stone-500 hover:text-amber-600'}
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:scale-110">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1-2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              <span className="text-[10px] md:text-xs font-gentle font-bold tracking-widest uppercase">বুকমার্ক ({bookmarks.length})</span>
              {activeTab === 'bookmarks' && <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-current"></div>}
            </button>

            <button 
              onClick={() => setActiveTab('quotes')}
              className={`relative px-4 py-4 md:px-10 md:py-5 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 group
                ${activeTab === 'quotes' ? (isDark ? 'bg-amber-500 text-stone-900' : 'bg-white text-amber-900 shadow-inner') : 'text-stone-500 hover:text-amber-600'}
              `}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:scale-110">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="text-[10px] md:text-xs font-gentle font-bold tracking-widest uppercase">উদ্ধৃতি ({quotes.length})</span>
              {activeTab === 'quotes' && <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-current"></div>}
            </button>
          </div>
        </header>

        <div className="min-h-[500px] px-2 md:px-6">
          {renderContent()}
        </div>

        <footer className="mt-32 text-center opacity-30 pb-12">
            <div className="flex justify-center items-center gap-6 mb-8">
                <span className={`h-px flex-1 ${isDark ? 'bg-stone-800' : 'bg-amber-200'}`}></span>
                <img src="https://www.svgrepo.com/show/338902/ornament.svg" className="w-20 h-20 ornament grayscale transition-all hover:scale-110 cursor-pointer" alt="decoration" />
                <span className={`h-px flex-1 ${isDark ? 'bg-stone-800' : 'bg-amber-200'}`}></span>
            </div>
            <p className="font-book text-sm tracking-[0.3em] uppercase opacity-60">শ্রীশ্রীবালক ব্রহ্মচারী সেবা প্রতিষ্ঠান</p>
        </footer>
      </div>
    </div>
  );
};

export default TableOfContents;
