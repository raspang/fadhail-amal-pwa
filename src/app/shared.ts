import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BOOK_ICONS } from './data/book-icons';

/** Turns a book icon name into its inline SVG (trusted: it comes from our own data file). */
@Pipe({ name: 'bookIcon' })
export class BookIconPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(name: string): SafeHtml {
    // The data file uses the Android names, e.g. "ic_sahabah"
    const key = name.replace(/^ic_/, '');
    return this.sanitizer.bypassSecurityTrustHtml(BOOK_ICONS[key] ?? BOOK_ICONS['sahabah']);
  }
}
