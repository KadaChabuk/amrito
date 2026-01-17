
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  fontSize: number;
  themeMode: 'sepia' | 'light' | 'dark';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, fontSize, themeMode }) => {
  const paragraphs = content
    .split('\n')
    .filter(p => p.trim() !== '');

  return (
    <div 
      style={{ fontSize: `${fontSize}px`, fontFamily: "'Tiro Bangla', serif" }} 
      className={`prose max-w-none leading-[1.85] tracking-normal text-justify selection:bg-amber-200
        ${themeMode === 'dark' ? 'prose-invert text-slate-300' : 'text-slate-900'}
      `}
    >
      {paragraphs.map((paragraph, idx) => {
        const isFirst = idx === 0;
        
        // Handle list items
        if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
          return (
            <li key={idx} className="mb-4 ml-8 list-disc opacity-90 font-book">
              {paragraph.trim().substring(2)}
            </li>
          );
        }

        return (
          <p 
            key={idx} 
            className={`mb-8 relative group font-book ${isFirst ? 'bangla-dropcap' : ''}`}
          >
            {paragraph.trim()}
          </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
