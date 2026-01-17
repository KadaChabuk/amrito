
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Chapter, Theme, Quote } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { GoogleGenAI, Modality } from "@google/genai";

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
  theme
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
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

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
    if (ttsStatus === 'playing') return;
    triggerHaptic(15);

    if (ttsStatus === 'paused' && audioBuffer) {
      playBuffer(pausedAtRef.current);
      setTtsStatus('playing');
      return;
    }

    setTtsStatus('loading');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this chapter titled "${chapter.title}" by ${chapter.writer} professionally and with spiritual reverence: ${chapter.content.substring(0, 3000)}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioCtxRef.current;
        const decodedBytes = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
        setAudioBuffer(buffer);
        playBuffer(0, buffer);
        setTtsStatus('playing');
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setTtsStatus('stopped');
    }
  };

  const playBuffer = (offset: number, bufferToUse?: AudioBuffer) => {
    const ctx = audioCtxRef.current;
    const buffer = bufferToUse || audioBuffer;
    if (!ctx || !buffer) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      if (ttsStatus === 'playing' && Math.abs((ctx.currentTime - startTimeRef.current) - buffer.duration) < 0.1) {
        setTtsStatus('stopped');
        pausedAtRef.current = 0;
      }
    };

    source.start(0, offset);
    sourceRef.current = source;
    startTimeRef.current = ctx.currentTime - offset;
  };

  const handlePauseTts = () => {
    if (ttsStatus !== 'playing') return;
    triggerHaptic(10);
    const ctx = audioCtxRef.current;
    if (ctx && sourceRef.current) {
      pausedAtRef.current = ctx.currentTime - startTimeRef.current;
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setTtsStatus('paused');
  };

  const handleStopTts = () => {
    triggerHaptic(20);
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setAudioBuffer(null);
    setTtsStatus('stopped');
    pausedAtRef.current = 0;
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <button onClick={handleSaveToQuotes} className="p-2 text-red-500 hover:bg-black/5 rounded-full transition-colors" title="Save Quote">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}></div>
            <button onClick={handleWhatsAppShare} className="p-2 text-[#25D366] active:scale-90"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.433 5.632 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
            <button onClick={handleFacebookShare} className="p-2 text-[#1877F2] active:scale-90"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
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
        <button onClick={onCloseBook} className={`flex items-center gap-2 font-book transition-all group ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-700'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="text-sm">বই বন্ধ করুন</span></button>
        <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-amber-50/50 border-amber-200/50'}`}>
              {ttsStatus === 'loading' ? (<div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>) : ttsStatus === 'playing' ? (<button onClick={handlePauseTts} className="p-1 text-amber-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>) : (<button onClick={handleStartTts} className="p-1 text-amber-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>)}
              {ttsStatus !== 'stopped' && (<button onClick={handleStopTts} className="p-1 text-red-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg></button>)}
              <span className={`text-xs font-gentle ${isDark ? 'text-stone-400' : 'text-amber-800/60'}`}>{ttsStatus === 'loading' ? 'প্রস্তুত হচ্ছে...' : ttsStatus === 'stopped' ? 'শুনুন' : 'পড়া হচ্ছে'}</span>
            </div>
            <button onClick={() => {triggerHaptic(15); onToggleBookmark();}} className={`flex items-center gap-2 font-book ${isBookmarked ? 'text-amber-500' : (isDark ? 'text-stone-600 hover:text-amber-400' : 'text-stone-300 hover:text-amber-400')}`}><span className="text-sm">{isBookmarked ? 'বুকমার্ক' : 'বুকমার্ক'}</span><svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></button>
        </div>
      </div>

      <div ref={readerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto px-6 py-6 md:py-12 md:px-24 lg:px-48 xl:px-64 w-full scroll-smooth ${isAnimating ? 'pointer-events-none' : ''}`}>
        <div className={`relative transition-opacity duration-300 ${isAnimating ? 'opacity-20' : 'opacity-100'}`}>
          <header className="mb-12 text-center max-w-4xl mx-auto">
            <p className={`font-gentle text-xl md:text-2xl mb-6 tracking-wide ${isDark ? 'text-amber-400/80' : 'text-amber-700/80'}`}>{chapter.writer}</p>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-cursive font-normal mb-8 leading-[1.2] drop-shadow-md ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{chapter.title}</h1>
            {chapter.subtitle && (<div className={`flex items-center justify-center gap-4 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}><span className={`h-px w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span><p className="text-xl md:text-2xl font-gentle opacity-80">{chapter.subtitle}</p><span className={`h-px w-8 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`}></span></div>)}
          </header>
          <div className="max-w-3xl mx-auto mb-20"><MarkdownRenderer content={chapter.content} fontSize={theme.fontSize} themeMode={theme.mode} /></div>
          <nav className={`max-w-3xl mx-auto py-12 border-t flex justify-between items-center group ${isDark ? 'border-stone-800/50' : 'border-stone-200/50'}`}>
            <button onClick={handlePrev} disabled={isFirst} className={`flex items-center gap-4 transition-all ${isFirst ? 'opacity-0' : (isDark ? 'text-stone-500 hover:text-amber-400' : 'text-stone-400 hover:text-amber-800')}`}><div className={`p-3 rounded-full border ${isDark ? 'border-stone-800' : 'border-stone-200'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></div><div className="hidden md:block"><span className="block text-[10px] uppercase tracking-widest font-bold opacity-50 font-sans">পূর্ববর্তী</span><span className="font-gentle text-lg">আগের পাতা</span></div></button>
            <div className="text-stone-400 font-book text-sm select-none opacity-50">§ {chapter.index + 1}</div>
            <button onClick={handleNext} disabled={isLast} className={`flex items-center gap-4 transition-all ${isLast ? 'opacity-0' : (isDark ? 'text-stone-500 hover:text-amber-400' : 'text-stone-400 hover:text-amber-800')}`}><div className="hidden md:block"><span className="block text-[10px] uppercase tracking-widest font-bold opacity-50 font-sans">পরবর্তী</span><span className="font-gentle text-lg">পরের পাতা</span></div><div className={`p-3 rounded-full border ${isDark ? 'border-stone-800' : 'border-stone-200'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div></button>
          </nav>
        </div>
      </div>

      {isAnimating && (
        <div className="page-turn-overlay absolute inset-0 overflow-hidden">
          <div className={`flipping-page ${animationDir === 'next' ? 'page-flip-next-animation' : 'page-flip-prev-animation'} ${isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} paper-texture`}>
            <div className={`absolute inset-0 ${animationDir === 'next' ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-black/5 via-transparent to-transparent`}></div>
          </div>
          <div className="flip-shadow"></div>
        </div>
      )}

      <button onClick={handleScrollToTop} className={`fixed bottom-8 right-6 md:right-12 p-3 rounded-full shadow-lg transition-all duration-300 transform z-30 border ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${isDark ? 'bg-stone-800 border-stone-700 text-amber-400' : 'bg-white border-stone-200 text-stone-600'}`} aria-label="Back to top"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg></button>
    </div>
  );
};

export default Reader;
