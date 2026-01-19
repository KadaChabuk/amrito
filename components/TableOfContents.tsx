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
  selectedLanguage
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const isDark = theme.mode === 'dark';
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
              className="p-5 rounded-lg border border-amber-900/10 bg-[#fffdf9] shadow-sm relative group"
            >
              <div className="flex justify-between items-start gap-4">
                <p className="text-base font-book leading-relaxed italic text-stone-800">
                  "{quote.text}"
                </p>
                {onRemoveQuote && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveQuote(quote.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-amber-900/40 hover:text-red-600 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onGoToChapterById?.(quote.chapterId)}
                  className="text-xs font-main hover:underline flex items-center gap-1.5 text-amber-700"
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
              className="w-full text-left py-3 px-3 flex items-start gap-4 transition-all group hover:bg-amber-900/5 rounded-md border border-transparent hover:border-amber-900/10"
            >
              <div className="w-8 h-8 rounded-full border border-amber-900/20 flex items-center justify-center bg-[#fdfaf1] group-hover:scale-110 transition-transform shadow-sm flex-shrink-0 mt-0.5">
                <span className="font-book text-xs text-amber-900/70 font-bold">
                  {globalIndex + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-book font-medium text-amber-950 group-hover:text-amber-800 transition-colors leading-snug break-words">
                  {chapter.title}
                </h3>
              </div>

              {bookmarks.includes(chapter.id) && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 flex-shrink-0 mt-1"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#fdfaf1]">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="absolute inset-y-0 left-0 w-1 md:w-2 bg-gradient-to-r from-amber-900/20 to-transparent"></div>

      <div className="h-full flex flex-col max-w-[480px] mx-auto relative z-10 bg-[#fdfaf1]/50 shadow-2xl md:my-8 md:h-[calc(100%-4rem)] md:rounded-r-sm md:border-l md:border-stone-300">

        {/* Header Section */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-16 h-1 mx-auto bg-amber-900/20 rounded-full mb-6"></div>
          <h2 className="text-3xl md:text-4xl font-bold font-cursive bg-gradient-to-b from-amber-700 to-amber-900 bg-clip-text text-transparent drop-shadow-sm mb-2 leading-relaxed py-2">{t.index}</h2>
          <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
            <span className="h-px w-12 bg-amber-900/40"></span>
            <span className="text-amber-800 text-xs font-book tracking-widest uppercase">TABLE OF CONTENTS</span>
            <span className="h-px w-12 bg-amber-900/40"></span>
          </div>

          <button
            onClick={onBack}
            className="absolute top-6 right-6 p-2 rounded-full border border-amber-900/20 text-amber-900/60 hover:bg-amber-900/5 hover:text-amber-900 transition-all active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-6">
          <div className="flex p-1 bg-amber-900/5 rounded-lg border border-amber-900/10">
            <button onClick={() => setActiveTab('all')} className={`flex-1 py-2 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-amber-900 font-bold' : 'text-amber-900/60 hover:text-amber-800'}`}>{t.allChapters}</button>
            <button onClick={() => setActiveTab('bookmarks')} className={`flex-1 py-2 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'bookmarks' ? 'bg-white shadow-sm text-amber-900 font-bold' : 'text-amber-900/60 hover:text-amber-800'}`}>{t.bookmarks} ({bookmarks.length})</button>
            <button onClick={() => setActiveTab('quotes')} className={`flex-1 py-2 text-xs md:text-sm font-book rounded-md transition-all ${activeTab === 'quotes' ? 'bg-white shadow-sm text-amber-900 font-bold' : 'text-amber-900/60 hover:text-amber-800'}`}>{t.quotes} ({quotes.length})</button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;
