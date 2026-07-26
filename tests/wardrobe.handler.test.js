import { describe, expect, it } from 'vitest';
import { formatItemAddedMessage, formatWardrobeItemMessage } from '../src/bot/handlers/wardrobe.handler.js';

describe('formatItemAddedMessage', () => {
  it('formats the Telegram success message in the requested English layout', () => {
    expect(
      formatItemAddedMessage({
        category: 'DRESSES',
        primaryColor: 'Blue',
        material: 'Cotton',
        style: 'Casual'
      })
    ).toBe(`✅ Item added!\n\n👗 Category: Dress\n🎨 Color: Blue\n🧵 Material: Cotton\n🌸 Style: Casual`);
  });

  it('uses Unknown when a field is missing or null', () => {
    expect(formatItemAddedMessage({ category: null, primaryColor: null, material: null, style: null })).toBe(
      `✅ Item added!\n\n👗 Category: Unknown\n🎨 Color: Unknown\n🧵 Material: Unknown\n🌸 Style: Unknown`
    );
  });

  it('formats wardrobe metadata for the visible item message', () => {
    expect(formatWardrobeItemMessage({ category: 'DRESSES', primaryColor: 'red', material: 'silk', style: 'traditional' })).toBe(
      `👗 Dress\n🎨 Red\n🧵 Silk\n🌸 Traditional`
    );
  });
});
