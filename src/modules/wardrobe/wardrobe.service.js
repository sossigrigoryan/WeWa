import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import env from '../../config/env.js';
import logger from '../../common/logger.js';
import { AI_ANALYSIS_STATUS } from '../../common/constants.js';
import { chat } from '../../lib/github-models.client.js';
import {
  checkItemOwnership,
  createDraftItem,
  deleteItemById,
  getItemById,
  getOrCreateUser,
  listUserItems,
  updateItemAnalysis
} from './wardrobe.repository.js';
import {
  validateAddItemData,
  validateAiResponse,
  validateItemId,
  validateTelegramContext
} from './wardrobe.validator.js';

function buildDescription(result = {}) {
  const descriptionParts = [
    result.primaryColor,
    result.pattern,
    result.material,
    result.type ?? result.category
  ].filter((part) => typeof part === 'string' && part.trim());

  if (!descriptionParts.length) {
    return 'Pending AI analysis';
  }

  return descriptionParts
    .map((part) => part.trim())
    .map((part, index) => {
      if (index === 0) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      }

      return part.toLowerCase();
    })
    .join(' ');
}

function buildAnalysisPrompt(data) {
  return [
    'You are identifying a clothing item from an image for a wardrobe assistant.',
    'Return STRICT JSON only.',
    'No markdown.',
    'No explanations.',
    'The JSON object must include exactly these fields:',
    'category, type, primaryColor, secondaryColor, material, pattern, season, style, confidence.',
    'Use one of these categories: TOPS, BOTTOMS, DRESSES, OUTERWEAR, SHOES, BAGS, ACCESSORIES.',
    'If a value is unknown, use null for string fields and 0.0 for confidence.',
    `Context data:\n${JSON.stringify(data, null, 2)}`
  ].join('\n');
}

function parseAiResponse(content) {
  if (!content) {
    return null;
  }

  const cleaned = String(content).replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logger.warn({ err: error, content }, 'Malformed AI JSON response');
    return null;
  }
}

