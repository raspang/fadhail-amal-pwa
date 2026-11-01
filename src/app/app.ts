import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack, arrowForward, bookmark, bookmarkOutline, chevronForward, createOutline,
  informationCircleOutline, logoFacebook, mailOutline, removeOutline, addOutline, text,
  trashOutline, closeOutline, shareOutline, addCircleOutline, downloadOutline,
  logoGooglePlaystore, moon, sunny,
} from 'ionicons/icons';
import { InstallService } from './services/install.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class App {
  // Created at startup so it catches the browser's install event, which can fire before any page opens
  private install = inject(InstallService);

  constructor() {
    addIcons({
      arrowBack, arrowForward, bookmark, bookmarkOutline, chevronForward, createOutline,
      informationCircleOutline, logoFacebook, mailOutline, removeOutline, addOutline, text,
      trashOutline, closeOutline, shareOutline, addCircleOutline, downloadOutline,
      logoGooglePlaystore, moon, sunny,
    });
  }
}
