import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack, arrowForward, bookmark, bookmarkOutline, chevronForward, createOutline,
  informationCircleOutline, logoFacebook, mailOutline, removeOutline, addOutline, text,
  trashOutline, closeOutline, shareOutline, addCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class App {
  constructor() {
    addIcons({
      arrowBack, arrowForward, bookmark, bookmarkOutline, chevronForward, createOutline,
      informationCircleOutline, logoFacebook, mailOutline, removeOutline, addOutline, text,
      trashOutline, closeOutline, shareOutline, addCircleOutline,
    });
  }
}
