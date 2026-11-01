import { Component, ElementRef, NgZone, OnDestroy, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFooter, IonHeader,
  IonIcon, IonModal, IonRadio, IonRadioGroup, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { ContentService, Item, fromSlug, toSlug } from '../services/content.service';
import { READER_FONTS, StoreService, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../services/store.service';

/** The longest selection that can be reported, so a report points at one spot. */
const MAX_WORDS = 15;
const MAX_CHARS = 120;

interface Selected {
  text: string;
  context: string;
}

/**
 * Shows one book page. The page is the original HTML file in an iframe (so its own CSS works),
 * sized to its content so the whole screen scrolls as one.
 */
@Component({
  selector: 'app-reader',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonFooter, IonButton, IonIcon,
    IonFab, IonFabButton, IonModal, IonRadioGroup, IonRadio,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button [defaultHref]="backHref()" /></ion-buttons>
        <ion-title>{{ headerTitle() }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="reading" [scrollEvents]="false">
      <iframe #frame title="Book page" scrolling="no" (load)="onFrameLoad()"></iframe>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="toggleFavorite()" [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'">
          <ion-icon [name]="isFavorite() ? 'bookmark' : 'bookmark-outline'" />
        </ion-fab-button>
      </ion-fab>

      @if (selected()) {
        <button class="report" slot="fixed" (click)="report()">
          <ion-icon name="create-outline" /> Report correction
        </button>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar class="nav">
        <div class="nav-row">
          <button (click)="go(-1)" [disabled]="!prev()"><ion-icon name="arrow-back" /> Prev</button>
          <button class="aa" (click)="settingsOpen.set(true)" aria-label="Text settings">Aa</button>
          <button (click)="go(1)" [disabled]="!next()">Next <ion-icon name="arrow-forward" /></button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <ion-modal [isOpen]="settingsOpen()" (didDismiss)="settingsOpen.set(false)" [initialBreakpoint]="1" [breakpoints]="[0, 1]" class="settings">
      <ng-template>
        <div class="sheet">
          <div class="sheet-head">
            <h2>Text settings</h2>
            <ion-button fill="clear" (click)="resetSettings()">Reset</ion-button>
          </div>
          <div class="size">
            <ion-button fill="outline" (click)="zoom(-1)" [disabled]="store.reader().zoom <= zoomMin" aria-label="Smaller text"><ion-icon slot="icon-only" name="remove-outline" /></ion-button>
            <span>{{ store.reader().zoom }}%</span>
            <ion-button fill="outline" (click)="zoom(1)" [disabled]="store.reader().zoom >= zoomMax" aria-label="Larger text"><ion-icon slot="icon-only" name="add-outline" /></ion-button>
          </div>
          <div class="theme" role="group" aria-label="Screen">
            <button [class.on]="store.theme() === 'light'" (click)="store.setTheme('light')"><ion-icon name="sunny" /> Day</button>
            <button [class.on]="store.theme() === 'dark'" (click)="store.setTheme('dark')"><ion-icon name="moon" /> Night</button>
          </div>
          <ion-radio-group [value]="store.reader().font" (ionChange)="setFont($event.detail.value)">
            @for (f of fonts; track f.name; let i = $index) {
              <ion-radio [value]="i" justify="space-between" [style.font-family]="f.stack">{{ f.name }}</ion-radio>
            }
          </ion-radio-group>
        </div>
      </ng-template>
    </ion-modal>
  `,
  styles: `
    .reading { --background: var(--fa-reading-bg); }
    iframe { display: block; width: 100%; height: 100vh; border: 0; }
    ion-fab { margin-bottom: 8px; }
    .report {
      position: absolute; left: 50%; top: 12px; z-index: 20; white-space: nowrap; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px; padding: 12px 20px;
      border: 0; border-radius: 24px; background: var(--fa-accent); color: var(--fa-on-accent);
      font: 600 15px var(--ion-font-family); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .nav { --background: var(--fa-bar); }
    .nav-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 6px 12px; }
    .nav-row button {
      display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px;
      border: 2px solid var(--fa-bar-accent); border-radius: 12px; background: transparent;
      color: var(--fa-bar-accent); font: 700 17px var(--ion-font-family); cursor: pointer;
    }
    .nav-row button:disabled { opacity: 0.35; }
    .nav-row .aa { border-color: var(--fa-stroke); background: var(--fa-card); color: var(--fa-text); font: 19px Georgia, serif; }
    .settings { --height: auto; }
    .sheet { padding: 16px 20px 28px; }
    .sheet-head { display: flex; align-items: center; justify-content: space-between; }
    .sheet-head h2 { margin: 0; font-size: 18px; }
    .size { display: flex; align-items: center; justify-content: center; gap: 24px; margin: 16px 0; font-size: 18px; font-weight: 700; }
    ion-radio { display: block; padding: 12px 4px; font-size: 17px; }
    .theme { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .theme button {
      display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px;
      border: 1px solid var(--fa-stroke); border-radius: 12px; background: transparent;
      color: var(--fa-text); font: 700 16px var(--ion-font-family); cursor: pointer;
    }
    .theme button.on { border-color: var(--fa-accent); background: var(--fa-accent); color: var(--fa-on-accent); }
  `,
})
export class ReaderPage implements OnDestroy {
  readonly id = input.required<string>();

  protected store = inject(StoreService);
  private content = inject(ContentService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private alerts = inject(AlertController);
  private toasts = inject(ToastController);

  private frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private ionContent = viewChild.required(IonContent);

  protected fonts = READER_FONTS;
  protected zoomMin = ZOOM_MIN;
  protected zoomMax = ZOOM_MAX;
  protected settingsOpen = signal(false);
  protected selected = signal<Selected | null>(null);

  protected item = computed(() => this.content.item(fromSlug(this.id())));
  private siblings = computed(() => (this.item() ? this.content.itemsOf(this.item()!.cat) : []));
  private index = computed(() => this.siblings().findIndex((i) => i.id === this.item()?.id));
  protected prev = computed(() => this.siblings()[this.index() - 1]);
  protected next = computed(() => this.siblings()[this.index() + 1]);
  protected isFavorite = computed(() => !!this.item() && this.store.favorites().includes(this.item()!.id));
  protected backHref = computed(() => (this.item() ? '/book/' + toSlug(this.item()!.cat) : '/'));
  protected headerTitle = computed(() => {
    const i = this.item();
    return i ? (i.chapter || i.title).replace(/\n/g, ' – ') : '';
  });

  private resizeObserver?: ResizeObserver;
  private loadedFile = '';

  constructor() {
    this.content.load();
    // Load the page whenever the item changes (opening, Prev, Next)
    effect(() => {
      const item = this.item();
      if (item) this.show(item);
    });
    // Re-apply font, size and Day/Night when the settings change
    effect(() => {
      this.store.reader();
      this.store.theme();
      this.applySettings();
    });
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private show(item: Item) {
    this.store.setLastRead(item.cat, item.id);
    if (this.loadedFile === item.file) return;
    this.loadedFile = item.file;
    this.selected.set(null);
    this.frame().nativeElement.src = 'books/' + item.file;
    this.ionContent().scrollToTop(0);
  }

  protected onFrameLoad() {
    const doc = this.frame().nativeElement.contentDocument;
    if (!doc?.body) return;
    this.applySettings();

    // Grow the iframe to fit the page, so the reader scrolls normally (also on iPhone)
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.fitHeight());
    this.resizeObserver.observe(doc.body);
    this.fitHeight();

    // Remember the selected words, so the Report button can use them even if tapping clears them
    doc.addEventListener('selectionchange', () => {
      const sel = this.readSelection();
      this.zone.run(() => this.selected.set(sel));
    });
  }

  private fitHeight() {
    const frame = this.frame().nativeElement;
    const doc = frame.contentDocument;
    if (!doc?.documentElement) return;
    frame.style.height = '0px';
    frame.style.height = doc.documentElement.scrollHeight + 'px';
  }

  /** Font and text size, added to the page as a stylesheet (like the Android app does). */
  private applySettings() {
    const doc = this.frame()?.nativeElement.contentDocument;
    if (!doc?.head) return;
    const { zoom, font } = this.store.reader();
    // Book pages switch to dark with prefers-color-scheme, which in a frame follows its color-scheme;
    // the English stylesheet also reads data-theme
    const theme = this.store.theme();
    this.frame().nativeElement.style.colorScheme = theme;
    doc.documentElement.setAttribute('data-theme', theme);
    const stack = (READER_FONTS[font] ?? READER_FONTS[0]).stack;
    let style = doc.getElementById('reader-settings');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'reader-settings';
      doc.head.appendChild(style);
    }
    const fonts = new URL('books/fonts/', document.baseURI).href;
    style.textContent =
      `@font-face{font-family:'Tinos';src:url('${fonts}Tinos-Regular.ttf')}` +
      `@font-face{font-family:'Tinos';src:url('${fonts}Tinos-Bold.ttf');font-weight:bold}` +
      `@font-face{font-family:'Tinos';src:url('${fonts}Tinos-Italic.ttf');font-style:italic}` +
      `@font-face{font-family:'Literata';src:url('${fonts}Literata.ttf');font-weight:200 900}` +
      `:root{--font-main:${stack} !important}` +
      `html{font-size:${(16 * zoom) / 100}px !important}` +
      `body,body *{font-family:var(--font-main) !important}` +
      // The book stylesheets turn off selection; allow it so readers can report mistakes
      `body,body *{-webkit-user-select:text !important;user-select:text !important}` +
      // Room at the bottom so the last line is not under the bookmark button
      `body{padding-bottom:96px !important}`;
    this.fitHeight();
  }

  /** The selected text plus about 60 characters around it, to find the spot in the file. */
  private readSelection(): Selected | null {
    const win = this.frame().nativeElement.contentWindow;
    const sel = win?.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const text = sel.toString().replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const node = sel.getRangeAt(0).startContainer;
    const el = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as Element | null;
    const block = el?.closest('p,li,blockquote,h1,h2,h3,h4,td') ?? el;
    const full = (block?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const i = full.indexOf(text);
    let context = full;
    if (i >= 0) {
      const a = Math.max(0, i - 60);
      const z = Math.min(full.length, i + text.length + 60);
      context = (a > 0 ? '…' : '') + full.substring(a, z) + (z < full.length ? '…' : '');
    } else if (full.length > 200) {
      context = full.substring(0, 200) + '…';
    }
    return { text, context };
  }

  protected async report() {
    const sel = this.selected();
    const item = this.item();
    if (!sel || !item) return;
    if (sel.text.split(' ').length > MAX_WORDS || sel.text.length > MAX_CHARS) {
      this.toast(`Please select a shorter part (up to ${MAX_WORDS} words).`);
      return;
    }
    const alert = await this.alerts.create({
      header: 'Report correction',
      subHeader: this.content.pageLabel(item),
      message: `Text with the mistake: “${sel.text}”`,
      inputs: [{ name: 'suggestion', placeholder: 'Correct text (optional)', attributes: { maxlength: 300 } }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data: { suggestion?: string }) => {
            this.store.addCorrection({
              id: Date.now(),
              book: this.content.category(item.cat)?.name ?? item.cat,
              chapter: item.chapter.replace(/\n/g, ' – ').trim(),
              title: item.title.trim(),
              file: item.file.replace(/\.html$/, ''),
              wrong: sel.text,
              suggestion: (data.suggestion ?? '').trim(),
              context: sel.context,
            });
            this.frame().nativeElement.contentWindow?.getSelection()?.removeAllRanges();
            this.selected.set(null);
            this.toast('Saved to your corrections list', true);
          },
        },
      ],
    });
    await alert.present();
  }

  protected toggleFavorite() {
    const item = this.item();
    if (!item) return;
    const added = this.store.toggleFavorite(item.id);
    this.toast(added ? 'Added to favorites' : 'Removed from favorites');
  }

  protected go(step: number) {
    const target = step < 0 ? this.prev() : this.next();
    if (target) this.router.navigate(['/read', toSlug(target.id)], { replaceUrl: true });
  }

  protected zoom(step: number) {
    const r = this.store.reader();
    const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, r.zoom + step * ZOOM_STEP));
    this.store.setReader({ ...r, zoom });
  }

  protected setFont(font: unknown) {
    if (typeof font === 'number') this.store.setReader({ ...this.store.reader(), font });
  }

  protected resetSettings() {
    this.store.resetReader();
  }

  private async toast(message: string, viewList = false) {
    const t = await this.toasts.create({
      message,
      duration: viewList ? 4000 : 1800,
      position: 'top',
      buttons: viewList ? [{ text: 'View list', handler: () => void this.router.navigate(['/corrections']) }] : [],
    });
    await t.present();
  }
}
