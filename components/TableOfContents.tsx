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
          <div className="text-center py-12 opacity-50 font-main text-sm">
            কোনো উদ্ধৃতি সংরক্ষণ করা হয়নি।
          </div>
        );
      }
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className={`p-4 rounded-lg border transition-all hover:bg-black/5 relative group
                ${isDark ? 'border-stone-800 bg-stone-900/30' : 'border-stone-200 bg-white/50'}
              `}
            >
              <div className="flex justify-between items-start gap-4">
                <p className={`text-base font-book leading-relaxed italic ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  "{quote.text}"
                </p>
                {onRemoveQuote && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveQuote(quote.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onGoToChapterById?.(quote.chapterId)}
                  className={`text-xs font-main hover:underline flex items-center gap-1.5 ${isDark ? 'text-amber-500/80' : 'text-amber-700/80'}`}
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
        <div className="text-center py-12 opacity-50 font-main text-sm">
          বুকমার্ক করা কোনো অধ্যায় নেই।
        </div>
      );
    }

    return (
      <div className="divide-y divide-stone-200/50 dark:divide-stone-800/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {items.map((chapter) => {
          const globalIndex = chapters.findIndex(c => c.id === chapter.id);
          const isSelected = bookmarks.includes(chapter.id);

          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(globalIndex)}
              className={`w-full text-left py-3 px-2 flex items-center gap-4 transition-colors group
                ${isDark ? 'hover:bg-stone-800/50' : 'hover:bg-stone-100/50'}
              `}
            >
              <span className={`font-mono text-xs opacity-30 w-6 text-right ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {String(globalIndex + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-book font-medium truncate ${isDark ? 'text-stone-200' : 'text-stone-800'} group-hover:text-amber-700 transition-colors`}>
                  {chapter.title}
                </h3>
                <p className={`text-xs font-main truncate opacity-50 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {chapter.writer}
                </p>
              </div>

              {bookmarks.includes(chapter.id) && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500 flex-shrink-0"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
              )}

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`opacity-0 group-hover:opacity-30 -translate-x-2 group-hover:translate-x-0 transition-all ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDark ? 'bg-[#1a1c1e] text-slate-200' : 'bg-[#fffdf9] text-stone-800'}`}>
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-10 py-4 backdrop-blur-md bg-opacity-90 -mx-4 px-4 border-b border-stone-200/30 dark:border-stone-800/30">
          <h2 className={`text-xl font-book font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
            সূচীপত্র
          </h2>
          <button
            onClick={onBack}
            className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Navigation (Simple & Compact) */}
        <div className="flex gap-6 mb-6 border-b border-stone-200 dark:border-stone-800 pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`font-main text-sm pb-2 border-b-2 transition-all ${activeTab === 'all' ? (isDark ? 'border-amber-500 text-amber-500' : 'border-amber-600 text-amber-700') : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            সব অধ্যায়
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`font-main text-sm pb-2 border-b-2 transition-all ${activeTab === 'bookmarks' ? (isDark ? 'border-amber-500 text-amber-500' : 'border-amber-600 text-amber-700') : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            বুকমার্ক ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`font-main text-sm pb-2 border-b-2 transition-all ${activeTab === 'quotes' ? (isDark ? 'border-amber-500 text-amber-500' : 'border-amber-600 text-amber-700') : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            উদ্ধৃতি ({quotes.length})
          </button>
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default TableOfContents;
