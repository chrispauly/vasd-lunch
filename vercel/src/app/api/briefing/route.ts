import { NextRequest, NextResponse } from 'next/server';
import { LunchLevel, AlexaFlashBriefingItem } from '@/lib/types';
import { fetchLunchMenuForDay } from '@/lib/healthepro';
import { generateLunchSummary } from '@/lib/gemini';
import { getCachedLunch, setCachedLunch, getTodayDateStr } from '@/lib/cache';

export const dynamic = 'force-dynamic';

function parseLevel(param: string | null): LunchLevel {
  if (!param) return 'ES';
  const clean = param.trim().toUpperCase();
  if (clean === 'MS' || clean.includes('MIDDLE')) return 'MS';
  if (clean === 'HS' || clean.includes('HIGH')) return 'HS';
  return 'ES';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseLevel(searchParams.get('level'));
    const date = getTodayDateStr();

    // 1. Check cache
    let speechText = '';
    let levelName = 'Elementary School (K-5)';
    const cached = await getCachedLunch(date, level);

    if (cached) {
      speechText = cached.speechText;
      levelName = cached.levelName;
    } else {
      const dayData = await fetchLunchMenuForDay(date, level);
      levelName = dayData.levelName;
      const summaryRes = await generateLunchSummary(dayData);
      speechText = summaryRes.speechText;

      await setCachedLunch(date, level, {
        date,
        level,
        levelName: dayData.levelName,
        speechText,
        summary: speechText,
        cached: false,
        generatedAt: new Date().toISOString(),
        details: {
          specialEntrees: dayData.specialEntrees,
          sides: dayData.sides,
          treats: dayData.treats,
          stapleEntrees: dayData.stapleEntrees,
        },
      });
    }

    const briefing: AlexaFlashBriefingItem = {
      uid: `urn:uuid:lunch-${level}-${date}`,
      updateDate: new Date().toISOString().replace(/\.\d+Z$/, '.0Z'),
      titleText: `Today's ${levelName} Lunch`,
      mainText: speechText,
      redirectionUrl: 'https://menus.healthepro.com/organizations/3368',
    };

    return NextResponse.json(briefing, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Error in /api/briefing:', err);
    return NextResponse.json(
      {
        uid: `urn:uuid:lunch-error-${Date.now()}`,
        updateDate: new Date().toISOString().replace(/\.\d+Z$/, '.0Z'),
        titleText: "School Lunch Update",
        mainText: "School lunch information is currently unavailable. Please check back later.",
        redirectionUrl: "https://menus.healthepro.com/organizations/3368",
      },
      { status: 200 }
    );
  }
}
