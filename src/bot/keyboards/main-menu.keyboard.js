import { Keyboard } from 'grammy';

/**
 * Creates main menu keyboard.
 * @param {object} locale
 * @returns {Keyboard}
 */
export function createMainMenuKeyboard(locale) {
  return new Keyboard()
    .text(locale.wewa)
    .row()
    .text(`👗 ${locale.wardrobe}`)
    .row()
    .text(`⚙ ${locale.settings}`)
    .resized();
}