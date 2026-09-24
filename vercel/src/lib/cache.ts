import fs from 'fs';
import path from 'path';
import { LunchLevel, LunchSummaryResult } from './types';

// In-memory cache for warm container instances
const memoryCache = new Map<string, LunchSummaryResult>();

// Central Time (Verona, Wisconsin)
export function getTodayDateStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateStr();
}

function getCacheKey(dateStr: string, level: LunchLevel, meal: string = 'lunch'): string {
  return `menu_${meal}_${dateStr}_${level}`;
}

function getTmpFilePath(dateStr: string, level: LunchLevel, meal: string = 'lunch'): string {
  return path.join('/tmp', `menu_${meal}_${dateStr}_${level}.json`);
}

export async function getCachedMenu(
  dateStr: string,
  level: LunchLevel,
  meal: string = 'lunch'
): Promise<LunchSummaryResult | null> {
  // Caching is only active for the current day
  if (!isToday(dateStr)) {
    return null;
  }

  const key = getCacheKey(dateStr, level, meal);

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key)!;
    return { ...cached, cached: true };
  }

  // 2. Check /tmp filesystem (persisted across warm serverless requests)
  try {
    const tmpPath = getTmpFilePath(dateStr, level, meal);
    if (fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, 'utf-8');
      const parsed = JSON.parse(data) as LunchSummaryResult;
      memoryCache.set(key, parsed);
      return { ...parsed, cached: true };
    }
  } catch (err) {
    // Ignore tmp read errors
  }

  // 3. Check Vercel KV / Upstash Redis if configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = JSON.parse(json.result) as LunchSummaryResult;
          memoryCache.set(key, parsed);
          return { ...parsed, cached: true };
        }
      }
    } catch {
      // Ignore Redis errors
    }
  }

  return null;
}

export async function setCachedMenu(
  dateStr: string,
  level: LunchLevel,
  meal: string,
  result: LunchSummaryResult
): Promise<void> {
  // Only save cache if it's the current day
  if (!isToday(dateStr)) {
    return;
  }

  const key = getCacheKey(dateStr, level, meal);

  // 1. Save to in-memory
  memoryCache.set(key, result);

  // 2. Save to /tmp
  try {
    const tmpPath = getTmpFilePath(dateStr, level, meal);
    fs.writeFileSync(tmpPath, JSON.stringify(result), 'utf-8');
  } catch {
    // Ignore tmp write errors
  }

  // 3. Save to Vercel KV / Upstash Redis if configured (TTL: 86400 seconds / 24 hours)
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) {
    try {
      await fetch(`${redisUrl}/set/${key}/${encodeURIComponent(JSON.stringify(result))}?ex=86400`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
    } catch {
      // Ignore Redis errors
    }
  }
}

export async function getCachedLunch(dateStr: string, level: LunchLevel): Promise<LunchSummaryResult | null> {
  return getCachedMenu(dateStr, level, 'lunch');
}

export async function setCachedLunch(
  dateStr: string,
  level: LunchLevel,
  result: LunchSummaryResult
): Promise<void> {
  return setCachedMenu(dateStr, level, 'lunch', result);
}
