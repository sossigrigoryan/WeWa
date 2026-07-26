import { z } from 'zod';
import { CLOTHING_CATEGORY_VALUES } from '../../common/constants.js';

const addItemSchema = z.object({
  imagePath: z.string().trim().min(1, 'imagePath is required').optional(),
  telegramFileId: z.string().trim().min(1).optional(),
  category: z.enum(CLOTHING_CATEGORY_VALUES).optional(),
  type: z.string().trim().min(1).optional(),
  primaryColor: z.string().trim().min(1).optional(),
  secondaryColor: z.string().trim().min(1).optional(),
  material: z.string().trim().min(1).optional(),
  season: z.string().trim().min(1).optional(),
  style: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional()
}).strict();

const aiResponseSchema = z.object({
  category: z.string().trim().min(1),
  type: z.string().trim().min(1),
  primaryColor: z.string().trim().min(1),
  secondaryColor: z.string().trim().min(1).optional().nullable(),
  material: z.string().trim().min(1).optional().nullable(),
  pattern: z.string().trim().min(1).optional().nullable(),
  season: z.string().trim().min(1).optional().nullable(),
  style: z.string().trim().min(1).optional().nullable(),
  confidence: z.number().min(0).max(1)
}).strict();

export function validateTelegramContext(ctx) {
  if (!ctx?.from?.id) {
    throw new Error('Telegram user identity is required.');
  }

  return Number(ctx.from.id);
}

export function validateItemId(itemId) {
  const parsedId = Number(itemId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error('itemId must be a positive integer.');
  }

  return parsedId;
}

export function validateAddItemData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Item data must be an object.');
  }

  return addItemSchema.parse(data);
}

export function validateAiResponse(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('AI response must be an object.');
  }

  return aiResponseSchema.parse(data);
}
