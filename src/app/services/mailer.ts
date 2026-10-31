import { APP_VERSION, DEVELOPER_EMAIL } from './content.service';
import { Correction } from './store.service';

// A very long mailto: link can fail in some mail apps, so each email holds a modest amount
export const MAX_EMAIL_CHARS = 6000;
export const MAX_EMAIL_ITEMS = 25;

/** Opens the phone's mail app with a message to the developer. */
export function openEmail(subject: string, body: string): void {
  const fullSubject = `${subject} (v${APP_VERSION} web)`;
  let url = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(fullSubject)}`;
  if (body) url += `&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

export function formatCorrection(n: number, c: Correction): string {
  let s = `${n}. ${c.book}`;
  if (c.chapter) s += ` › ${c.chapter}`;
  s += ` › ${c.title}\n`;
  s += `   File: ${c.file}\n`;
  s += `   Wrong: "${c.wrong}"\n`;
  if (c.suggestion) s += `   Suggested: "${c.suggestion}"\n`;
  if (c.context) s += `   Context: "${c.context}"\n`;
  return s + '\n';
}

/** Takes corrections in order until the email is full. The rest wait for the next email. */
export function buildCorrectionsEmail(list: Correction[]): { subject: string; body: string; ids: number[] } {
  let body = '';
  const ids: number[] = [];
  for (const c of list) {
    const entry = formatCorrection(ids.length + 1, c);
    const full = ids.length >= MAX_EMAIL_ITEMS || (ids.length > 0 && body.length + entry.length > MAX_EMAIL_CHARS);
    if (full) break;
    body += entry;
    ids.push(c.id);
  }
  return { subject: `[Fadhail Amal] Corrections (${ids.length})`, body, ids };
}
