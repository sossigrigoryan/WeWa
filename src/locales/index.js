import { en } from './en.js';
import { ru } from './ru.js';
import { hy } from './hy.js';

const locales = {
  en,
  ru,
  hy
};

/**
 * Gets locale by language code.
 * @param {string} languageCode
 * @returns {typeof en}
 */
export function getLocale(languageCode) {
  return locales[languageCode] || en;
}
