
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chapter, ReadingState, Theme, Quote } from './types';
import { fetchChapters } from './services/csvService';
import Reader from './components/Reader';
import Cover from './components/Cover';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'quotes'>('all');
  
  const [readingState, setReadingState] = useState<ReadingState>(() => {
    const saved = localStorage.getItem('thakur_reading_state');
    return saved ? JSON.parse(saved) : { currentChapterId: null, bookmarks: [], progress: {}, quotes: [] };
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('thakur_theme_settings');
    return saved ? JSON.parse(saved) : { mode: 'sepia', fontSize: 20, rememberScroll: true };
  });

  useEffect(() => {
    localStorage.setItem('thakur_theme_settings', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchChapters();
      setChapters(data);
      
      const savedState = localStorage.getItem('thakur_reading_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        const idx = data.findIndex(c => c.id === state.currentChapterId);
        if (idx !== -1) {
          setActiveChapterIndex(idx);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (chapters.length > 0) {
      const newState = {
        ...readingState,
        currentChapterId: chapters[activeChapterIndex]?.id
      };
      localStorage.setItem('thakur_reading_state', JSON.stringify(newState));
    }
  }, [activeChapterIndex, readingState, chapters]);

  const triggerHaptic = (duration: number = 10) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) { }
    }
  };

  const handleScrollUpdate = useCallback((percentage: number) => {
    if (!chapters[activeChapterIndex]) return;
    const chapterId = chapters[activeChapterIndex].id;
    setReadingState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [chapterId]: percentage
      }
    }));
  }, [activeChapterIndex, chapters]);

  const toggleBookmark = useCallback(() => {
    if (!chapters[activeChapterIndex]) return;
    const chapterId = chapters[activeChapterIndex].id;
    triggerHaptic(15);
    setReadingState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(chapterId)
        ? prev.bookmarks.filter(id => id !== chapterId)
        : [...prev.bookmarks, chapterId]
    }));
  }, [activeChapterIndex, chapters]);

  const handleSaveQuote = (text: string) => {
    if (!chapters[activeChapterIndex]) return;
    const chapter = chapters[activeChapterIndex];
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      text: text,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      timestamp: Date.now()
    };
    setReadingState(prev => ({
      ...prev,
      quotes: [newQuote, ...(prev.quotes || [])]
    }));
  };

  const removeQuote = (quoteId: string) => {
    triggerHaptic(10);
    setReadingState(prev => ({
      ...prev,
      quotes: prev.quotes.filter(q => q.id !== quoteId)
    }));
  };

  const handleShareChapter = async () => {
    if (!chapters[activeChapterIndex]) return;
    triggerHaptic(15);
    const chapter = chapters[activeChapterIndex];
    const bookTitle = "শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী";
    const formattedText = `📜 *${bookTitle}*\n📖 অধ্যায়: *${chapter.title}*\n\n— শ্রীশ্রীবালক ব্রহ্মচারী ডিজিটাল সংকলন থেকে পড়ুন।`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookTitle,
          text: formattedText,
          url: window.location.origin
        });
      } catch (err) { console.error("Native share failed:", err); }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleShareQuote = async (quote: Quote) => {
    triggerHaptic(15);
    const bookTitle = "শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী";
    const formattedText = `📜 *${bookTitle}*\n📖 অধ্যায়: *${quote.chapterTitle}*\n\n「 ${quote.text} 」\n\n— শ্রীশ্রীবালক ব্রহ্মচারী ডিজিটাল সংকলন`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookTitle,
          text: formattedText,
          url: window.location.origin
        });
      } catch (err) { console.error("Native share failed:", err); }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleNext = () => {
    if (activeChapterIndex < chapters.length - 1) {
      setActiveChapterIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(prev => prev - 1);
    }
  };

  const goToChapter = (index: number) => {
    triggerHaptic(10);
    setActiveChapterIndex(index);
    setShowSidebar(false);
  };

  const goToChapterById = (id: string) => {
    const idx = chapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      goToChapter(idx);
    }
  };

  const handleOpenBook = () => setShowCover(false);
  const handleCloseBook = () => { triggerHaptic(20); setShowCover(true); };
  const handleToggleSidebar = () => { triggerHaptic(10); setShowSidebar(!showSidebar); };

  const displayedChapters = useMemo(() => {
    if (activeTab === 'bookmarks') return chapters.filter(ch => readingState.bookmarks.includes(ch.id));
    return chapters;
  }, [chapters, activeTab, readingState.bookmarks]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fcfaf2] paper-texture">
        <div className="w-20 h-20 border-t-2 border-amber-800 rounded-full animate-spin"></div>
        <h2 className="mt-8 text-2xl font-gentle text-stone-600 animate-pulse italic">লোড হচ্ছে...</h2>
      </div>
    );
  }

  if (showCover) return <Cover onOpen={handleOpenBook} />;

  const currentChapter = chapters[activeChapterIndex];
  const progressPercent = chapters.length > 0 ? ((activeChapterIndex + 1) / chapters.length) * 100 : 0;
  const isBookmarked = currentChapter ? readingState.bookmarks.includes(currentChapter.id) : false;
  const isDark = theme.mode === 'dark';

  return (
    <div className={`h-screen flex flex-col md:flex-row overflow-hidden font-['Hind_Siliguri'] selection:bg-amber-200 reader-fade-in ${isDark ? 'bg-[#1a1c1e]' : 'bg-stone-50'}`}>
      
      {/* Mobile AppBar */}
      <div className={`md:hidden flex items-center justify-between px-3 h-16 border-b z-30 shadow-sm backdrop-blur-md sticky top-0
        ${isDark ? 'bg-[#1a1c1e]/90 border-stone-800 text-stone-100' : 'bg-white/90 border-stone-200 text-stone-800'}`}>
        <div className="flex items-center gap-1">
          <button onClick={handleToggleSidebar} className="p-2 hover:bg-black/5 rounded-full" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <button onClick={handleCloseBook} className="p-2 hover:bg-black/5 rounded-full" aria-label="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
        </div>
        
        <span className="font-cursive font-normal text-2xl truncate px-2 text-center flex-1 mt-1">{currentChapter?.title || 'বাল্যলীলা কথা'}</span>
        
        <div className="flex items-center gap-1">
          <button onClick={handleShareChapter} className="p-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button onClick={toggleBookmark} className={`p-2 transition-all transform active:scale-90 ${isBookmarked ? 'text-amber-500' : 'opacity-40'}`} aria-label="Bookmark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-[#fbf9f4] border-r border-stone-200/60 transform transition-transform duration-500 md:relative md:translate-x-0 ${showSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <h2 className="text-3xl font-cursive font-normal text-stone-800 mb-6 leading-tight">শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী</h2>
            
            {/* Tab Navigation */}
            <div className="flex p-1 bg-stone-100 rounded-lg">
                <button onClick={() => { triggerHaptic(5); setActiveTab('all'); }} className={`flex-1 py-1.5 text-xs font-gentle rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>সুচী</button>
                <button onClick={() => { triggerHaptic(5); setActiveTab('bookmarks'); }} className={`flex-1 py-1.5 text-xs font-gentle rounded-md transition-all ${activeTab === 'bookmarks' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>বুকমার্ক</button>
                <button onClick={() => { triggerHaptic(5); setActiveTab('quotes'); }} className={`flex-1 py-1.5 text-xs font-gentle rounded-md transition-all ${activeTab === 'quotes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>উদ্ধৃতি</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
            {activeTab === 'quotes' ? (
                readingState.quotes && readingState.quotes.length > 0 ? (
                    readingState.quotes.map(quote => (
                        <div key={quote.id} className="p-5 rounded-xl bg-white border border-stone-100 shadow-sm relative group mb-4 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start gap-2 mb-3">
                                <p className="font-book text-sm text-stone-800 leading-relaxed italic">"{quote.text}"</p>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleShareQuote(quote)} 
                                        className="p-1.5 bg-stone-50 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
                                        title="Share Quote"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                                    </button>
                                    <button 
                                        onClick={() => removeQuote(quote.id)} 
                                        className="p-1.5 bg-stone-50 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="Remove Quote"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => goToChapterById(quote.chapterId)} className="text-[10px] font-gentle text-amber-700 hover:underline inline-flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                § {quote.chapterTitle}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-12 px-6 text-center text-stone-400 font-book italic">কোনো উদ্ধৃতি সংরক্ষণ করা হয়নি।</div>
                )
            ) : (
                displayedChapters.length > 0 ? displayedChapters.map((ch) => {
                    const globalIndex = chapters.findIndex(c => c.id === ch.id);
                    return (
                        <button key={ch.id} onClick={() => goToChapter(globalIndex)} className={`w-full text-left px-5 py-3 rounded-xl transition-all flex items-start gap-4 group relative ${activeChapterIndex === globalIndex ? 'bg-amber-100/60 text-amber-950 shadow-sm' : 'hover:bg-stone-200/30 text-stone-600 hover:text-stone-900'}`}>
                            <div className={`mt-2.5 w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0 ${activeChapterIndex === globalIndex ? 'bg-amber-700' : 'bg-stone-300'}`}></div>
                            <div className="flex-1">
                                <h3 className={`font-cursive text-xl leading-snug ${activeChapterIndex === globalIndex ? 'font-normal opacity-100' : 'opacity-70'}`}>{ch.title}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-gentle opacity-60">{ch.writer}</span>
                                    {readingState.bookmarks.includes(ch.id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="#b45309" className="opacity-80"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>}
                                </div>
                            </div>
                        </button>
                    );
                }) : (
                    <div className="py-12 px-6 text-center text-stone-400 font-book italic">কোনো অধ্যায় খুঁজে পাওয়া যায়নি।</div>
                )
            )}
          </div>

          <div className="p-6 bg-stone-100/50 border-t border-stone-200/50">
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex gap-4">
                <button onClick={() => setTheme(p => ({...p, mode: 'light'}))} className={`w-6 h-6 rounded-full border-2 ${theme.mode === 'light' ? 'border-amber-600' : 'border-stone-300'} bg-white`} />
                <button onClick={() => setTheme(p => ({...p, mode: 'sepia'}))} className={`w-6 h-6 rounded-full border-2 ${theme.mode === 'sepia' ? 'border-amber-600' : 'border-stone-300'} bg-[#fcf5e5]`} />
                <button onClick={() => setTheme(p => ({...p, mode: 'dark'}))} className={`w-6 h-6 rounded-full border-2 ${theme.mode === 'dark' ? 'border-amber-600' : 'border-stone-300'} bg-[#1a1c1e]`} />
              </div>
              <div className="flex items-center gap-4 bg-stone-200/50 rounded-full px-4 py-1">
                <button onClick={() => setTheme(p => ({...p, fontSize: Math.max(16, p.fontSize - 2)}))} className="text-lg font-bold text-stone-500">A-</button>
                <span className="h-3 w-px bg-stone-300"></span>
                <button onClick={() => setTheme(p => ({...p, fontSize: Math.min(32, p.fontSize + 2)}))} className="text-lg font-bold text-stone-500">A+</button>
              </div>
            </div>
            <button onClick={handleCloseBook} className="w-full text-center py-2 text-stone-500 text-xs font-gentle border border-stone-200 rounded-lg hover:bg-white transition-colors">প্রচ্ছদ পাতায় ফিরুন</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {showSidebar && <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setShowSidebar(false)} />}
        <div className="flex-1 overflow-hidden">
          {currentChapter && (
            <Reader 
              chapter={currentChapter}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={activeChapterIndex === 0}
              isLast={activeChapterIndex === chapters.length - 1}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              onSaveQuote={handleSaveQuote}
              onCloseBook={handleCloseBook}
              onScrollUpdate={handleScrollUpdate}
              initialProgress={readingState.progress[currentChapter.id] || 0}
              theme={theme}
            />
          )}
        </div>
        <div className="h-1 bg-stone-200/30 w-full absolute bottom-0 left-0 right-0 overflow-hidden">
          <div className="h-full bg-amber-700 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
        </div>
      </main>
    </div>
  );
};

export default App;
