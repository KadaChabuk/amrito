import React, { useState } from 'react';
import { Chapter, Theme, Quote, Language } from '../types';
import { getTranslation } from '../translations';

interface TableOfContentsProps {
  chapters: Chapter[];
  bookmarks: string[];
  quotes: Quote[];
  onSelect: (index: number) => void;
  onBack: () => void;
  onRemoveQuote?: (id: string) => void;
  onGoToChapterById?: (id: string) => void;
  theme: Theme;
  selectedLanguage: Language;
  isSidebar?: boolean;
  activeChapterIndex?: number;
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
  theme,
  selectedLanguage,
  isSidebar = false,
  activeChapterIndex
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSidebar && activeChapterIndex !== undefined && listRef.current) {
      const activeItem = listRef.current.querySelector(`[data-chapter-index="${activeChapterIndex}"]`);
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeChapterIndex, isSidebar, activeTab]);

  const isDark = theme.mode === 'dark';
  const isSoft = theme.mode === 'soft';
  const isSepia = theme.mode === 'sepia';

  const themeColors = {
    sepia: { bg: 'bg-[#fdfaf1]', text: 'text-amber-950', header: 'text-amber-900', border: 'border-amber-900/10', itemBg: 'bg-[#fdfaf1]', activeBg: 'bg-amber-100/50' },
    light: { bg: 'bg-white', text: 'text-stone-900', header: 'text-stone-800', border: 'border-stone-100', itemBg: 'bg-white', activeBg: 'bg-stone-100' },
    dark: { bg: 'bg-stone-900', text: 'text-stone-300', header: 'text-stone-100', border: 'border-stone-800', itemBg: 'bg-stone-900', activeBg: 'bg-stone-800/80', activeText: 'text-amber-400', muted: 'text-stone-500' },
    soft: { bg: 'bg-[#f4ecd8]', text: 'text-stone-800', header: 'text-stone-900', border: 'border-orange-200/50', itemBg: 'bg-[#f4ecd8]', activeBg: 'bg-orange-100/50', activeText: 'text-amber-900', muted: 'text-stone-500' }
  };

  const currentTheme = themeColors[theme.mode] || themeColors.sepia;
  const t = getTranslation(selectedLanguage.code);

  const bookmarkedChapters = chapters.filter(ch => bookmarks.includes(ch.id));

  const renderContent = () => {
    if (activeTab === 'quotes') {
      if (!quotes || quotes.length === 0) {
        return (
          <div className="text-center py-12 opacity-50 font-main text-sm text-amber-900/60 font-book italic">
            {t.noQuotes}
          </div>
        );
      }
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className={`p-5 rounded-lg border transition-all relative group shadow-sm
                ${isDark ? 'bg-stone-800/40 border-stone-700' : isSoft ? 'bg-orange-100/30 border-orange-200/50' : 'bg-[#fffdf9] border-amber-900/10'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <p className={`text-base font-book leading-relaxed italic ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                  "{quote.text}"
                </p>
                {onRemoveQuote && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveQuote(quote.id); }}
                    className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${isDark ? 'text-stone-500 hover:text-red-400' : 'text-amber-900/40 hover:text-red-600'}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onGoToChapterById?.(quote.chapterId)}
                  className={`text-xs font-main hover:underline flex items-center gap-1.5 ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                  {quote.chapterTitle}
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const items = activeTab === 'all' ? chapters : bookmarkedChapters;

    if (items.length === 0 && activeTab === 'bookmarks') {
      return (
        <div className="text-center py-12 opacity-50 font-main text-sm text-amber-900/60 font-book italic">
          {t.noBookmarks}
        </div>
      );
    }

    return (
      <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {items.map((chapter) => {
          const globalIndex = chapters.findIndex(c => c.id === chapter.id);
          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(globalIndex)}
              data-chapter-index={globalIndex}
              className={`w-full text-left py-2 px-3 flex items-center gap-4 transition-all group rounded-lg border-b ${currentTheme.border} last:border-0
                ${activeChapterIndex === globalIndex
                  ? currentTheme.activeBg + ' shadow-inner'
                  : 'hover:bg-amber-900/[0.04]'
                }`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all font-book text-xs relative top-0.5
                ${activeChapterIndex === globalIndex
                  ? 'bg-amber-600 text-white border-amber-600'
                  : `${currentTheme.itemBg} ${currentTheme.border} group-hover:bg-amber-50 text-amber-900/60 font-medium`
                }`}>
                {globalIndex + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-base md:text-lg font-book font-medium transition-colors leading-tight tracking-tight
                  ${activeChapterIndex === globalIndex
                    ? (currentTheme.activeText || 'text-amber-900') + ' font-bold'
                    : `${currentTheme.text} group-hover:text-amber-800`
                  }`}>
                  {chapter.title}
                </h3>
                {chapter.writer && (
                  <p className="text-[10px] md:text-xs font-main text-amber-900/60 mt-0.5 uppercase tracking-wide">
                    {chapter.writer}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {bookmarks.includes(chapter.id) && (
                  <div className="text-amber-600 drop-shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-900/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>
            </button>
          );
        })
        }
      </div >
    );
  };

  return (
    <div className={`${isSidebar ? 'h-full' : 'fixed inset-0 z-50'} overflow-hidden ${currentTheme.bg}`}>
      {/* Background Texture */}
      {!isSidebar && (
        <>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          <div className="absolute inset-y-0 left-0 w-1 md:w-2 bg-gradient-to-r from-amber-900/20 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-amber-900/10 to-transparent"></div>
        </>
      )}

      <div className={`h-full flex flex-col relative z-10 ${currentTheme.bg} ${isSidebar ? 'w-full' : 'max-w-[500px] mx-auto shadow-[0_0_50px_rgba(0,0,0,0.1)] md:my-6 md:h-[calc(100%-3rem)] md:rounded-[3px] md:border ' + currentTheme.border}`}>

        <div className="pt-6 pb-2 px-6 text-center">
          <div className={`w-12 h-1 mx-auto rounded-full mb-4 ${isDark ? 'bg-stone-700' : 'bg-amber-900/10'}`}></div>

          {/* Prominent Book Title */}
          <div className="mb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-700">
            <p className={`${selectedLanguage.code === 'en' ? 'text-[10px] md:text-[11px]' : 'text-[11px] md:text-[12px]'} uppercase tracking-[0.3em] font-main font-medium leading-none ${isDark ? 'text-amber-500/70' : 'text-amber-900/60'}`}>{t.titlePrefix}</p>
            <h1 className={`${selectedLanguage.code === 'en' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-book font-bold leading-tight tracking-tight drop-shadow-sm transition-all duration-500 ${isDark ? 'text-stone-100' : 'text-amber-950'}`}>
              {t.titleMain}
            </h1>
          </div>

          {/* Refined Index Label - Less dominant but elegant */}
          <div className="flex items-center justify-center gap-3 mb-4 opacity-80">
            <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${isDark ? 'to-amber-500/20' : 'to-amber-900/20'}`}></div>
            <h2 className={`${selectedLanguage.code === 'en' ? 'text-sm md:text-base' : 'text-base md:text-lg'} font-bold font-cursive tracking-widest uppercase ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>{t.index}</h2>
            <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${isDark ? 'to-amber-500/20' : 'to-amber-900/20'}`}></div>
          </div>


          {/* Back to Cover - Prominent in both sidebars and mobile */}
          <button
            onClick={onBack}
            className={`absolute top-4 left-4 p-2 rounded-xl border transition-all active:scale-95 group flex items-center justify-center
              ${isDark
                ? 'border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-amber-400'
                : 'border-amber-900/20 text-amber-900/60 hover:bg-amber-900/5 hover:border-amber-900/40 hover:text-amber-900'}`}
            title={t.backToCover}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform duration-200">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>

          {!isSidebar && (
            <button
              onClick={onBack}
              className="absolute top-4 right-4 p-2 rounded-xl border border-amber-900/20 text-amber-900/60 hover:bg-amber-900/5 hover:text-amber-700 transition-all active:scale-95 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-6">
          <div className={`flex p-1 rounded-lg border ${isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-amber-900/5 border-amber-900/10'}`}>
            <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'all' ? (isDark ? 'bg-stone-700 shadow-sm text-stone-100 font-bold' : 'bg-white shadow-sm text-amber-900 font-bold') : (isDark ? 'text-stone-500 hover:text-stone-300' : 'text-amber-900/60 hover:text-amber-800')}`}>{t.allChapters}</button>
            <button onClick={() => setActiveTab('bookmarks')} className={`flex-1 py-1.5 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'bookmarks' ? (isDark ? 'bg-stone-700 shadow-sm text-stone-100 font-bold' : 'bg-white shadow-sm text-amber-900 font-bold') : (isDark ? 'text-stone-500 hover:text-stone-300' : 'text-amber-900/60 hover:text-amber-800')}`}>{t.bookmarks} ({bookmarks.length})</button>
            <button onClick={() => setActiveTab('quotes')} className={`flex-1 py-1.5 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'quotes' ? (isDark ? 'bg-stone-700 shadow-sm text-stone-100 font-bold' : 'bg-white shadow-sm text-amber-900 font-bold') : (isDark ? 'text-stone-500 hover:text-stone-300' : 'text-amber-900/60 hover:text-amber-800')}`}>{t.quotes} ({quotes.length})</button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;
