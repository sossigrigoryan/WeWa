import logger from '../common/logger.js';
import {
  RATE_LIMIT_BLOCK_DURATION_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WARNING_MESSAGE,
  RATE_LIMIT_WINDOW_MS
} from '../common/constants.js';

const rateLimitState = new Map();

function getUserKey(ctx) {
  return ctx?.from?.id?.toString() ?? 'anonymous';
}

function pruneExpiredEntries(now) {
  for (const [key, state] of rateLimitState.entries()) {
    if (state.blockUntil && state.blockUntil <= now) {
      logger.info({ userId: key }, 'Rate limit block expired');
      rateLimitState.delete(key);
    }
  }
}

function getUserState(userId) {
  const existing = rateLimitState.get(userId);
  if (existing) {
    return existing;
  }

  const freshState = {
    requests: [],
    blocked: false,
    blockUntil: null
  };

  rateLimitState.set(userId, freshState);
  return freshState;
}

function isBlocked(state, now) {
  if (!state.blocked || !state.blockUntil) {
    return false;
  }

  if (state.blockUntil <= now) {
    state.blocked = false;
    state.blockUntil = null;
    logger.info({ userId: state.userId }, 'Rate limit block expired');
    return false;
  }

  return true;
}

export function resetRateLimitState() {
  rateLimitState.clear();
}

export function rateLimitMiddleware(ctx, next) {
  const now = Date.now();
  const userId = getUserKey(ctx);
  pruneExpiredEntries(now);

  const state = getUserState(userId);
  state.userId = userId;

  if (isBlocked(state, now)) {
    logger.warn({ userId }, 'Rate limit exceeded');
    if (!ctx.replied) {
      ctx.replied = true;
      ctx.reply(RATE_LIMIT_WARNING_MESSAGE);
    }
    return;
  }

  const recentRequests = state.requests.filter((timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS);
  state.requests = recentRequests;

  if (state.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    state.blocked = true;
    state.blockUntil = now + RATE_LIMIT_BLOCK_DURATION_MS;
    logger.warn({ userId, blockDurationMs: RATE_LIMIT_BLOCK_DURATION_MS }, 'User temporarily blocked');
    if (!ctx.replied) {
      ctx.replied = true;
      ctx.reply(RATE_LIMIT_WARNING_MESSAGE);
    }
    return;
  }

  state.requests.push(now);
  return next();
}
