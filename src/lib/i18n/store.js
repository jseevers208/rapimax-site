/**
 * Rapimax i18n — Lightweight translation system
 *
 * Usage in any Svelte component:
 *   import { t, locale, setLocale } from './lib/i18n/store.js';
 *   <h1>{$t('hero.title')}</h1>
 *   <button on:click={() => setLocale('en')}>English</button>
 *
 * NOTE: This is infrastructure-only. Existing frontend strings
 * are NOT changed — components opt-in to i18n when ready.
 */

import { writable, derived } from 'svelte/store';
import { es } from './es.js';
import { en } from './en.js';

const locales = { es, en };

function getBrowserLang() {
  if (typeof navigator === 'undefined') return 'es';
  const saved = localStorage.getItem('rapimax_lang');
  if (saved && locales[saved]) return saved;
  const nav = navigator.language?.slice(0, 2);
  return locales[nav] ? nav : 'es';
}

export const locale = writable(getBrowserLang());

export function setLocale(lang) {
  if (locales[lang]) {
    locale.set(lang);
    localStorage.setItem('rapimax_lang', lang);
    document.documentElement.lang = lang;
  }
}

/**
 * Derived store: $t('key') returns translated string.
 * Supports dot-notation: $t('hero.title')
 */
export const t = derived(locale, ($locale) => {
  const strings = locales[$locale] || locales.es;
  return (key, fallback) => {
    const parts = key.split('.');
    let val = strings;
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) break;
    }
    return val ?? fallback ?? key;
  };
});
