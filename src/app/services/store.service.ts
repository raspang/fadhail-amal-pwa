import { Injectable, signal } from '@angular/core';

export interface ReaderSettings {
  zoom: number; // percent, 80..160
  font: number; // index into READER_FONTS
}

export interface Correction {
  id: number; // creation time
  book: string;
  chapter: string;
  title: string;
  file: string; // e.g. "sahabah/pinto-an-1-10"
  wrong: string;
  suggestion: string;
  context: string;
}

export const READER_FONTS = [
  { name: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { name: 'Times (Tinos)', stack: "'Tinos', 'Times New Roman', serif" },
  { name: 'Literata', stack: "'Literata', Georgia, serif" },
  { name: 'Sans', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
];
export const ZOOM_MIN = 80;
export const ZOOM_MAX = 160;
export const ZOOM_STEP = 10;
const DEFAULT_SETTINGS: ReaderSettings = { zoom: 100, font: 0 };

export type Theme = 'light' | 'dark';

/** Same colours as --fa-bar in styles.scss, for the phone's status bar. */
const BAR_COLORS: Record<Theme, string> = { light: '#0b5d3b', dark: '#091024' };

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLORS[theme]);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: the app still works, it just won't remember this
  }
}

/** Everything the app remembers on the phone (like SharedPreferences on Android). */
@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly language = signal<'mrw' | 'eng'>(read('fa.language', 'mrw'));
  readonly lastRead = signal<Record<string, string>>(read('fa.lastRead', {}));
  readonly favorites = signal<string[]>(read('fa.favorites', []));
  readonly reader = signal<ReaderSettings>({ ...DEFAULT_SETTINGS, ...read('fa.reader', {}) });
  readonly corrections = signal<Correction[]>(read('fa.corrections', []));
  /** Light by default; index.html applies the saved choice before the app starts. */
  readonly theme = signal<Theme>(read('fa.theme', 'light'));

  setTheme(theme: Theme) {
    this.theme.set(theme);
    write('fa.theme', theme);
    applyTheme(theme);
  }

  setLanguage(lang: 'mrw' | 'eng') {
    this.language.set(lang);
    write('fa.language', lang);
  }

  setLastRead(catId: string, itemId: string) {
    this.lastRead.update((m) => ({ ...m, [catId]: itemId }));
    write('fa.lastRead', this.lastRead());
  }

  isFavorite(id: string) {
    return this.favorites().includes(id);
  }

  toggleFavorite(id: string): boolean {
    const added = !this.isFavorite(id);
    this.favorites.update((f) => (added ? [...f, id] : f.filter((x) => x !== id)));
    write('fa.favorites', this.favorites());
    return added;
  }

  setFavorites(ids: string[]) {
    this.favorites.set(ids);
    write('fa.favorites', ids);
  }

  setReader(settings: ReaderSettings) {
    this.reader.set(settings);
    write('fa.reader', settings);
  }

  resetReader() {
    this.setReader({ ...DEFAULT_SETTINGS });
  }

  addCorrection(c: Correction) {
    this.setCorrections([...this.corrections(), c]);
  }

  setCorrections(list: Correction[]) {
    this.corrections.set(list);
    write('fa.corrections', list);
  }

  removeCorrections(ids: number[]) {
    this.setCorrections(this.corrections().filter((c) => !ids.includes(c.id)));
  }
}
