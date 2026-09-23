import { NextRequest, NextResponse } from 'next/server';
import { LunchLevel, LunchSummaryResult, AlexaFlashBriefingItem } from '@/lib/types';
import { fetchLunchMenuForDay, fetchLunchMenuForWeek, LEVEL_CONFIG } from '@/lib/healthepro';
import { generateLunchSummary, generateWeeklyLunchSummary } from '@/lib/gemini';
import { getCachedLunch, setCachedLunch, getTodayDateStr } from '@/lib/cache';

export const dynamic = 'force-dynamic';

function parseLevel(param: string | null): LunchLevel {
  if (!param) return 'ES';
  const clean = param.trim().toUpperCase();
  if (clean === 'MS' || clean.includes('MIDDLE')) return 'MS';
  if (clean === 'HS' || clean.includes('HIGH')) return 'HS';
  return 'ES';
}

function parseDate(param: string | null): string {
  if (!param) return getTodayDateStr();
  const trimmed = param.trim();
  // Validate YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return getTodayDateStr();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseLevel(searchParams.get('level'));
    const rawDateParam = searchParams.get('date')?.trim();
    const isWeek = rawDateParam ? /^\d{4}-W\d{2}$/i.test(rawDateParam) : false;
    const format = (searchParams.get('format') || 'json').toLowerCase();

    // Check if week query requested
    if (isWeek) {
      const weekStr = rawDateParam!.toUpperCase();
      const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG.ES;
      const weekData = await fetchLunchMenuForWeek(weekStr, level);
      const { speechText, summary } = await generateWeeklyLunchSummary(levelConfig.name, weekData);

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
          level,
          levelName: levelConfig.name,
          speechText,
          summary,
          days: weekData.map(d => ({
            date: d.date,
            hasSchool: d.hasSchool,
            specialEntrees: d.specialEntrees,
            sides: d.sides,
            treats: d.treats,
          })),
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
      const dayData = await fetchLunchMenuForDay(date, level);
      return NextResponse.json(
        {
          debug: true,
          date,
          level,
          levelName: dayData.levelName,
          hasSchool: dayData.hasSchool,
          specialEntrees: dayData.specialEntrees,
          stapleEntrees: dayData.stapleEntrees,
          sides: dayData.sides,
          treats: dayData.treats,
          rawItems: dayData.rawItems,
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

    // 1. Check cache (only applies to current day)
    const cachedResult = await getCachedLunch(date, level);
    if (cachedResult) {
      return formatResponse(cachedResult, format);
    }

    // 2. Fetch menu from Health-e Pro
    const dayData = await fetchLunchMenuForDay(date, level);

    // 3. Generate summary via Gemini (with fallback)
    const { speechText, summary } = await generateLunchSummary(dayData);

    const result: LunchSummaryResult = {
      date,
      level,
      levelName: dayData.levelName,
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

    // 4. Save to cache (only caches if today)
    await setCachedLunch(date, level, result);

    return formatResponse(result, format);
  } catch (err: any) {
    console.error('Error in /api/lunch handler:', err);
    return NextResponse.json(
      {
        error: 'Failed to retrieve lunch summary',
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
    const briefing: AlexaFlashBriefingItem = {
      uid: `urn:uuid:lunch-${result.level}-${result.date}`,
      updateDate: new Date().toISOString().replace(/\.\d+Z$/, '.0Z'),
      titleText: `Today's ${result.levelName} Lunch`,
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
