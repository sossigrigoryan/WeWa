import { describe, expect, it, vi } from 'vitest';
import { formatItemAddedMessage, formatWardrobeItemMessage, sendWardrobeItem } from '../src/bot/handlers/wardrobe.handler.js';

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
});

describe('formatWardrobeItemMessage', () => {
  it('formats wardrobe metadata for the visible item message', () => {
    expect(formatWardrobeItemMessage({ category: 'DRESSES', primaryColor: 'red', material: 'silk', style: 'traditional' })).toBe(
      `👗 Dress\n🎨 Red\n🧵 Silk\n🌸 Traditional`
    );
  });
});

describe('sendWardrobeItem', () => {
  it('sends photo with caption when photo source is valid', async () => {
    const mockCtx = {
      replyWithPhoto: vi.fn().mockResolvedValue(),
      reply: vi.fn()
    };
    
    const item = {
      telegramFileId: 'AgACagIAAxkBAAI...',
      category: 'DRESSES',
      primaryColor: 'red',
      material: 'silk',
      style: 'traditional'
    };

    await sendWardrobeItem(mockCtx, item);

    expect(mockCtx.replyWithPhoto).toHaveBeenCalledWith(
      'AgACagIAAxkBAAI...',
      { caption: expect.stringContaining('👗 Dress') }
    );
    expect(mockCtx.reply).not.toHaveBeenCalled();
  });

  it('falls back to text-only when photo send fails', async () => {
    const mockCtx = {
      replyWithPhoto: vi.fn().mockRejectedValue(new Error('Photo failed')),
      reply: vi.fn().mockResolvedValue()
    };
    
    const item = {
      telegramFileId: 'AgACagIAAxkBAAI...',
      category: 'DRESSES',
      primaryColor: 'red',
      material: 'silk',
      style: 'traditional'
    };

    await sendWardrobeItem(mockCtx, item);

    expect(mockCtx.replyWithPhoto).toHaveBeenCalled();
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('👗 Dress'),
      expect.any(Object)
    );
  });
});
