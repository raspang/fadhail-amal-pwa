import { Injectable, inject, signal } from '@angular/core';
import { AlertController } from '@ionic/angular';

/** The browser event Chrome, Edge, Samsung Internet and Opera fire when the app can be installed. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Shows the "Install app" button. Browsers that support it get the real install prompt;
 * the rest (iPhone/iPad, Firefox) get short instructions for adding it to the home screen.
 */
@Injectable({ providedIn: 'root' })
export class InstallService {
  private alerts = inject(AlertController);
  private deferred: InstallPromptEvent | null = null;

  /** False once the app is running from its home screen icon, so the button hides. */
  readonly canInstall = signal(!isStandalone());

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // keep the browser's own mini bar away; our button shows the prompt
      this.deferred = e as InstallPromptEvent;
    });
    window.addEventListener('appinstalled', () => {
      this.deferred = null;
      this.canInstall.set(false);
    });
  }

  async install(): Promise<void> {
    if (this.deferred) {
      const e = this.deferred;
      this.deferred = null; // the event can only be used once
      await e.prompt();
      if ((await e.userChoice).outcome === 'accepted') this.canInstall.set(false);
      return;
    }
    const a = await this.alerts.create({
      header: 'Install Fadhail Amal',
      message: instructions(),
      buttons: ['OK'],
    });
    await a.present();
  }
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function instructions(): string {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  if (ios) return 'Tap the Share button in Safari, then "Add to Home Screen".';
  if (/Firefox/.test(ua)) return 'Open the browser menu (⋮), then tap "Install" or "Add to Home screen".';
  return 'Open the browser menu (⋮), then tap "Install app" or "Add to Home screen".';
}
