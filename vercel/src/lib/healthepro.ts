import { LunchDayData, LunchItem, LunchLevel } from './types';
import { isStapleItem, categorizeItem } from './filter';

const BASE_URL = 'https://menus.healthepro.com/api';
const ORG_ID = 3368;

export const LEVEL_MENU_CONFIG: Record<LunchLevel, {
  name: string;
  breakfastMenuIds: number[];
  lunchMenuIds: number[];
}> = {
  ES: {
    name: 'Elementary School (K-5)',
    breakfastMenuIds: [128399], // Elementary Breakfast (K-5)
    lunchMenuIds: [128400],     // Elementary Lunch (K-5)
  },
  MS: {
    name: 'Middle School (6-8)',
    breakfastMenuIds: [128402], // Middle School Breakfast
    lunchMenuIds: [128403, 128404], // Line 1 and Line 2
  },
  HS: {
    name: 'High School (9-12)',
    breakfastMenuIds: [128405], // High School Breakfast
    lunchMenuIds: [128409, 128408, 128406, 128407], // Cafe, Pizza Line, Line 1, Line 3
  },
};

export const LEVEL_CONFIG: Record<LunchLevel, { name: string; menuIds: number[] }> = {
  ES: { name: LEVEL_MENU_CONFIG.ES.name, menuIds: LEVEL_MENU_CONFIG.ES.lunchMenuIds },
  MS: { name: LEVEL_MENU_CONFIG.MS.name, menuIds: LEVEL_MENU_CONFIG.MS.lunchMenuIds },
  HS: { name: LEVEL_MENU_CONFIG.HS.name, menuIds: LEVEL_MENU_CONFIG.HS.lunchMenuIds },
};

interface DateOverwriteEntry {
  id: number;
  day: string;
  setting: string;
}

export async function fetchMenuForDay(
  dateStr: string, // YYYY-MM-DD
  level: LunchLevel,
  meal: 'breakfast' | 'lunch' = 'lunch'
): Promise<LunchDayData> {
  const config = LEVEL_MENU_CONFIG[level] || LEVEL_MENU_CONFIG.ES;
  const menuIds = meal === 'breakfast' ? config.breakfastMenuIds : config.lunchMenuIds;
  const [year, month] = dateStr.split('-');
  const monthNum = parseInt(month, 10).toString(); // e.g. "10" or "9"

  const rawItemsMap = new Map<string, LunchItem>();
  const specialEntreesSet = new Set<string>();
  const stapleEntreesSet = new Set<string>();
  const sidesSet = new Set<string>();
  const treatsSet = new Set<string>();

  // Fetch for each relevant menu ID
  for (const menuId of menuIds) {
    try {
      const url = `${BASE_URL}/organizations/${ORG_ID}/menus/${menuId}/year/${year}/month/${monthNum}/date_overwrites`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 }, // Cache on edge/fetch layer for 1 hour
      });

      if (!res.ok) continue;

      const json = await res.json();
      const entries: DateOverwriteEntry[] = json.data || [];
      const dayEntry = entries.find(e => e.day === dateStr);

      if (!dayEntry || !dayEntry.setting) continue;

      let settingObj: { current_display?: Array<{ name: string; type: string }> } = {};
      try {
        settingObj = JSON.parse(dayEntry.setting);
      } catch {
        continue;
      }

      let currentCategory = 'Other';
      for (const el of settingObj.current_display || []) {
        if (el.type === 'category') {
          currentCategory = el.name || 'Other';
        } else if (el.type === 'recipe' && el.name) {
          const itemName = el.name.trim();
          if (!itemName) continue;

          const isStaple = isStapleItem(itemName, level);
          const itemType = categorizeItem(itemName, currentCategory);

          if (!rawItemsMap.has(itemName)) {
            rawItemsMap.set(itemName, {
              name: itemName,
              category: currentCategory,
              isStaple,
            });
          }

          if (itemType === 'treat') {
            treatsSet.add(itemName);
          } else if (itemType === 'entree') {
            if (isStaple) {
              stapleEntreesSet.add(itemName);
            } else {
              specialEntreesSet.add(itemName);
            }
          } else if (itemType === 'side') {
            if (!isStaple) {
              sidesSet.add(itemName);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching menu ${menuId}:`, err);
    }
  }

  const specialEntrees = Array.from(specialEntreesSet);
  const stapleEntrees = Array.from(stapleEntreesSet);
  const sides = Array.from(sidesSet);
  const treats = Array.from(treatsSet);
  const allEntrees = [...specialEntrees, ...stapleEntrees];
  const rawItems = Array.from(rawItemsMap.values());
  const hasSchool = rawItems.length > 0;

  return {
    date: dateStr,
    level,
    levelName: config.name,
    mealType: meal,
    entrees: allEntrees,
    specialEntrees,
    stapleEntrees,
    sides,
    treats,
    rawItems,
    hasSchool,
  };
}

export async function fetchLunchMenuForDay(
  dateStr: string,
  level: LunchLevel
): Promise<LunchDayData> {
  return fetchMenuForDay(dateStr, level, 'lunch');
}

export async function fetchBreakfastMenuForDay(
  dateStr: string,
  level: LunchLevel
): Promise<LunchDayData> {
  return fetchMenuForDay(dateStr, level, 'breakfast');
}

/**
 * Returns Monday through Friday dates in YYYY-MM-DD for an ISO week (e.g. "2026-W40")
 */
export function getDatesForIsoWeek(isoWeek: string): string[] {
  const match = isoWeek.match(/^(\d{4})-W(\d{2})$/i);
  if (!match) return [];
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // Jan 4th is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // 1 (Mon) to 7 (Sun)
  // Monday of week 1
  const monWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  // Monday of target week
  const monTarget = new Date(monWeek1.getTime() + (week - 1) * 7 * 86400000);

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monTarget.getTime() + i * 86400000);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Fetch menus for all weekdays of an ISO week for a specific meal
 */
export async function fetchMenuForWeek(
  weekStr: string,
  level: LunchLevel,
  meal: 'breakfast' | 'lunch' = 'lunch'
): Promise<LunchDayData[]> {
  const dates = getDatesForIsoWeek(weekStr);
  if (dates.length === 0) return [];
  return Promise.all(dates.map(date => fetchMenuForDay(date, level, meal)));
}

/**
 * Fetch lunch menus for all weekdays of an ISO week
 */
export async function fetchLunchMenuForWeek(
  weekStr: string,
  level: LunchLevel
): Promise<LunchDayData[]> {
  return fetchMenuForWeek(weekStr, level, 'lunch');
}

/**
 * Fetch breakfast menus for all weekdays of an ISO week
 */
export async function fetchBreakfastMenuForWeek(
  weekStr: string,
  level: LunchLevel
): Promise<LunchDayData[]> {
  return fetchMenuForWeek(weekStr, level, 'breakfast');
}

