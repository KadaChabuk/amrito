
import React from 'react';

interface AudioPlayerProps {
    isPlaying: boolean;
    isLoading: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    t: {
        listen: string;
        playing: string;
        paused: string;
        stop: string;
        preparingAudio: string;
    };
    className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    isPlaying,
    isLoading,
    onPlay,
    onPause,
    onStop,
    t,
    className = ''
}) => {
    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out select-none ${className}`}>
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/50 dark:border-stone-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/20 dark:ring-black/20">

                {/* Status Text / Loading Indicator */}
                <div className="flex items-center gap-3 pr-4 border-r border-stone-300 dark:border-stone-700">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 animate-pulse">{t.preparingAudio}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                            <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                                {isPlaying ? t.playing : t.paused}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                        onClick={isPlaying ? onPause : onPlay}
                        disabled={isLoading}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
              ${isLoading
                                ? 'bg-stone-200 dark:bg-stone-800 cursor-not-allowed opacity-50'
                                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20 active:scale-95'
                            }`}
                    >
                        {isPlaying ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="7" y="6" width="4" height="12" rx="1" fill="currentColor" />
                                <rect x="13" y="6" width="4" height="12" rx="1" fill="currentColor" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-0.5">
                                <path d="M7 6V18L17 12L7 6Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>

                    {/* Stop Button */}
                    <button
                        onClick={onStop}
                        disabled={isLoading}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 border
              ${isLoading
                                ? 'border-stone-200 text-stone-300 dark:border-stone-800 dark:text-stone-700 cursor-not-allowed'
                                : 'border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-red-500 dark:hover:text-red-400 active:scale-95'
                            }`}
                        title={t.stop}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