async function downloadPhoto(ctx, fileId) {
  if (!fileId) {
    throw new Error('Telegram photo file id is missing.');
  }

  const filePath = await ctx.api.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${filePath.file_path}`;
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to download Telegram image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `${randomUUID()}.jpg`;
  const tempPath = path.join(uploadsDir, fileName);
  await fs.writeFile(tempPath, buffer);

  return { buffer, tempPath };
}

function toDataUrl(buffer, mimeType = 'image/jpeg') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function runAiAnalysis(imageBuffer, data) {
  if (!env.GITHUB_TOKEN) {
    return {
      aiStatus: AI_ANALYSIS_STATUS.FAILED,
      aiRawResponse: JSON.stringify({ error: 'AI analysis skipped because GITHUB_TOKEN is not configured.' })
    };
  }

  const timeoutMs = 20000;
  const aiRequest = chat([
    {
      role: 'user',
      content: [
        { type: 'text', text: buildAnalysisPrompt(data) },
        { type: 'image_url', image_url: { url: toDataUrl(imageBuffer) } }
      ]
    }
  ], {
    model: env.GITHUB_MODEL,
    maxTokens: 500,
    temperature: 0.2
  });

  const response = await Promise.race([
    aiRequest,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI analysis timed out.')), timeoutMs);
    })
  ]);

  const content = response?.choices?.[0]?.message?.content;
  const parsed = parseAiResponse(content);

  if (!parsed) {
    return {
      aiStatus: AI_ANALYSIS_STATUS.FAILED,
      aiRawResponse: JSON.stringify({ error: content || 'AI analysis returned no usable payload.' })
    };
  }

  const validated = validateAiResponse(parsed);

  return {
    aiStatus: AI_ANALYSIS_STATUS.COMPLETED,
    category: validated.category ?? null,
    type: validated.type ?? null,
    primaryColor: validated.primaryColor ?? null,
    secondaryColor: validated.secondaryColor ?? null,
    material: validated.material ?? null,
    season: validated.season ?? null,
    style: validated.style ?? null,
    description: validated.type ? `${validated.category} / ${validated.type}` : 'Identified via AI',
    aiRawResponse: JSON.stringify(validated)
  };
}

/**
 * Adds a new clothing item.
 * @param {import('grammy').Context} ctx
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function addItem(ctx, data = {}) {
  try {
    const telegramId = validateTelegramContext(ctx);
    const normalizedData = validateAddItemData(data);
    const user = await getOrCreateUser(telegramId, ctx.from);

    const photo = ctx.message?.photo?.at(-1);
    const telegramFileId = photo?.file_id ?? normalizedData.telegramFileId ?? null;

    if (!telegramFileId) {
      throw new Error('A photo is required to analyze the clothing item.');
    }

    const imagePayload = await downloadPhoto(ctx, telegramFileId);

    const item = await createDraftItem({
      userId: user.id,
      imagePath: imagePayload?.tempPath ?? normalizedData.imagePath ?? 'pending',
      telegramFileId,
      category: normalizedData.category ?? null,
      type: normalizedData.type ?? null,
      primaryColor: normalizedData.primaryColor ?? null,
      secondaryColor: normalizedData.secondaryColor ?? null,
      material: normalizedData.material ?? null,
      season: normalizedData.season ?? null,
      style: normalizedData.style ?? null,
      description: 'Pending AI analysis',
      aiStatus: AI_ANALYSIS_STATUS.PENDING
    });

    try {
      const aiResult = await runAiAnalysis(imagePayload?.buffer ?? Buffer.from(''), normalizedData);
      return updateItemAnalysis(item.id, {
        ...aiResult,
        description: buildDescription(aiResult)
      });
    } catch (error) {
      logger.error({ err: error, itemId: item.id }, 'Wardrobe AI analysis failed');
      return updateItemAnalysis(item.id, {
        aiStatus: AI_ANALYSIS_STATUS.FAILED,
        aiRawResponse: JSON.stringify({ error: error instanceof Error ? error.message : 'AI analysis failed.' }),
        description: 'Pending AI analysis'
      });
    }
  } catch (error) {
    logger.error({ err: error }, 'Wardrobe item creation failed');
    throw error;
  }
}

/**
 * Confirms a clothing item after AI analysis.
 * @param {import('grammy').Context} ctx
 * @param {number} itemId
 * @returns {Promise<object>}
 */
export async function confirmItem(ctx, itemId) {
  const telegramId = validateTelegramContext(ctx);
  const parsedItemId = validateItemId(itemId);
  const user = await getOrCreateUser(telegramId, ctx.from);

  const item = await getItemById(parsedItemId);
  if (!item) {
    throw new Error(`Wardrobe item ${parsedItemId} was not found.`);
  }

  const isOwner = await checkItemOwnership(parsedItemId, user.id);
  if (!isOwner) {
    throw new Error('You can only confirm items that belong to your wardrobe.');
  }

  return updateItemAnalysis(parsedItemId, {
    aiStatus: AI_ANALYSIS_STATUS.COMPLETED
  });
}

/**
 * Cancels a clothing item draft.
 * @param {import('grammy').Context} ctx
 * @param {number} itemId
 * @returns {Promise<object>}
 */
export async function cancelItem(ctx, itemId) {
  const telegramId = validateTelegramContext(ctx);
  const parsedItemId = validateItemId(itemId);
  const user = await getOrCreateUser(telegramId, ctx.from);

  const item = await getItemById(parsedItemId);
  if (!item) {
    throw new Error(`Wardrobe item ${parsedItemId} was not found.`);
  }

  const isOwner = await checkItemOwnership(parsedItemId, user.id);
  if (!isOwner) {
    throw new Error('You can only cancel items that belong to your wardrobe.');
  }

  return deleteItemById(parsedItemId);
}

/**
 * Gets user's wardrobe.
 * @param {import('grammy').Context} ctx
 * @returns {Promise<object[]>}
 */
export async function getWardrobe(ctx) {
  const telegramId = validateTelegramContext(ctx);
  const user = await getOrCreateUser(telegramId, ctx.from);

  return listUserItems(user.id);
}

/**
 * Gets a specific clothing item.
 * @param {import('grammy').Context} ctx
 * @param {number} itemId
 * @returns {Promise<object>}
 */
export async function getItem(ctx, itemId) {
  const telegramId = validateTelegramContext(ctx);
  const parsedItemId = validateItemId(itemId);
  const user = await getOrCreateUser(telegramId, ctx.from);

  const item = await getItemById(parsedItemId);
  if (!item) {
    throw new Error(`Wardrobe item ${parsedItemId} was not found.`);
  }

  const isOwner = await checkItemOwnership(parsedItemId, user.id);
  if (!isOwner) {
    throw new Error('You can only view items that belong to your wardrobe.');
  }

  return item;
}

/**
 * Deletes a clothing item.
 * @param {import('grammy').Context} ctx
 * @param {number} itemId
 * @returns {Promise<object>}
 */
export async function deleteItem(ctx, itemId) {
  const telegramId = validateTelegramContext(ctx);
  const parsedItemId = validateItemId(itemId);
  const user = await getOrCreateUser(telegramId, ctx.from);

  const item = await getItemById(parsedItemId);
  if (!item) {
    throw new Error(`Wardrobe item ${parsedItemId} was not found.`);
  }

  const isOwner = await checkItemOwnership(parsedItemId, user.id);
  if (!isOwner) {
    throw new Error('You can only delete items that belong to your wardrobe.');
  }

  return deleteItemById(parsedItemId);
}
