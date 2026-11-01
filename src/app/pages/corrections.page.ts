import { Component, OnDestroy, inject } from '@angular/core';
import {
  AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonTitle,
  IonToolbar, ToastController,
} from '@ionic/angular';
import { buildCorrectionsEmail, openEmail } from '../services/mailer';
import { Correction, StoreService } from '../services/store.service';

/**
 * The corrections saved while reading. They can be deleted, then sent together by email.
 * A long list is split: each email holds what fits and the rest stay for the next one.
 */
@Component({
  selector: 'app-corrections',
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonFooter, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/" /></ion-buttons>
        <ion-title>My corrections</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="fa-page">
        @for (c of store.corrections(); track c.id) {
          <div class="fa-card row">
            <div class="text">
              <div class="page">{{ c.book }} › {{ c.title }}</div>
              <div class="wrong">“{{ c.wrong }}”</div>
              @if (c.suggestion) { <div class="suggestion">→ {{ c.suggestion }}</div> }
            </div>
            <ion-button fill="clear" color="medium" (click)="remove(c)" aria-label="Delete correction">
              <ion-icon slot="icon-only" name="trash-outline" />
            </ion-button>
          </div>
        } @empty {
          <div class="fa-empty">
            <div class="fa-icon-circle big"><ion-icon name="create-outline" /></div>
            <h2>No corrections yet</h2>
            <p>While reading, select the words with a mistake (press and hold), then tap “Report correction”. They are saved here until you send them.</p>
            <button class="fa-btn link" (click)="writeEmail()">Write an email instead</button>
          </div>
        }
      </div>
    </ion-content>
    @if (store.corrections().length) {
      <ion-footer>
        <ion-toolbar>
          <div class="send">
            <button class="fa-btn gold" (click)="send()">
              <ion-icon name="mail-outline" /> Send by email ({{ store.corrections().length }})
            </button>
          </div>
        </ion-toolbar>
      </ion-footer>
    }
  `,
  styles: `
    .row { display: flex; align-items: center; margin-bottom: 10px; padding: 12px 4px 12px 16px; }
    .text { flex: 1; min-width: 0; }
    .page { color: var(--fa-text-2); font-size: 14px; line-height: 1.4; }
    .wrong { margin-top: 6px; font-size: 16px; }
    .suggestion { margin-top: 2px; color: var(--fa-accent); }
    .fa-icon-circle.big { width: 72px; height: 72px; margin: 0 auto; font-size: 30px; }
    .send { padding: 8px 12px; }
    .send button { width: 100%; }
  `,
})
export class CorrectionsPage implements OnDestroy {
  protected store = inject(StoreService);
  private alerts = inject(AlertController);
  private toasts = inject(ToastController);

  // Corrections put in the email just opened; asked about when the user comes back
  private pendingSent: number[] = [];
  private readonly onReturn = () => {
    if (document.visibilityState === 'visible' && this.pendingSent.length) this.askIfSent();
  };

  constructor() {
    document.addEventListener('visibilitychange', this.onReturn);
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onReturn);
  }

  protected async remove(c: Correction) {
    const before = this.store.corrections();
    this.store.setCorrections(before.filter((x) => x.id !== c.id));
    const t = await this.toasts.create({
      message: 'Correction deleted',
      duration: 4000,
      position: 'top',
      buttons: [{ text: 'Undo', handler: () => this.store.setCorrections(before) }],
    });
    await t.present();
  }

  protected writeEmail() {
    openEmail('[Fadhail Amal] Typo Report', 'Book:\nChapter / page title:\nWrong text:\nCorrect text:\n');
  }

  protected async send() {
    const all = this.store.corrections();
    if (!all.length) return;
    const email = buildCorrectionsEmail(all);
    const open = () => {
      this.pendingSent = email.ids;
      openEmail(email.subject, email.body);
    };
    if (email.ids.length < all.length) {
      const a = await this.alerts.create({
        header: 'Long list',
        message: `This email will contain the first ${email.ids.length} of ${all.length} corrections. Send the rest in the next email.`,
        buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Continue', handler: open }],
      });
      await a.present();
    } else {
      open();
    }
  }

  private async askIfSent() {
    const sent = this.pendingSent;
    this.pendingSent = [];
    const a = await this.alerts.create({
      header: 'Was the email sent?',
      message: `Remove the sent corrections (${sent.length}) from your list?`,
      buttons: [
        { text: 'Keep', role: 'cancel' },
        { text: 'Remove', handler: () => this.store.removeCorrections(sent) },
      ],
    });
    await a.present();
  }
}
