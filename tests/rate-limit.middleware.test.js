import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimitMiddleware, resetRateLimitState } from '../src/middlewares/rate-limit.middleware.js';
import { RATE_LIMIT_BLOCK_DURATION_MS, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '../src/common/constants.js';

const createCtx = (id = 1) => ({
  from: { id },
  reply: vi.fn().mockResolvedValue(undefined)
});

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  afterEach(() => {
    resetRateLimitState();
    vi.useRealTimers();
  });

  it('allows requests within the limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const ctx = createCtx();
    const next = vi.fn();

    await rateLimitMiddleware(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  it('blocks requests that exceed the limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const ctx = createCtx();
    const next = vi.fn();

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      await rateLimitMiddleware(ctx, vi.fn());
    }

    await rateLimitMiddleware(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledTimes(1);
  });

  it('rejects blocked requests without calling the next handler', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const ctx = createCtx();
    const next = vi.fn();

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      await rateLimitMiddleware(ctx, vi.fn());
    }

    await rateLimitMiddleware(ctx, next);
    await rateLimitMiddleware(ctx, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(ctx.reply).toHaveBeenCalledTimes(1);
  });

  it('does not allow business handlers while blocked', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const blockedCtx = createCtx(2);
    const next = vi.fn();

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      await rateLimitMiddleware(blockedCtx, vi.fn());
    }

    await rateLimitMiddleware(blockedCtx, next);

    expect(next).not.toHaveBeenCalled();
    expect(blockedCtx.reply).toHaveBeenCalledTimes(1);
  });

  it('restores access after the block expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const ctx = createCtx(3);
    const next = vi.fn();

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      await rateLimitMiddleware(ctx, vi.fn());
    }

    await rateLimitMiddleware(ctx, next);
    expect(next).not.toHaveBeenCalled();

    vi.setSystemTime(new Date('2024-01-01T00:01:01.000Z'));
    const restoredNext = vi.fn();
    await rateLimitMiddleware(ctx, restoredNext);

    expect(restoredNext).toHaveBeenCalledTimes(1);
  });
});
