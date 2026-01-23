
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
  mode: 'sepia' | 'light' | 'dark' | 'soft';
  fontSize: number;
  rememberScroll?: boolean;
}

export interface Language {
  code: string;
  name: string;
  gid: string;
}

export const LANGUAGES: Language[] = [
  { code: 'bn', name: 'বাংলা', gid: '573962383' },
  { code: 'en', name: 'English', gid: '1711803682' },
  { code: 'hi', name: 'हिन्दी', gid: '1209961589' },
  { code: 'as', name: 'অসমীয়া', gid: '54556265' },
  { code: 'or', name: 'ଓଡ଼ିଆ', gid: '1435471202' },
];
