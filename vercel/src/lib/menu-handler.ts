import { NextRequest, NextResponse } from 'next/server';
import { LunchLevel, LunchSummaryResult, AlexaFlashBriefingItem, MealType } from '@/lib/types';
import {
  fetchLunchMenuForDay,
  fetchBreakfastMenuForDay,
  fetchLunchMenuForWeek,
  fetchBreakfastMenuForWeek,
  LEVEL_CONFIG,
} from '@/lib/healthepro';
import {
  generateLunchSummary,
  generateBreakfastSummary,
  generateCombinedMenuSummary,
  generateWeeklyLunchSummary,
  generateWeeklyCombinedSummary,
} from '@/lib/gemini';
import { getCachedMenu, setCachedMenu, getTodayDateStr } from '@/lib/cache';

export function parseLevel(param: string | null): LunchLevel {
  if (!param) return 'ES';
  const clean = param.trim().toUpperCase();
  if (clean === 'MS' || clean.includes('MIDDLE')) return 'MS';
  if (clean === 'HS' || clean.includes('HIGH')) return 'HS';
  return 'ES';
}

export function parseDate(param: string | null): string {
  if (!param) return getTodayDateStr();
  const trimmed = param.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return getTodayDateStr();
}

export function parseMealType(param: string | null, defaultType: MealType = 'lunch'): MealType {
  if (!param) return defaultType;
  const clean = param.trim().toLowerCase();
  if (clean === 'breakfast' || clean === 'b') return 'breakfast';
  if (clean === 'both' || clean === 'all' || clean === 'menu') return 'both';
  if (clean === 'lunch' || clean === 'l') return 'lunch';
  return defaultType;
}

