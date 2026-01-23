
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chapter, ReadingState, Theme, Quote, LANGUAGES, Language } from './types';
import { fetchChapters } from './services/csvService';
import { getTranslation } from './translations';
import Reader from './components/Reader';
import Cover from './components/Cover';
import TableOfContents from './components/TableOfContents';
import LoadingScreen from './components/LoadingScreen';

type View = 'cover' | 'index' | 'reader';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('cover');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showAppBar, setShowAppBar] = useState(true);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('thakur_selected_language');
    if (saved) {
      const parsed = JSON.parse(saved);
      return LANGUAGES.find(l => l.code === parsed.code) || LANGUAGES[0];
    }
    return LANGUAGES[0]; // Default to Bengali
  });

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

  const loadChapters = useCallback(async (gid: string) => {
    setLoading(true);
    const data = await fetchChapters(gid);
    setChapters(data);

    const savedState = localStorage.getItem('thakur_reading_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      const idx = data.findIndex(c => c.id === state.currentChapterId);
      if (idx !== -1) {
        setActiveChapterIndex(idx);
      } else {
        setActiveChapterIndex(0);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadChapters(selectedLanguage.gid);
    localStorage.setItem('thakur_selected_language', JSON.stringify(selectedLanguage));
  }, [selectedLanguage, loadChapters]);

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

  const handleLanguageChange = (lang: Language) => {
    triggerHaptic(20);
    setSelectedLanguage(lang);
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
    setReadingState(prev => {
      const updatedQuotes = [newQuote, ...(prev.quotes || [])];
      const newState = { ...prev, quotes: updatedQuotes };
      localStorage.setItem('thakur_reading_state', JSON.stringify(newState));
      return newState;
    });
  };

  const removeQuote = (quoteId: string) => {
    triggerHaptic(10);
    setReadingState(prev => {
      const updatedQuotes = prev.quotes.filter(q => q.id !== quoteId);
      const newState = { ...prev, quotes: updatedQuotes };
      localStorage.setItem('thakur_reading_state', JSON.stringify(newState));
      return newState;
    });
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
    setView('reader');
  };

  const goToChapterById = (id: string) => {
    const idx = chapters.findIndex(c => c.id === id);
    if (idx !== -1) {
      goToChapter(idx);
    }
  };

  const handleOpenCover = () => setView('index');
  const handleCloseBook = () => { triggerHaptic(20); setView('cover'); };



  if (loading) return <LoadingScreen selectedLanguage={selectedLanguage} />;

  if (view === 'cover') return (
    <Cover
      onOpen={handleOpenCover}
      selectedLanguage={selectedLanguage}
      onLanguageChange={handleLanguageChange}
    />
  );

  if (view === 'index') return (
    <TableOfContents
      chapters={chapters}
      bookmarks={readingState.bookmarks}
      quotes={readingState.quotes || []}
      onSelect={goToChapter}
      onBack={handleCloseBook}
      onRemoveQuote={removeQuote}
      onGoToChapterById={goToChapterById}
      theme={theme}
      selectedLanguage={selectedLanguage}
      activeChapterIndex={activeChapterIndex}
    />
  );

  const currentChapter = chapters[activeChapterIndex];
  const progressPercent = chapters.length > 0 ? ((activeChapterIndex + 1) / chapters.length) * 100 : 0;
  const isBookmarked = currentChapter ? readingState.bookmarks.includes(currentChapter.id) : false;
  const isDark = theme.mode === 'dark';
  const t = getTranslation(selectedLanguage.code);

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-['Hind_Siliguri'] selection:bg-amber-200 reader-fade-in 
      ${theme.mode === 'dark' ? 'bg-[#1a1c1e]' : theme.mode === 'soft' ? 'bg-[#f4ecd8]' : 'bg-stone-50'}`}>

      {/* Mobile AppBar - Auto-hide on scroll */}
      <div className={`md:hidden flex items-center justify-between px-3 h-16 border-b z-30 shadow-sm backdrop-blur-md fixed top-0 left-0 right-0 transition-transform duration-300
        ${showAppBar ? 'translate-y-0' : '-translate-y-full'}
        ${isDark ? 'bg-[#1a1c1e]/90 border-stone-800 text-stone-100' : 'bg-white/90 border-stone-200 text-stone-800'}`}>
        <div className="flex items-center gap-1">
          <button onClick={handleCloseBook} className="p-2 hover:bg-black/5 rounded-xl border border-transparent active:border-amber-900/20 active:bg-amber-900/5 transition-all" aria-label={t.backToCover}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <button onClick={() => setView('index')} className="p-2 hover:bg-black/5 rounded-xl border border-transparent active:border-amber-900/20 active:bg-amber-900/5 transition-all ml-1" aria-label={t.index}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </button>
        </div>

        <span className="font-cursive font-normal text-2xl truncate px-2 text-center flex-1 mt-1">{currentChapter?.title || 'বাল্যলীলা কথা'}</span>

        <div className="flex items-center gap-1">
          <button onClick={handleShareChapter} className="p-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          </button>
          <button onClick={toggleBookmark} className={`p-2 transition-all transform active:scale-90 ${isBookmarked ? 'text-amber-500' : 'opacity-40'}`} aria-label="Bookmark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
          </button>
        </div>
      </div>


      <main className="flex-1 relative overflow-hidden flex flex-row">
        {/* Desktop Sidebar Index */}
        <div className="hidden md:block w-80 lg:w-96 h-full border-r border-stone-200 dark:border-stone-800">
          <TableOfContents
            chapters={chapters}
            bookmarks={readingState.bookmarks}
            quotes={readingState.quotes || []}
            onSelect={goToChapter}
            onBack={handleCloseBook}
            onRemoveQuote={removeQuote}
            onGoToChapterById={goToChapterById}
            theme={theme}
            selectedLanguage={selectedLanguage}
            isSidebar={true}
            activeChapterIndex={activeChapterIndex}
          />
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
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
                selectedLanguage={selectedLanguage}
                onAppBarVisibilityChange={setShowAppBar}
                onFontSizeChange={(size) => setTheme({ ...theme, fontSize: size })}
                onThemeChange={(mode) => setTheme({ ...theme, mode })}
              />
            )}
          </div>
          <div className="h-1 bg-stone-200/30 w-full absolute bottom-0 left-0 right-0 overflow-hidden">
            <div className="h-full bg-amber-700 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
