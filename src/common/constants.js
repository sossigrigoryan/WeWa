/**
 * Clothing categories
 */
export const CLOTHING_CATEGORIES = Object.freeze({
  TOPS: 'TOPS',
  BOTTOMS: 'BOTTOMS',
  DRESSES: 'DRESSES',
  OUTERWEAR: 'OUTERWEAR',
  SHOES: 'SHOES',
  BAGS: 'BAGS',
  ACCESSORIES: 'ACCESSORIES'
});

/**
 * Allowed clothing category values
 */
export const CLOTHING_CATEGORY_VALUES = Object.values(CLOTHING_CATEGORIES);

/**
 * AI analysis statuses
 */
export const AI_ANALYSIS_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
});

/**
 * Allowed AI status values
 */
export const AI_STATUS_VALUES = Object.values(AI_ANALYSIS_STATUS);

/**
 * Rate limiting defaults for Telegram updates
 */
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_BLOCK_DURATION_MS = 60_000;
export const RATE_LIMIT_WARNING_MESSAGE = 'You are sending messages too quickly. Please wait a moment.';
