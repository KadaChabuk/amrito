
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  fontSize: number;
  themeMode: 'sepia' | 'light' | 'dark';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, fontSize, themeMode }) => {
  // Keywords to detect the start of Translator's Notes across supported languages
  // Keywords to detect the start of Translator's Notes across supported languages
  const noteKeywords = [
    "Translator's Note", "Translator's Notes", "Translators Note",
    "Translator’s Note", "Translator’s Notes", // Smart apostrophe support
    "অনুবাদকের নোট", "অনুবাদকের কথা", "অনুবাদকের মন্তব্য",
    "अनुवादक की टिप्पणी", "अनुवादक का नोट",
    "অনুবাদকৰ টোকা", "অনুবাদকৰ কথা",
    "ଅନୁବାଦକଙ୍କ ଟିପ୍ପଣୀ", "ଅନୁବାଦକଙ୍କ କଥା"
  ];

  const parseInline = (text: string) => {
    let processed = text.replace(/(\*\*|__)(.*?)\1/g, '<strong class="font-bold text-amber-900/90 dark:text-amber-500">$2</strong>');
    processed = processed.replace(/(\*|_)(.*?)\1/g, '<em class="italic opacity-90">$2</em>');
    return processed;
  };

  const allLines = content.split('\n').filter(p => p.trim() !== '');

  // Find where the translator notes start
  let notesStartIndex = -1;
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i].toLowerCase();
    if (noteKeywords.some(kw => line.includes(kw.toLowerCase()))) {
      notesStartIndex = i;
      break;
    }
  }

  const bodyLines = notesStartIndex === -1 ? allLines : allLines.slice(0, notesStartIndex);
  const noteLines = notesStartIndex === -1 ? [] : allLines.slice(notesStartIndex);

  let foundFirstTextParagraph = false;

  const renderParagraph = (trimmed: string, idx: number, isInsideNote = false) => {
    // 1. Headers
    if (trimmed.startsWith('### ')) {
      return <h3 key={idx} className={`font-bold mt-8 mb-4 font-book ${isInsideNote ? 'text-lg text-amber-800/70' : 'text-2xl text-amber-800 dark:text-amber-500'}`}>{trimmed.slice(4)}</h3>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={idx} className={`font-bold mt-10 mb-6 font-book border-b pb-2 ${isInsideNote ? 'text-xl text-amber-800/70 border-amber-200/30' : 'text-3xl text-amber-900 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'}`}>{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith('# ')) {
      return <h1 key={idx} className="text-4xl font-bold mt-12 mb-8 text-amber-950 dark:text-amber-300 font-book text-center uppercase tracking-wider">{trimmed.slice(2)}</h1>;
    }

    // 2. Blockquotes
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="my-8 pl-6 pr-4 py-4 border-l-4 border-amber-600 bg-amber-50/30 dark:bg-amber-900/10 italic font-book rounded-r-lg shadow-sm"
          dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(2)) }}
        />
      );
    }

    // 3. List Items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li
          key={idx}
          className="mb-4 ml-8 list-disc opacity-90 font-book marker:text-amber-600"
          dangerouslySetInnerHTML={{ __html: parseInline(trimmed.substring(2)) }}
        />
      );
    }

    // 3.5. Custom Images {{image:filename.webp|Caption}}
    const imageMatch = trimmed.match(/^{{image:(.*?)}}/);
    if (imageMatch) {
      const parts = imageMatch[1].split('|');
      const filename = parts[0].trim();
      const caption = parts[1] ? parts[1].trim() : null;

      return (
        <div key={idx} className="my-10 flex flex-col items-center w-full px-6">
          <div className="relative group transition-all duration-300">
            <img
              src={`/images/${filename}`}
              alt={caption || "Illustration"}
              className={`max-h-[500px] w-auto object-contain rounded-none shadow-xl ring-1 ring-black/5 
                  transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-2xl
                  ${themeMode === 'sepia' ? 'sepia-[.3]' : ''}
                  ${themeMode === 'dark' ? 'brightness-90' : ''}
                `}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Caption */}
          {caption && (
            <div className={`mt-4 px-6 text-center max-w-md animate-in fade-in slide-in-from-top-2 duration-700`}>
              <span className={`inline-block w-8 h-px mb-3 opacity-20 ${themeMode === 'dark' ? 'bg-amber-500' : 'bg-amber-900'}`}></span>
              <p className={`text-sm italic font-book tracking-wide leading-relaxed
                ${themeMode === 'dark' ? 'text-stone-400' : 'text-stone-500'}
              `}>
                {caption}
              </p>
            </div>
          )}
        </div>
      );
    }

    // 4. Regular Paragraphs
    const isFirstText = !isInsideNote && !foundFirstTextParagraph;
    if (isFirstText) foundFirstTextParagraph = true;

    return (
      <p
        key={idx}
        className={`mb-6 relative group font-book leading-relaxed ${isFirstText ? 'bangla-dropcap' : ''} ${isInsideNote ? 'italic text-stone-600 dark:text-stone-400 opacity-90' : ''}`}
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }}
      />
    );
  };

  return (
    <div
      style={{ fontSize: `${fontSize}px`, fontFamily: "'Tiro Bangla', serif" }}
      className={`prose max-w-none tracking-normal text-left selection:bg-amber-200
        ${themeMode === 'dark' ? 'prose-invert text-slate-300' : 'text-slate-900'}
      `}
    >
      {/* Main Body Content */}
      <div className="mb-12">
        {bodyLines.map((line, idx) => renderParagraph(line.trim(), idx))}
      </div>

      {/* Translator Notes Section */}
      {noteLines.length > 0 && (
        <div
          className={`mt-16 p-6 md:p-10 rounded-3xl border border-dashed relative transition-all duration-500 shadow-inner
            ${themeMode === 'dark'
              ? 'bg-[#121416] border-slate-800 text-slate-400'
              : themeMode === 'sepia'
                ? 'bg-[#f4ebd0] border-amber-300/50 text-stone-700'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          style={{ fontSize: `${fontSize * 0.75}px`, lineHeight: '1.6' }}
        >
          {/* Decorative Label */}
          <div className={`absolute -top-3 left-8 px-4 py-0.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold border
            ${themeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-500' : 'bg-amber-100 border-amber-200 text-amber-900'}
          `}>
            নোটস (Notes)
          </div>

          {/* Decorative Icon */}
          <div className="absolute top-6 right-6 opacity-20 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>

          <div className="pt-2">
            {noteLines.map((line, idx) => renderParagraph(line.trim(), idx + 1000, true))}
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-current opacity-20 flex justify-center">
            <img src="https://www.svgrepo.com/show/338902/ornament.svg" className="w-8 h-8 ornament grayscale opacity-50" alt="deco" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
