import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar,
} from '@ionic/angular';
import { APP_VERSION, ContentService, toSlug } from '../services/content.service';
import { InstallService, PLAY_STORE_URL } from '../services/install.service';
import { StoreService } from '../services/store.service';
import { BookIconPipe } from '../shared';

@Component({
  selector: 'app-home',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, RouterLink, BookIconPipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Fadhail Amal</ion-title>
        <ion-buttons slot="end">
          @if (installer.canInstall()) {
            <ion-button (click)="installer.install()" [attr.aria-label]="installer.android ? 'Get the Android app' : 'Install app'"><ion-icon slot="icon-only" name="download-outline" /></ion-button>
          }
          <ion-button routerLink="/favorites" aria-label="Favorites"><ion-icon slot="icon-only" name="bookmark-outline" /></ion-button>
          <ion-button routerLink="/about" aria-label="About"><ion-icon slot="icon-only" name="information-circle-outline" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="fa-page">
        <section class="hero">
          <div class="bismillah" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div class="divider"></div>
          <h1>{{ english() ? 'Fadhail Amal in English' : 'Fadhail Amal ko Basa Meranaw' }}</h1>
          <p>{{ english() ? 'Choose a book to read.' : 'Pili-an sa kabaya ka a bati-an.' }}</p>
        </section>

        <div class="lang" role="group" aria-label="Language">
          <button [class.on]="english()" [attr.aria-pressed]="english()" (click)="setLanguage('eng')">English</button>
          <button [class.on]="!english()" [attr.aria-pressed]="!english()" (click)="setLanguage('mrw')">Meranaw</button>
        </div>

        @if (installer.android && installer.canInstall()) {
          <a class="fa-card fa-row play" [href]="playStoreUrl" target="_blank" rel="noopener">
            <span class="fa-icon-circle"><ion-icon name="logo-google-playstore" /></span>
            <span class="grow">
              <div class="fa-row-title">Get the Android app</div>
              <div class="fa-row-sub">Free on Google Play</div>
            </span>
            <ion-icon name="chevron-forward" color="medium" />
          </a>
        }

        <div class="fa-section">{{ english() ? 'Books' : 'Manga Kitab' }}</div>
        <div class="grid">
          @for (book of books(); track book.id) {
            <a class="fa-card book" [routerLink]="['/book', slug(book.id)]">
              <span class="fa-icon-circle big" [innerHTML]="book.icon | bookIcon"></span>
              <span class="name">{{ book.name }}</span>
              <span class="sub">{{ book.subtitle }}</span>
            </a>
          }
        </div>

        @if (!english() && sifat(); as s) {
          <div class="fa-section">Additional Reference</div>
          <a class="fa-card fa-row" [routerLink]="['/book', 'sifat']">
            <span class="fa-icon-circle" [innerHTML]="s.icon | bookIcon"></span>
            <span class="grow"><div class="fa-row-title">{{ s.name }}</div><div class="fa-row-sub">{{ s.subtitle }}</div></span>
            <ion-icon name="chevron-forward" color="medium" />
          </a>
        }

        <div class="fa-section">More</div>
        <a class="fa-card fa-row" routerLink="/favorites">
          <span class="fa-icon-circle"><ion-icon name="bookmark" /></span>
          <span class="grow"><div class="fa-row-title">Favorites</div><div class="fa-row-sub">Your saved readings</div></span>
          <ion-icon name="chevron-forward" color="medium" />
        </a>
        <a class="fa-card fa-row" routerLink="/corrections">
          <span class="fa-icon-circle"><ion-icon name="create-outline" /></span>
          <span class="grow">
            <div class="fa-row-title">My corrections</div>
            <div class="fa-row-sub">{{ store.corrections().length ? store.corrections().length + ' saved, ready to send' : 'Mistakes you marked while reading' }}</div>
          </span>
          <ion-icon name="chevron-forward" color="medium" />
        </a>
        <button class="fa-card fa-row" (click)="toggleTheme()" [attr.aria-pressed]="dark()">
          <span class="fa-icon-circle"><ion-icon [name]="dark() ? 'sunny' : 'moon'" /></span>
          <span class="grow">
            <div class="fa-row-title">{{ dark() ? 'Day mode' : 'Night mode' }}</div>
            <div class="fa-row-sub">{{ dark() ? 'Bright screen for daytime' : 'Dark screen for reading at night' }}</div>
          </span>
          <span class="switch" [class.on]="dark()" aria-hidden="true"></span>
        </button>
        <a class="fa-card fa-row" routerLink="/about">
          <span class="fa-icon-circle"><ion-icon name="information-circle-outline" /></span>
          <span class="grow"><div class="fa-row-title">About</div><div class="fa-row-sub">About the app and contact</div></span>
          <ion-icon name="chevron-forward" color="medium" />
        </a>

        <p class="footer">Fadhail Amal · v{{ version }} · © iNZPdev</p>
      </div>
    </ion-content>
  `,
  styles: `
    .hero {
      padding: 28px 20px;
      border: 1px solid var(--fa-hero-border);
      border-radius: 22px;
      background: linear-gradient(135deg, var(--fa-hero-light), var(--fa-hero));
      text-align: center;
    }
    .bismillah { color: var(--fa-ornament); font-size: 30px; line-height: 1.6; }
    .divider { width: 64px; height: 2px; margin: 14px auto; background: var(--fa-hero-border); }
    .hero h1 { margin: 0; font-size: 23px; font-weight: 700; }
    .hero p { margin: 6px 0 0; color: var(--fa-text-2); }
    .lang {
      display: grid; grid-template-columns: 1fr 1fr; margin-top: 18px; overflow: hidden;
      border: 1px solid var(--fa-stroke); border-radius: 14px; background: var(--fa-card);
    }
    .lang button {
      min-height: 54px; border: 0; background: transparent; color: var(--fa-text-2);
      font: 700 17px var(--ion-font-family); cursor: pointer;
    }
    .lang button.on { background: var(--fa-accent); color: var(--fa-on-accent); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .book {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 10px;
      text-align: center;
    }
    .fa-icon-circle.big { width: 60px; height: 60px; }
    .fa-icon-circle.big ::ng-deep svg { width: 28px; height: 28px; }
    .fa-icon-circle ::ng-deep svg { width: 24px; height: 24px; }
    .fa-icon-circle ion-icon { font-size: 22px; }
    .name { margin-top: 4px; font-size: 17px; font-weight: 700; }
    .sub { color: var(--fa-text-2); font-size: 15px; }
    .fa-row + .fa-row { margin-top: 10px; }
    .play { margin-top: 14px; border: 2px solid var(--fa-accent); }
    .switch {
      position: relative; flex: none; width: 52px; height: 30px; border-radius: 15px;
      background: var(--fa-stroke); transition: background 0.2s;
    }
    .switch::after {
      content: ''; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px;
      border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); transition: left 0.2s;
    }
    .switch.on { background: var(--fa-accent); }
    .switch.on::after { left: 25px; }
    .grow { flex: 1; min-width: 0; }
    .footer { margin: 28px 0 12px; color: var(--fa-muted); font-size: 13px; text-align: center; }
  `,
})
export class HomePage {
  protected store = inject(StoreService);
  protected installer = inject(InstallService);
  protected content = inject(ContentService);
  protected version = APP_VERSION;
  protected slug = toSlug;
  protected playStoreUrl = PLAY_STORE_URL;

  protected english = computed(() => this.store.language() === 'eng');
  protected dark = computed(() => this.store.theme() === 'dark');
  // 6 Sifat is Meranaw only and has its own row
  protected books = computed(() =>
    this.content.categories().filter((c) => c.lang === this.store.language() && c.id !== 'sifat'),
  );
  protected sifat = computed(() => this.content.category('sifat'));

  constructor() {
    this.content.load();
  }

  protected setLanguage(value: 'eng' | 'mrw') {
    this.store.setLanguage(value);
  }

  protected toggleTheme() {
    this.store.setTheme(this.dark() ? 'light' : 'dark');
  }
}
