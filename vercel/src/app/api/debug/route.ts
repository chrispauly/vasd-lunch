import { NextRequest, NextResponse } from 'next/server';
import { LunchLevel } from '@/lib/types';
import { fetchLunchMenuForDay } from '@/lib/healthepro';
import { getTodayDateStr } from '@/lib/cache';

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return getTodayDateStr();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseLevel(searchParams.get('level'));
    const date = parseDate(searchParams.get('date'));

    const dayData = await fetchLunchMenuForDay(date, level);

    return NextResponse.json(
      {
        debug: true,
        source: 'Health-e Pro Scraper (Pre-AI)',
        organizationId: 3368,
        date,
        level,
        levelName: dayData.levelName,
        hasSchool: dayData.hasSchool,
        counts: {
          totalRawItems: dayData.rawItems.length,
          specialEntrees: dayData.specialEntrees.length,
          stapleEntrees: dayData.stapleEntrees.length,
          sides: dayData.sides.length,
          treats: dayData.treats.length,
        },
        specialEntrees: dayData.specialEntrees,
        stapleEntrees: dayData.stapleEntrees,
        sides: dayData.sides,
        treats: dayData.treats,
        allRawItems: dayData.rawItems,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch raw debug data',
        message: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
