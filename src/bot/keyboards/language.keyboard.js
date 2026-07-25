import { Keyboard } from 'grammy';

/**
 * Creates a language selection keyboard.
 * @returns {Keyboard}
 */
export function createLanguageKeyboard() {
  return new Keyboard()
  .text('🇷🇺 Русский')
  .row()
  .text('🇬🇧 English')
  .row()
  .text('🇦🇲 Հայերեն')
  .resized()
  .persistent();
}