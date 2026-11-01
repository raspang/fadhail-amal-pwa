import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';
import { ContentService, Item, toSlug } from '../services/content.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-favorites',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonButton, IonIcon, RouterLink],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/" /></ion-buttons>
        <ion-title>Favorites</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="fa-page">
        @for (item of items(); track item.id) {
          <div class="fa-card row">
            <a class="text" [routerLink]="['/read', slug(item.id)]">
              <span class="book">{{ bookName(item) }}</span>
              <span>{{ item.title }}</span>
            </a>
            <ion-button fill="clear" color="medium" (click)="remove(item)" aria-label="Remove from favorites">
              <ion-icon slot="icon-only" name="trash-outline" />
            </ion-button>
          </div>
        } @empty {
          <div class="fa-empty">
            <h2>No favorites yet</h2>
            <p>Tap the bookmark button while reading to save a page here.</p>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .row { display: flex; align-items: center; margin-bottom: 10px; padding: 6px 4px 6px 16px; }
    .text { flex: 1; min-width: 0; padding: 8px 0; color: inherit; text-decoration: none; line-height: 1.4; }
    .book { display: block; color: var(--fa-text-2); font-size: 14px; }
  `,
})
export class FavoritesPage {
  private store = inject(StoreService);
  private content = inject(ContentService);
  private toasts = inject(ToastController);
  protected slug = toSlug;

  protected items = computed(() =>
    this.store.favorites().map((id) => this.content.item(id)).filter((i): i is Item => !!i),
  );

  constructor() {
    this.content.load();
  }

  protected bookName(item: Item) {
    return this.content.category(item.cat)?.name ?? '';
  }

  protected async remove(item: Item) {
    const before = this.store.favorites();
    this.store.setFavorites(before.filter((id) => id !== item.id));
    const t = await this.toasts.create({
      message: 'Removed from favorites',
      duration: 4000,
      buttons: [{ text: 'Undo', handler: () => this.store.setFavorites(before) }],
    });
    await t.present();
  }
}
