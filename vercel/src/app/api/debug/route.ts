import { NextRequest, NextResponse } from 'next/server';
import { LunchLevel, MealType } from '@/lib/types';
import { fetchLunchMenuForDay, fetchBreakfastMenuForDay } from '@/lib/healthepro';
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

function parseMealType(param: string | null): MealType {
  if (!param) return 'lunch';
  const clean = param.trim().toLowerCase();
  if (clean === 'breakfast' || clean === 'b') return 'breakfast';
  if (clean === 'both' || clean === 'all' || clean === 'menu') return 'both';
  return 'lunch';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseLevel(searchParams.get('level'));
    const date = parseDate(searchParams.get('date'));
    const meal = parseMealType(searchParams.get('meal'));

    if (meal === 'breakfast') {
      const dayData = await fetchBreakfastMenuForDay(date, level);
      return NextResponse.json(
        {
          debug: true,
          source: 'Health-e Pro Scraper (Pre-AI)',
          organizationId: 3368,
          date,
          level,
          mealType: 'breakfast',
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
    }

    if (meal === 'both') {
      const [dayDataB, dayDataL] = await Promise.all([
        fetchBreakfastMenuForDay(date, level),
        fetchLunchMenuForDay(date, level),
      ]);
      return NextResponse.json(
        {
          debug: true,
          source: 'Health-e Pro Scraper (Pre-AI)',
          organizationId: 3368,
          date,
          level,
          mealType: 'both',
          levelName: dayDataL.levelName,
          hasSchool: dayDataL.hasSchool || dayDataB.hasSchool,
          breakfast: {
            counts: {
              totalRawItems: dayDataB.rawItems.length,
              specialEntrees: dayDataB.specialEntrees.length,
              stapleEntrees: dayDataB.stapleEntrees.length,
              sides: dayDataB.sides.length,
              treats: dayDataB.treats.length,
            },
            specialEntrees: dayDataB.specialEntrees,
            stapleEntrees: dayDataB.stapleEntrees,
            sides: dayDataB.sides,
            treats: dayDataB.treats,
            allRawItems: dayDataB.rawItems,
          },
          lunch: {
            counts: {
              totalRawItems: dayDataL.rawItems.length,
              specialEntrees: dayDataL.specialEntrees.length,
              stapleEntrees: dayDataL.stapleEntrees.length,
              sides: dayDataL.sides.length,
              treats: dayDataL.treats.length,
            },
            specialEntrees: dayDataL.specialEntrees,
            stapleEntrees: dayDataL.stapleEntrees,
            sides: dayDataL.sides,
            treats: dayDataL.treats,
            allRawItems: dayDataL.rawItems,
          },
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

    const dayData = await fetchLunchMenuForDay(date, level);
    return NextResponse.json(
      {
        debug: true,
        source: 'Health-e Pro Scraper (Pre-AI)',
        organizationId: 3368,
        date,
        level,
        mealType: 'lunch',
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
