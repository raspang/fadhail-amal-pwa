import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { APP_VERSION, DEVELOPER_EMAIL } from '../services/content.service';
import { PLAY_STORE_URL } from '../services/install.service';
import { openEmail } from '../services/mailer';

@Component({
  selector: 'app-about',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon, RouterLink],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/" /></ion-buttons>
        <ion-title>About</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="fa-page">
        <div class="head">
          <img src="icons/icon-192x192.png" alt="" width="88" height="88" />
          <h1>Fadhail Amal</h1>
          <p>Fadhail Amal ko Basa Meranaw</p>
          <p class="version">Version {{ version }} (web)</p>
        </div>

        <div class="fa-section">About this app</div>
        <div class="fa-card box">
          <p>Assalaamu 'alaikum!</p>
          <p>This app brings the Meranaw translation of Fadhail Amal to your phone. It also includes the English Fadhail Amal books, which you can find in the English tab.</p>
          <p>The Meranaw text was scanned from the printed book and converted with OCR (Optical Character Recognition), so some typing mistakes may remain. If you find one, select the words while reading and tap “Report correction”, so it can be corrected.</p>
          <p>Please note that using phones is not recommended during Ta'leem, and especially during Khurooj. This app is meant for Infiradi (personal reading and reflection).</p>
          <p>This is a non-commercial project. May Allah (SWT) reward us all.</p>
        </div>

        <div class="fa-section">Install the app</div>
        <a class="fa-card fa-row play" [href]="playStoreUrl" target="_blank" rel="noopener">
          <span class="fa-icon-circle"><ion-icon name="logo-google-playstore" /></span>
          <span class="grow"><div class="fa-row-title">Android phone?</div><div class="fa-row-sub">Get the Android app, free on Google Play</div></span>
          <ion-icon name="chevron-forward" color="medium" />
        </a>
        <div class="fa-card box">
          <p>On other phones and computers, tap the <b>Install</b> button <ion-icon name="download-outline" /> at the top of the home page. The app gets its own icon and works offline for pages you have opened.</p>
          <p>On iPhone, open this page in <b>Safari</b>, tap the <b>Share</b> button <ion-icon name="share-outline" />, then <b>Add to Home Screen</b> <ion-icon name="add-circle-outline" />.</p>
        </div>

        <div class="fa-section">Follow</div>
        <a class="fa-card fa-row" href="https://www.facebook.com/theiNZPire" target="_blank" rel="noopener">
          <span class="fa-icon-circle"><ion-icon name="logo-facebook" /></span>
          <span class="grow"><div class="fa-row-title">Follow us on Facebook</div><div class="fa-row-sub">Like our page for updates and new books</div></span>
        </a>

        <div class="fa-section">Developer</div>
        <div class="fa-card box">
          <div class="fa-row-title">Mohammad Rasol Z. Pangcoga (iNZPdev)</div>
          <div class="fa-row-sub">Tugaya, Lanao del Sur</div>
          <div class="buttons">
            <button class="fa-btn" (click)="feedback()"><ion-icon name="mail-outline" />Email the developer</button>
            <a class="fa-btn" routerLink="/corrections"><ion-icon name="create-outline" />Report a typo</a>
          </div>
          <div class="email">{{ email }}</div>
        </div>

        <p class="footer">
          Made for the Muslim Ummah's benefit<br />
          © {{ year }} Mohammad Rasol Z. Pangcoga (iNZPdev)<br />
          Open source under the Apache License 2.0. You may reuse it if you credit this original project.
        </p>
      </div>
    </ion-content>
  `,
  styles: `
    .head { padding: 12px 0 4px; text-align: center; }
    .head img { border-radius: 20px; }
    .head h1 { margin: 12px 0 0; font-size: 22px; font-weight: 700; }
    .head p { margin: 4px 0 0; color: var(--fa-text-2); }
    .head .version { color: var(--fa-muted); font-size: 13px; }
    .box { padding: 16px; line-height: 1.6; }
    .box p { margin: 0 0 10px; }
    .box p:last-child { margin: 0; }
    .box ion-icon { vertical-align: -3px; color: var(--fa-accent); }
    .fa-icon-circle ion-icon { font-size: 22px; }
    .grow { flex: 1; }
    .play { margin-bottom: 10px; border: 2px solid var(--fa-accent); }
    .buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .email { margin-top: 8px; color: var(--fa-muted); font-size: 13px; text-align: center; user-select: text; }
    .footer { margin: 24px 0 12px; color: var(--fa-muted); font-size: 13px; line-height: 1.7; text-align: center; }
  `,
})
export class AboutPage {
  protected version = APP_VERSION;
  protected email = DEVELOPER_EMAIL;
  protected playStoreUrl = PLAY_STORE_URL;
  protected year = Math.max(2026, new Date().getFullYear());

  protected feedback() {
    openEmail('[Fadhail Amal] Feedback', '');
  }
}
