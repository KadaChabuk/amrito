
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chapter, Theme, Quote, Language } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import AudioPlayer from './AudioPlayer';
import { getTranslation } from '../translations';

interface ReaderProps {
  chapter: Chapter;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSaveQuote: (text: string) => void;
  onCloseBook?: () => void;
  onScrollUpdate?: (percentage: number) => void;
  initialProgress?: number;
  theme: Theme;
  selectedLanguage: Language;
  onAppBarVisibilityChange?: (visible: boolean) => void;
}

interface SelectionState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

type TtsStatus = 'stopped' | 'loading' | 'playing' | 'paused';

const Reader: React.FC<ReaderProps> = ({
  chapter,
  onNext,
  onPrev,
  isFirst,
  isLast,
  isBookmarked,
  onToggleBookmark,
  onSaveQuote,
  onCloseBook,
  onScrollUpdate,
  initialProgress = 0,
  theme,
  selectedLanguage,
  onAppBarVisibilityChange
}) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selection, setSelection] = useState<SelectionState>({ text: '', x: 0, y: 0, visible: false });
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('stopped');

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingChapter, setAnimatingChapter] = useState<Chapter | null>(null);
  const [animatingScrollTop, setAnimatingScrollTop] = useState(0);
  const [animationDir, setAnimationDir] = useState<'next' | 'prev' | null>(null);
  const lastScrollTop = useRef(0);

  const [resumePosition, setResumePosition] = useState<number | null>(null);

  useEffect(() => {
    if (readerRef.current) {
      if (theme.rememberScroll && initialProgress > 0 && !hasRestoredScroll) {
        // Gently ask instead of auto-scrolling
        const scrollHeight = readerRef.current.scrollHeight - readerRef.current.clientHeight;
        const targetTop = scrollHeight * initialProgress;

        if (targetTop > 200) { // Only prompt if significant progress
          setResumePosition(targetTop);
          readerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        } else {
          // Just scroll if it's near the top anyway
          readerRef.current.scrollTo({ top: targetTop, behavior: 'auto' });
        }
        setHasRestoredScroll(true);
      } else if (!hasRestoredScroll) {
        readerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        setHasRestoredScroll(true);
      }
    }
    setShowScrollTop(false);
    setSelection({ text: '', x: 0, y: 0, visible: false });
    handleStopTts();
  }, [chapter.id, isAnimating, theme.rememberScroll]);

  const handleResumeReading = () => {
    if (resumePosition !== null && readerRef.current) {
      readerRef.current.scrollTo({ top: resumePosition, behavior: 'smooth' });
      setResumePosition(null);
    }
  };

  const t = getTranslation(selectedLanguage.code);

  const isDark = theme.mode === 'dark';

  const triggerHaptic = (duration: number = 10) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) { }
    }
  };

  // Audio helper functions
  function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleStartTts = async () => {
    if (ttsStatus === 'paused' && (audioRef.current || window.speechSynthesis.speaking)) {
      if (audioRef.current) audioRef.current.play();
      else window.speechSynthesis.resume();
      setTtsStatus('playing');
      return;
    }

    setTtsStatus('loading');
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const languageCode = selectedLanguage.code;
    const audioPath = `/audio/${languageCode}/chapter_${chapter.index + 1}.mp3`;

    try {
      const response = await fetch(audioPath, { method: 'HEAD' });
      if (response.ok) {
        const audio = new Audio(audioPath);
        audioRef.current = audio;
        audio.onended = () => setTtsStatus('stopped');
        audio.onerror = () => startWebSpeechFallback();
        await audio.play();
        setTtsStatus('playing');
      } else {
        startWebSpeechFallback();
      }
    } catch (e) {
      startWebSpeechFallback();
    }
  };

  const startWebSpeechFallback = () => {
    const cleanText = chapter.content
      .replace(/{{image:.*?}}/g, '')
      .replace(/[#*`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap: Record<string, string> = {
      'bn': 'bn-IN',
      'hi': 'hi-IN',
      'en': 'en-US',
      'as': 'bn-IN', // Fallback for Assamese
      'or': 'hi-IN'  // Fallback for Odia
    };

    utterance.lang = langMap[selectedLanguage.code] || 'bn-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setTtsStatus('stopped');
    utterance.onerror = () => setTtsStatus('stopped');

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTtsStatus('playing');
  };

  const handlePauseTts = () => {
    if (audioRef.current) audioRef.current.pause();
    else window.speechSynthesis.pause();
    setTtsStatus('paused');
  };

  const handleStopTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setTtsStatus('stopped');
  };

  const playSwishSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.warn("Audio context failed", e);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollTop = el.scrollTop;
    setShowScrollTop(scrollTop > 400);

    // Auto-hide AppBar on mobile based on scroll direction
    if (onAppBarVisibilityChange) {
      const scrollingDown = scrollTop > lastScrollTop.current && scrollTop > 80;
      const scrollingUp = scrollTop < lastScrollTop.current;

      if (scrollingDown) {
        onAppBarVisibilityChange(false); // Hide AppBar when scrolling down
      } else if (scrollingUp || scrollTop < 50) {
        onAppBarVisibilityChange(true); // Show AppBar when scrolling up or near top
      }

      lastScrollTop.current = scrollTop;
    }

    if (theme.rememberScroll && hasRestoredScroll) {
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        onScrollUpdate?.(scrollTop / scrollHeight);
      }
    }
  };

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY,
        visible: true
      });
    } else {
      setSelection(prev => ({ ...prev, visible: false }));
    }
  };

  const handleSaveToQuotes = () => {
    triggerHaptic(15);
    onSaveQuote(selection.text);
    setToast("উদ্ধৃতি হিসেবে সংরক্ষণ করা হয়েছে");
    window.getSelection()?.removeAllRanges();
    setSelection(prev => ({ ...prev, visible: false }));
  };

  const handleWhatsAppShare = () => {
    triggerHaptic(15);
    const bookTitle = "শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী";
    const formattedText = `📜 *${bookTitle}*\n📖 অধ্যায়: *${chapter.title}*\n\n「 ${selection.text} 」\n\n— শ্রীশ্রীবালক ব্রহ্মচারী ডিজিটাল সংকলন`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
    window.open(whatsappUrl, '_blank');
    window.getSelection()?.removeAllRanges();
    setSelection(prev => ({ ...prev, visible: false }));
  };

  const handleFacebookShare = async () => {
    triggerHaptic(15);
    const bookTitle = "শ্রীশ্রীবালক ব্রহ্মচারীর শৈশব কাহিনী";
    const formattedText = `📜 *${bookTitle}*\n📖 অধ্যায়: *${chapter.title}*\n\n「 ${selection.text} 」\n\n— শ্রীশ্রীবালক ব্রহ্মচারী ডিজিটাল সংকলন`;
    if (navigator.share) {
      try {
        await navigator.share({ title: bookTitle, text: formattedText, url: window.location.href });
      } catch (err) { console.error("Native share failed:", err); }
    } else {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(formattedText)}`;
      window.open(fbUrl, '_blank');
    }
    window.getSelection()?.removeAllRanges();
    setSelection(prev => ({ ...prev, visible: false }));
  };

  const handleScrollToTop = () => {
    triggerHaptic(5);
    readerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!isLast && !isAnimating) {
      triggerHaptic(20);
      playSwishSound();

      // Capture current state before animation
      setAnimatingChapter(chapter);
      setAnimatingScrollTop(readerRef.current?.scrollTop || 0);
      setAnimationDir('next');
      setIsAnimating(true);

      // Delay the actual chapter switch
      setTimeout(() => onNext(), 100);

      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDir(null);
        setAnimatingChapter(null);
        setAnimatingScrollTop(0);
      }, 1200);
    }
  };

  const handlePrev = () => {
    if (!isFirst && !isAnimating) {
      triggerHaptic(20);
      playSwishSound();

      // Capture current state before animation
      setAnimatingChapter(chapter);
      setAnimatingScrollTop(readerRef.current?.scrollTop || 0);
      setAnimationDir('prev');
      setIsAnimating(true);

      // Delay the actual chapter switch
      setTimeout(() => onPrev(), 100);

      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDir(null);
        setAnimatingChapter(null);
        setAnimatingScrollTop(0);
      }, 1200);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className={`relative h-full flex flex-col ${isDark ? 'bg-stone-900 text-stone-100' : 'bg-[#fffdfa] text-stone-900'}`}>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-amber-800 text-amber-50 rounded-full shadow-lg text-sm font-main animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      {resumePosition !== null && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none pb-8 md:pb-0 font-main">
          <div
            className={`pointer-events-auto mx-4 w-full max-w-sm p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 border ${isDark ? 'bg-stone-800 border-amber-900/30' : 'bg-[#fffdfa] border-amber-100'}`}
          >
            <div className="flex flex-col gap-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-amber-500/20 text-amber-600 rounded-full p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                </div>
                <h3 className={`text-base font-bold ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>{t.resumeReading}?</h3>
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setResumePosition(null); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-stone-700 hover:bg-stone-600 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'}`}
                >
                  {t.no}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleResumeReading(); }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {t.yes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection Menu */}
      {selection.visible && (
        <div
          className="fixed z-50 flex items-center gap-1 p-1 bg-stone-800 text-white rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200"
          style={{
            left: `${selection.x}px`,
            top: `${selection.y - 60}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button onClick={handleSaveToQuotes} className="p-2 hover:bg-white/10 rounded-md transition-colors" title="Save Quote">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button onClick={handleWhatsAppShare} className="p-2 hover:bg-green-500/20 text-green-400 rounded-md transition-colors" title="Share on WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14 8.38 8.38 0 0 1 3.8.9L21 3z" /></svg>
          </button>
          <button onClick={handleFacebookShare} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-md transition-colors" title="Share/Copy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          </button>
        </div>
      )}

      <div
        ref={readerRef}
        className="flex-1 overflow-y-auto scroll-smooth hide-scrollbar"
        onScroll={handleScroll}
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
      >
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-16 md:pt-10 pb-10 md:pb-16">
          <header className="mb-12 md:mb-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className={`h-px w-8 md:w-12 ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}></span>
              <span className={`text-sm md:text-base font-book tracking-[0.2em] uppercase ${isDark ? 'text-amber-500/60' : 'text-amber-800/60'}`}>{t.chapter} {chapter.index + 1}</span>
              <span className={`h-px w-8 md:w-12 ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}></span>
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-book leading-tight mb-6 ${isDark ? 'text-stone-100' : 'text-stone-900'} filter drop-shadow-sm`}>
              {chapter.title}
            </h1>
            {chapter.writer && (
              <div className="flex flex-col items-center gap-3">
                <span className={`h-px w-6 md:w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span>
                <p className="text-lg md:text-xl lg:text-2xl font-gentle opacity-80">{chapter.writer}</p>
                <span className={`h-px w-6 md:w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span>
              </div>
            )}
          </header>
          <div className="max-w-3xl mx-auto mb-20"><MarkdownRenderer content={chapter.content} fontSize={theme.fontSize} themeMode={theme.mode} /></div>
          <nav className={`max-w-3xl mx-auto py-12 border-t flex justify-center items-center group ${isDark ? 'border-stone-800/50' : 'border-stone-200/50'}`}>
            <div className="text-stone-400 font-book text-sm select-none opacity-50">§ {chapter.index + 1}</div>
          </nav>
        </div>
      </div>

      {/* Floating Navigation Buttons - Simple & Clean */}
      {!isFirst && (
        <button
          onClick={handlePrev}
          className={`fixed top-1/2 left-4 md:left-8 -translate-y-1/2 z-30 p-2 transition-all duration-200 group
            ${isDark ? 'text-stone-600 hover:text-amber-400' : 'text-stone-300 hover:text-amber-600'}
          `}
          aria-label="Previous Chapter"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {!isLast && (
        <button
          onClick={handleNext}
          className={`fixed top-1/2 right-4 md:right-8 -translate-y-1/2 z-30 p-2 transition-all duration-200 group
            ${isDark ? 'text-stone-600 hover:text-amber-400' : 'text-stone-300 hover:text-amber-600'}
          `}
          aria-label="Next Chapter"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {isAnimating && animatingChapter && (
        <>
          {/* Dynamic Under-page Shadow cast on the new content */}
          <div className="under-page-shadow fixed inset-0 pointer-events-none"></div>

          <div className="page-turn-overlay fixed inset-0 pointer-events-none z-50 book-perspective">
            <div
              className={`w-full h-full absolute inset-0 origin-left overflow-y-scroll
              ${animationDir === 'next' ? 'page-turn-next' : 'page-turn-prev'} 
              ${isDark ? 'bg-stone-900 text-stone-100' : 'bg-[#fffdfa] text-stone-900'} 
              paper-texture border-l border-white/5 shadow-2xl`}
            >
              {/* Render the ACTUAL content at the current scroll position */}
              <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-16" style={{ marginTop: `-${animatingScrollTop}px` }}>
                <header className="mb-12 md:mb-16 text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className={`h-px w-8 md:w-12 ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}></span>
                    <span className={`text-sm md:text-base font-book tracking-[0.2em] uppercase ${isDark ? 'text-amber-500/60' : 'text-amber-800/60'}`}>{t.chapter} {animatingChapter.index + 1}</span>
                    <span className={`h-px w-8 md:w-12 ${isDark ? 'bg-stone-800' : 'bg-stone-200'}`}></span>
                  </div>
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-book leading-tight mb-6 ${isDark ? 'text-stone-100' : 'text-stone-900'} filter drop-shadow-sm`}>
                    {animatingChapter.title}
                  </h1>
                  {animatingChapter.writer && (
                    <div className="flex flex-col items-center gap-3">
                      <span className={`h-px w-6 md:w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span>
                      <p className="text-lg md:text-xl lg:text-2xl font-gentle opacity-80">{animatingChapter.writer}</p>
                      <span className={`h-px w-6 md:w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span>
                    </div>
                  )}
                </header>
                <div className="max-w-3xl mx-auto mb-20">
                  <MarkdownRenderer content={animatingChapter.content} fontSize={theme.fontSize} themeMode={theme.mode} />
                </div>
              </div>

              {/* Page curl gradient on the turning edge */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 via-black/8 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </>
      )}

      <button onClick={handleScrollToTop} className={`fixed bottom-8 right-6 md:right-12 p-3 rounded-full shadow-lg transition-all duration-300 transform z-30 border ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${isDark ? 'bg-stone-800 border-stone-700 text-amber-400' : 'bg-white border-stone-200 text-stone-600'}`} aria-label="Back to top"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg></button>

    </div>
  );
};

export default Reader;
