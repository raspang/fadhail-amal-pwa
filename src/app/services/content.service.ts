import { Injectable, computed, signal } from '@angular/core';

/** A book, e.g. "Totolan ko mga Sahaba" or the English "Sahaabah". */
export interface Category {
  id: string; // also the folder under public/books, e.g. "sahabah" or "eng/sahaabah"
  name: string;
  subtitle: string;
  icon: string; // key in BOOK_ICONS
  lang: 'mrw' | 'eng';
}

/** One page of a book. */
export interface Item {
  id: string; // same ids as the Android app
  chapter: string; // chapter heading, may be empty (cover pages)
  title: string;
  cat: string;
  file: string; // path under public/books
}

export const APP_VERSION = '3.9.0';
export const DEVELOPER_EMAIL = 'raspangv1@gmail.com';

/** "eng/sahaabah" -> "eng~sahaabah", so ids with a slash fit in one URL segment. */
export const toSlug = (id: string) => id.replace(/\//g, '~');
export const fromSlug = (slug: string) => slug.replace(/~/g, '/');

/**
 * The table of contents of every book, converted from the Android app's SahabaContent.java
 * into public/data/content.json.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly categories = signal<Category[]>([]);
  readonly items = signal<Item[]>([]);
  readonly loaded = computed(() => this.items().length > 0);

  private readonly byId = computed(() => new Map(this.items().map((i) => [i.id, i])));
  private loading?: Promise<void>;

  load(): Promise<void> {
    this.loading ??= fetch('data/content.json')
      .then((r) => r.json())
      .then((data: { categories: Category[]; items: Item[] }) => {
        this.categories.set(data.categories);
        this.items.set(data.items);
      });
    return this.loading;
  }

  category(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  item(id: string): Item | undefined {
    return this.byId().get(id);
  }

  itemsOf(catId: string): Item[] {
    return this.items().filter((i) => i.cat === catId);
  }

  /** "Totolan ko mga Sahaba › CHAPTER › Page title" */
  pageLabel(item: Item): string {
    const book = this.category(item.cat)?.name ?? item.cat;
    const chapter = item.chapter.replace(/\n/g, ' – ').trim();
    return [book, chapter, item.title.trim()].filter((s) => s).join(' › ');
  }
}
