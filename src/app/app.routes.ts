import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.page').then((m) => m.HomePage) },
  { path: 'book/:cat', loadComponent: () => import('./pages/book.page').then((m) => m.BookPage) },
  { path: 'read/:id', loadComponent: () => import('./pages/reader.page').then((m) => m.ReaderPage) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites.page').then((m) => m.FavoritesPage) },
  { path: 'corrections', loadComponent: () => import('./pages/corrections.page').then((m) => m.CorrectionsPage) },
  { path: 'about', loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage) },
  { path: '**', redirectTo: '' },
];