export async function handleMenuRequest(req: NextRequest, defaultMeal: MealType = 'lunch') {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseLevel(searchParams.get('level'));
    const rawDateParam = searchParams.get('date')?.trim();
    const isWeek = rawDateParam ? /^\d{4}-W\d{2}$/i.test(rawDateParam) : false;
    const meal = parseMealType(searchParams.get('meal'), defaultMeal);
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG.ES;

    // Check if week query requested
    if (isWeek) {
      const weekStr = rawDateParam!.toUpperCase();
      let speechText = '';
      let summary = '';
      let daysOutput: any[] = [];

      if (meal === 'breakfast') {
        const weekData = await fetchBreakfastMenuForWeek(weekStr, level);
        const res = await generateWeeklyLunchSummary(levelConfig.name, weekData, "this week's breakfast");
        speechText = res.speechText;
        summary = res.summary;
        daysOutput = weekData.map((d) => ({
          date: d.date,
          hasSchool: d.hasSchool,
          specialEntrees: d.specialEntrees,
          sides: d.sides,
          treats: d.treats,
        }));
      } else if (meal === 'lunch') {
        const weekData = await fetchLunchMenuForWeek(weekStr, level);
        const res = await generateWeeklyLunchSummary(levelConfig.name, weekData);
        speechText = res.speechText;
        summary = res.summary;
        daysOutput = weekData.map((d) => ({
          date: d.date,
          hasSchool: d.hasSchool,
          specialEntrees: d.specialEntrees,
          sides: d.sides,
          treats: d.treats,
        }));
      } else {
        const [bWeek, lWeek] = await Promise.all([
          fetchBreakfastMenuForWeek(weekStr, level),
          fetchLunchMenuForWeek(weekStr, level),
        ]);
        const res = await generateWeeklyCombinedSummary(levelConfig.name, bWeek, lWeek);
        speechText = res.speechText;
        summary = res.summary;
        daysOutput = lWeek.map((ld, i) => {
          const bd = bWeek[i];
          return {
            date: ld.date,
            hasSchool: ld.hasSchool || bd?.hasSchool,
            breakfast: bd
              ? { specialEntrees: bd.specialEntrees, sides: bd.sides, treats: bd.treats }
              : null,
            lunch: { specialEntrees: ld.specialEntrees, sides: ld.sides, treats: ld.treats },
          };
        });
      }

      if (format === 'text') {
        return new NextResponse(speechText, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        });
      }

      return NextResponse.json(
        {
          type: 'week',
          week: weekStr,
          mealType: meal,
          level,
          levelName: levelConfig.name,
          speechText,
          summary,
          days: daysOutput,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    const date = parseDate(rawDateParam || null);

    // If raw format requested, return directly without AI summarization
    if (format === 'raw') {
      if (meal === 'breakfast') {
        const dayData = await fetchBreakfastMenuForDay(date, level);
        return NextResponse.json(
          {
            debug: true,
            date,
            level,
            levelName: dayData.levelName,
            mealType: 'breakfast',
            hasSchool: dayData.hasSchool,
            specialEntrees: dayData.specialEntrees,
            stapleEntrees: dayData.stapleEntrees,
            sides: dayData.sides,
            treats: dayData.treats,
            rawItems: dayData.rawItems,
          },
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } }
        );
      } else if (meal === 'lunch') {
        const dayData = await fetchLunchMenuForDay(date, level);
        return NextResponse.json(
          {
            debug: true,
            date,
            level,
            levelName: dayData.levelName,
            mealType: 'lunch',
            hasSchool: dayData.hasSchool,
            specialEntrees: dayData.specialEntrees,
            stapleEntrees: dayData.stapleEntrees,
            sides: dayData.sides,
            treats: dayData.treats,
            rawItems: dayData.rawItems,
          },
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } }
        );
      } else {
        const [dayDataB, dayDataL] = await Promise.all([
          fetchBreakfastMenuForDay(date, level),
          fetchLunchMenuForDay(date, level),
        ]);
        return NextResponse.json(
          {
            debug: true,
            date,
            level,
            levelName: dayDataL.levelName,
            mealType: 'both',
            hasSchool: dayDataL.hasSchool || dayDataB.hasSchool,
            breakfast: {
              specialEntrees: dayDataB.specialEntrees,
              stapleEntrees: dayDataB.stapleEntrees,
              sides: dayDataB.sides,
              treats: dayDataB.treats,
              rawItems: dayDataB.rawItems,
            },
            lunch: {
              specialEntrees: dayDataL.specialEntrees,
              stapleEntrees: dayDataL.stapleEntrees,
              sides: dayDataL.sides,
              treats: dayDataL.treats,
              rawItems: dayDataL.rawItems,
            },
          },
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } }
        );
      }
    }

    // 1. Check cache (only applies to current day)
    const cachedResult = await getCachedMenu(date, level, meal);
    if (cachedResult) {
      return formatResponse(cachedResult, format);
    }

    // 2. Fetch menu and summarize
    let speechText = '';
    let summary = '';
    let result: LunchSummaryResult;

    if (meal === 'breakfast') {
      const dayData = await fetchBreakfastMenuForDay(date, level);
      const res = await generateBreakfastSummary(dayData);
      speechText = res.speechText;
      summary = res.summary;
      result = {
        date,
        level,
        levelName: dayData.levelName,
        mealType: 'breakfast',
        speechText,
        summary,
        cached: false,
        generatedAt: new Date().toISOString(),
        details: {
          specialEntrees: dayData.specialEntrees,
          sides: dayData.sides,
          treats: dayData.treats,
          stapleEntrees: dayData.stapleEntrees,
        },
      };
    } else if (meal === 'lunch') {
      const dayData = await fetchLunchMenuForDay(date, level);
      const res = await generateLunchSummary(dayData);
      speechText = res.speechText;
      summary = res.summary;
      result = {
        date,
        level,
        levelName: dayData.levelName,
        mealType: 'lunch',
        speechText,
        summary,
        cached: false,
        generatedAt: new Date().toISOString(),
        details: {
          specialEntrees: dayData.specialEntrees,
          sides: dayData.sides,
          treats: dayData.treats,
          stapleEntrees: dayData.stapleEntrees,
        },
      };
    } else {
      const [dayDataB, dayDataL] = await Promise.all([
        fetchBreakfastMenuForDay(date, level),
        fetchLunchMenuForDay(date, level),
      ]);
      const res = await generateCombinedMenuSummary(dayDataB, dayDataL);
      speechText = res.speechText;
      summary = res.summary;
      result = {
        date,
        level,
        levelName: dayDataL.levelName,
        mealType: 'both',
        speechText,
        summary,
        cached: false,
        generatedAt: new Date().toISOString(),
        details: {
          specialEntrees: [...dayDataB.specialEntrees, ...dayDataL.specialEntrees],
          sides: [...dayDataB.sides, ...dayDataL.sides],
          treats: [...dayDataB.treats, ...dayDataL.treats],
          stapleEntrees: [...dayDataB.stapleEntrees, ...dayDataL.stapleEntrees],
        },
        breakfast: {
          specialEntrees: dayDataB.specialEntrees,
          sides: dayDataB.sides,
          treats: dayDataB.treats,
          stapleEntrees: dayDataB.stapleEntrees,
        },
        lunch: {
          specialEntrees: dayDataL.specialEntrees,
          sides: dayDataL.sides,
          treats: dayDataL.treats,
          stapleEntrees: dayDataL.stapleEntrees,
        },
      };
    }

    // 3. Save to cache
    await setCachedMenu(date, level, meal, result);

    return formatResponse(result, format);
  } catch (err: any) {
    console.error('Error in handleMenuRequest:', err);
    return NextResponse.json(
      {
        error: 'Failed to retrieve menu summary',
        message: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function formatResponse(result: LunchSummaryResult, format: string) {
  if (format === 'text') {
    return new NextResponse(result.speechText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }

  if (format === 'briefing') {
    const mealLabel =
      result.mealType === 'breakfast' ? 'Breakfast' : result.mealType === 'both' ? 'Menu' : 'Lunch';
    const briefing: AlexaFlashBriefingItem = {
      uid: `urn:uuid:menu-${result.level}-${result.mealType || 'lunch'}-${result.date}`,
      updateDate: new Date().toISOString().replace(/\.\d+Z$/, '.0Z'),
      titleText: `Today's ${result.levelName} ${mealLabel}`,
      mainText: result.speechText,
      redirectionUrl: `https://menus.healthepro.com/organizations/3368`,
    };
    return NextResponse.json(briefing, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }

  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
