
export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  writer: string;
  content: string;
  index: number;
}

export interface Quote {
  id: string;
  text: string;
  chapterId: string;
  chapterTitle: string;
  timestamp: number;
}

export interface ReadingState {
  currentChapterId: string | null;
  bookmarks: string[];
  progress: Record<string, number>;
  quotes: Quote[];
}

export interface Theme {
  mode: 'sepia' | 'light' | 'dark';
  fontSize: number;
  rememberScroll?: boolean;
}
