import { Component, ElementRef, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { ContentService, fromSlug, toSlug } from '../services/content.service';
import { StoreService } from '../services/store.service';

/** The table of contents of one book, grouped by chapter, with the last-read page highlighted. */
@Component({
  selector: 'app-book',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon, RouterLink],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/" /></ion-buttons>
        <ion-title>{{ category()?.name }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="fa-page">
        @for (item of items(); track item.id; let i = $index) {
          @if (item.chapter && item.chapter !== items()[i - 1]?.chapter) {
            <div class="fa-section chapter">{{ item.chapter }}</div>
          }
          <a class="fa-card row" [class.last]="item.id === lastRead()" [attr.data-id]="item.id"
             [routerLink]="['/read', slug(item.id)]">
            <span class="badge">
              @if (item.id === lastRead()) { <ion-icon name="bookmark" /> } @else { {{ i + 1 }} }
            </span>
            <span class="text">
              @if (item.id === lastRead()) { <span class="label">Last read</span> }
              <span [class.bold]="!item.chapter">{{ item.title }}</span>
            </span>
            <ion-icon name="arrow-forward" class="arrow" />
          </a>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .chapter { white-space: pre-line; line-height: 1.5; }
    .row { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; padding: 14px 16px; }
    .row.last { border: 2px solid var(--fa-accent); background: var(--fa-hero); }
    .badge {
      display: flex; align-items: center; justify-content: center; flex: none;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--fa-icon-bg); color: var(--fa-accent); font-weight: 700; font-size: 15px;
    }
    .text { flex: 1; min-width: 0; line-height: 1.4; }
    .label { display: block; color: var(--fa-accent); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .bold { font-weight: 700; }
    .arrow { flex: none; color: var(--fa-muted); }
  `,
})
export class BookPage {
  readonly cat = input.required<string>();

  private content = inject(ContentService);
  private store = inject(StoreService);
  private host = inject(ElementRef<HTMLElement>);
  protected slug = toSlug;

  protected catId = computed(() => fromSlug(this.cat()));
  protected category = computed(() => this.content.category(this.catId()));
  protected items = computed(() => this.content.itemsOf(this.catId()));
  protected lastRead = computed(() => this.store.lastRead()[this.catId()]);

  constructor() {
    this.content.load();
  }

  /** Ionic page hook: scroll the last-read page into view each time the list is shown. */
  ionViewDidEnter() {
    const id = this.lastRead();
    if (!id) return;
    const el = (this.host.nativeElement as HTMLElement).querySelector(`[data-id="${CSS.escape(id)}"]`);
    el?.scrollIntoView({ block: 'center' });
  }
}
