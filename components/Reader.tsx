
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
  selectedLanguage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selection, setSelection] = useState<SelectionState>({ text: '', x: 0, y: 0, visible: false });
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // TTS State
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('stopped');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDir, setAnimationDir] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Reset scroll or Restore saved position on chapter change
  useEffect(() => {
    setHasRestoredScroll(false);
    if (readerRef.current && !isAnimating) {
      if (theme.rememberScroll && initialProgress > 0) {
        setTimeout(() => {
          if (readerRef.current) {
            const scrollHeight = readerRef.current.scrollHeight - readerRef.current.clientHeight;
            readerRef.current.scrollTo({ top: scrollHeight * initialProgress, behavior: 'auto' });
            setHasRestoredScroll(true);
          }
        }, 100);
      } else {
        readerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        setHasRestoredScroll(true);
      }
    }
    setShowScrollTop(false);
    setSelection({ text: '', x: 0, y: 0, visible: false });
    handleStopTts();
  }, [chapter.id, isAnimating, theme.rememberScroll]);

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

  const cleanTextForTts = (text: string) => {
    return text
      .replace(/{{image:.*?}}/g, '') // Remove image tags
      .replace(/[#*`_~]/g, '')       // Remove basic markdown
      .replace(/\n+/g, ' ')          // Flatten newlines
      .trim();
  };

  const handleStartTts = () => {
    if (ttsStatus === 'playing') return;
    triggerHaptic(15);

    // If already paused, resume either local audio or web speech
    if (ttsStatus === 'paused') {
      if (localAudioRef.current) {
        localAudioRef.current.play();
      } else {
        window.speechSynthesis.resume();
      }
      setTtsStatus('playing');
      return;
    }

    setTtsStatus('loading');

    // Stop any existing speech/audio
    window.speechSynthesis.cancel();
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current = null;
    }

    // Attempt to play local file first: /audio/{lang}/{chapter_id}.mp3
    const audioPath = `/audio/${selectedLanguage.code}/${chapter.id}.mp3`;
    const audio = new Audio(audioPath);

    audio.oncanplaythrough = () => {
      audio.play();
      setTtsStatus('playing');
    };

    audio.onended = () => {
      setTtsStatus('stopped');
      localAudioRef.current = null;
    };

    audio.onerror = () => {
      // Fallback to Web Speech API if local file fails
      console.log(`Local audio not found at ${audioPath}, falling back to Web Speech`);
      startWebSpeech();
    };

    localAudioRef.current = audio;
  };

  const startWebSpeech = () => {
    const textToRead = `${chapter.title}. ${chapter.writer ? 'by ' + chapter.writer : ''}. ${cleanTextForTts(chapter.content)}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);

    const langTags: Record<string, string> = {
      'bn': 'bn-BD', 'en': 'en-US', 'hi': 'hi-IN', 'or': 'or-IN', 'as': 'as-IN'
    };
    utterance.lang = langTags[selectedLanguage.code] || 'bn-BD';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(selectedLanguage.code) && v.localService);
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setTtsStatus('playing');
    utterance.onend = () => setTtsStatus('stopped');
    utterance.onerror = () => setTtsStatus('stopped');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTts = () => {
    if (ttsStatus === 'playing') {
      triggerHaptic(10);
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      } else {
        window.speechSynthesis.pause();
      }
      setTtsStatus('paused');
    }
  };

  const handleStopTts = () => {
    triggerHaptic(10);
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current = null;
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

    if (theme.rememberScroll && hasRestoredScroll) {
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        onScrollUpdate?.(scrollTop / scrollHeight);
      }
    }

    if (selection.visible) {
      setSelection(prev => ({ ...prev, visible: false }));
    }
  };

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top,
        visible: true
      });
    } else {
      setSelection(prev => ({ ...prev, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [handleSelection]);

  const handleCopy = async () => {
    triggerHaptic(10);
    try {
      await navigator.clipboard.writeText(selection.text);
      setToast("কপি করা হয়েছে");
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    window.getSelection()?.removeAllRanges();
    setSelection(prev => ({ ...prev, visible: false }));
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
      setAnimationDir('next');
      setIsAnimating(true);
      setTimeout(() => onNext(), 450);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDir(null);
      }, 1000);
    }
  };

  const handlePrev = () => {
    if (!isFirst && !isAnimating) {
      triggerHaptic(20);
      playSwishSound();
      setAnimationDir('prev');
      setIsAnimating(true);
      setTimeout(() => onPrev(), 450);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDir(null);
      }, 1000);
    }
  };

  const getThemeClasses = () => {
    switch (theme.mode) {
      case 'dark': return 'bg-[#1a1c1e] text-slate-200 paper-texture brightness-90';
      case 'sepia': return 'bg-[#fcf5e5] text-stone-900 paper-texture';
      default: return 'bg-[#ffffff] text-slate-900 paper-texture';
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col h-full overflow-hidden transition-colors duration-500 relative ${getThemeClasses()}`}>

      {/* Selection Menu */}
      {selection.visible && (
        <div className="fixed z-[120] -translate-x-1/2 -translate-y-[125%] transition-all duration-200 pointer-events-auto" style={{ left: selection.x, top: selection.y }}>
          <div className={`flex items-center gap-1.5 p-1.5 rounded-full shadow-2xl border backdrop-blur-md ${isDark ? 'bg-stone-800/95 border-stone-700' : 'bg-white/95 border-stone-200'}`}>
            <button onClick={handleCopy} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isDark ? 'text-stone-300' : 'text-stone-700'}`} title="Copy Text">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button onClick={handleSaveToQuotes} className="p-2 text-red-500 hover:bg-black/5 rounded-full transition-colors" title="Save Quote">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </button>
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}></div>
            <button onClick={handleWhatsAppShare} className="p-2 text-[#25D366] active:scale-90"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.632 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg></button>
            <button onClick={handleFacebookShare} className="p-2 text-[#1877F2] active:scale-90"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></button>
          </div>
          <div className={`w-3 h-3 rotate-45 mx-auto -mt-1.5 border-r border-b ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}></div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-gentle shadow-xl animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center px-10 py-4 z-20">
        <button onClick={onCloseBook} className={`flex items-center gap-2 font-book transition-all group ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-700'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span className="text-sm">বই বন্ধ করুন</span></button>
        <div className="flex items-center gap-6">
          <button onClick={() => { triggerHaptic(15); onToggleBookmark(); }} className={`flex items-center gap-2 font-book ${isBookmarked ? 'text-amber-500' : (isDark ? 'text-stone-600 hover:text-amber-400' : 'text-stone-300 hover:text-amber-400')}`}><span className="text-sm">{isBookmarked ? 'বুকমার্ক' : 'বুকমার্ক'}</span><svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg></button>
        </div>
      </div>

      <div ref={readerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto px-6 py-6 md:py-12 md:px-24 lg:px-48 xl:px-64 w-full scroll-smooth ${isAnimating ? 'pointer-events-none' : ''}`}>
        <div className={`relative transition-opacity duration-300 ${isAnimating ? 'opacity-20' : 'opacity-100'}`}>
          <header className="mb-8 md:mb-12 text-center max-w-4xl mx-auto">
            <p className={`font-gentle text-lg md:text-xl lg:text-2xl mb-4 md:mb-6 tracking-wide ${isDark ? 'text-amber-400/80' : 'text-amber-700/80'}`}>{chapter.writer}</p>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-cursive font-normal mb-6 md:mb-8 leading-[1.3] md:leading-[1.3] drop-shadow-md ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{chapter.title}</h1>
            {chapter.subtitle && (
              <div className={`flex items-center justify-center gap-3 md:gap-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                <span className={`h-px w-6 md:w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span>
                <p className="text-lg md:text-xl lg:text-2xl font-gentle opacity-80">{chapter.subtitle}</p>
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

      {/* Floating Navigation Buttons */}
      {!isFirst && (
        <button
          onClick={handlePrev}
          className={`fixed top-1/2 left-2 md:left-6 -translate-y-1/2 z-30 p-3 rounded-full transition-all duration-300 backdrop-blur-sm group
            ${isDark ? 'bg-stone-800/20 hover:bg-stone-800/60 text-stone-500 hover:text-amber-400' : 'bg-stone-200/20 hover:bg-stone-200/60 text-stone-400 hover:text-amber-700'}
          `}
          aria-label="Previous Chapter"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {!isLast && (
        <button
          onClick={handleNext}
          className={`fixed top-1/2 right-2 md:right-6 -translate-y-1/2 z-30 p-3 rounded-full transition-all duration-300 backdrop-blur-sm group
            ${isDark ? 'bg-stone-800/20 hover:bg-stone-800/60 text-stone-500 hover:text-amber-400' : 'bg-stone-200/20 hover:bg-stone-200/60 text-stone-400 hover:text-amber-700'}
          `}
          aria-label="Next Chapter"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {isAnimating && (
        <div className="page-turn-overlay absolute inset-0 overflow-hidden pointer-events-none z-50 book-perspective">
          <div className={`flipping-page w-full h-full absolute inset-0 origin-left 
            ${animationDir === 'next' ? 'page-flip-next-animation' : 'page-flip-prev-animation'} 
            ${isDark ? 'bg-[#1a1c1e] text-slate-200' : 'bg-[#fcf5e5] text-stone-900'} 
            paper-texture shadow-2xl border-l border-stone-300/20`}
          >
            {/* Content Mirror for realistic effect (Simplified) */}
            <div className="p-12 md:p-24 opacity-30 select-none overflow-hidden h-full">
              <div className="w-full h-full bg-stone-500/5"></div>
            </div>

            {/* Shadow Gradient */}
            <div className={`absolute inset-0 ${animationDir === 'next' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-black/10 via-transparent to-transparent pointer-events-none`}></div>
          </div>
        </div>
      )}

      <button onClick={handleScrollToTop} className={`fixed bottom-8 right-6 md:right-12 p-3 rounded-full shadow-lg transition-all duration-300 transform z-30 border ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${isDark ? 'bg-stone-800 border-stone-700 text-amber-400' : 'bg-white border-stone-200 text-stone-600'}`} aria-label="Back to top"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg></button>

      <AudioPlayer
        isPlaying={ttsStatus === 'playing'}
        isLoading={ttsStatus === 'loading'}
        onPlay={handleStartTts}
        onPause={handlePauseTts}
        onStop={handleStopTts}
        t={t}
      />
    </div>
  );
};

export default Reader;
