import { describe, expect, it, vi } from 'vitest';
import { handleLanguageSelection } from '../src/services/language.service.js';
import { addItem } from '../src/modules/wardrobe/wardrobe.service.js';
import { chat } from '../src/lib/ai.client.js';

vi.mock('../src/lib/ai.client.js', () => ({
  chat: vi.fn()
}));

describe('error handling', () => {
  it('surfaces a friendly failure when language selection throws', async () => {
    const ctx = {
      from: { id: 1 },
      reply: vi.fn().mockResolvedValue(undefined)
    };

    const service = await import('../src/services/user-store.service.js');
    vi.spyOn(service, 'setUserLanguage').mockRejectedValueOnce(new Error('db down'));

    await expect(handleLanguageSelection(ctx, 'en')).rejects.toThrow('db down');
  });

  it('returns a failed analysis payload when AI analysis fails', async () => {
    vi.mocked(chat).mockRejectedValueOnce(new Error('ai down'));

    const ctx = {
      from: { id: 2 },
      message: { photo: [{ file_id: 'file-1' }] },
      api: {
        token: 'token',
        getFile: vi.fn().mockResolvedValue({ file_path: 'photos/test.jpg' })
      }
    };

    global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('abc')) });

    const result = await addItem(ctx, {});

    expect(result.aiStatus).toBe('FAILED');
    expect(result.aiRawResponse).toContain('ai down');
  });
});
