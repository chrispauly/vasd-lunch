import { NextRequest, NextResponse } from 'next/server';
import {
  AlexaRequestEnvelope,
  buildAlexaResponse,
  resolveSchoolLevel,
  resolveDateSlot,
  resolveMealType,
  ResolvedDate,
} from '@/lib/alexa';
import { LunchLevel, LunchSummaryResult, MealType } from '@/lib/types';
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
import { getCachedMenu, setCachedMenu } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    skill: 'Verona School Lunch',
    endpoint: '/api/alexa',
    message: 'Alexa Custom Skill endpoint is active. Configure this URL as your HTTPS endpoint in the Amazon Alexa Developer Console.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: AlexaRequestEnvelope = await req.json();
    const { request, session } = body;
    const sessionAttributes = session?.attributes ? { ...session.attributes } : {};

    // 1. Handle LaunchRequest ("Alexa, open Verona School Lunch")
    if (request.type === 'LaunchRequest') {
      const speech = 'Welcome to Verona School Lunch! Would you like the menu for elementary, middle, or high school? You can also ask for breakfast or lunch.';
      const reprompt = 'Which school level would you like: elementary, middle, or high school?';
      return NextResponse.json(
        buildAlexaResponse({
          speechText: speech,
          repromptText: reprompt,
          shouldEndSession: false,
          sessionAttributes,
          cardTitle: 'Verona School Lunch',
        })
      );
    }

    // 2. Handle SessionEndedRequest
    if (request.type === 'SessionEndedRequest') {
      return NextResponse.json({
        version: '1.0',
        response: { shouldEndSession: true },
      });
    }

    // 3. Handle IntentRequest
    if (request.type === 'IntentRequest' && request.intent) {
      const intentName = request.intent.name;

      // Built-in Help Intent
      if (intentName === 'AMAZON.HelpIntent') {
        const speech =
          "You can ask for breakfast, lunch, or the full menu for elementary, middle, or high school for today, tomorrow, or next week. For example, say: what's for breakfast tomorrow for elementary school, or what's the menu for high school? Which school would you like?";
        const reprompt = 'Which school level would you like: elementary, middle, or high school?';
        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Verona School Lunch Help',
          })
        );
      }

      // Built-in Cancel / Stop Intents
      if (intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.StopIntent') {
        return NextResponse.json(
          buildAlexaResponse({
            speechText: 'Goodbye!',
            shouldEndSession: true,
          })
        );
      }

      // Built-in Fallback Intent
      if (intentName === 'AMAZON.FallbackIntent') {
        const speech =
          "Sorry, I didn't catch that. You can ask for breakfast, lunch, or the full menu for elementary, middle, or high school for today, tomorrow, or next week. Which school would you like?";
        const reprompt = 'Which school would you like: elementary, middle, or high school?';
        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Verona School Lunch',
          })
        );
      }

      // GetLunchIntent / GetMenuIntent or default intent handling
      const slots = request.intent.slots || {};
      const schoolLevel = resolveSchoolLevel(slots.schoolLevel, sessionAttributes);

      // If school level is not known yet, prompt the user
      if (!schoolLevel) {
        // If a date or meal was provided in this utterance, remember them for the next turn
        const rawDateSlot = slots.date;
        const rawDateVal = rawDateSlot?.value || (rawDateSlot as any)?.slotValue?.value;
        if (rawDateVal) {
          sessionAttributes.pendingDate = rawDateVal;
        }
        const rawMealSlot = slots.mealType;
        const rawMealVal = rawMealSlot?.value || (rawMealSlot as any)?.slotValue?.value;
        if (rawMealVal) {
          sessionAttributes.pendingMealType = rawMealVal;
        }

        const speech = 'Would you like the menu for elementary, middle, or high school?';
        const reprompt = 'Please choose elementary, middle, or high school.';
        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Verona School Lunch',
          })
        );
      }

      // Remember the chosen school level in session attributes
      sessionAttributes.schoolLevel = schoolLevel;

      // Determine meal type (breakfast, lunch, or both)
      let mealType: MealType;
      if (slots.mealType?.value || (slots.mealType as any)?.slotValue?.value) {
        mealType = resolveMealType(slots.mealType, sessionAttributes);
      } else if (sessionAttributes.pendingMealType) {
        mealType = resolveMealType({ name: 'mealType', value: sessionAttributes.pendingMealType }, sessionAttributes);
        delete sessionAttributes.pendingMealType;
      } else {
        mealType = resolveMealType(undefined, sessionAttributes);
      }
      sessionAttributes.mealType = mealType;

      // Determine date: check slot first, then check pendingDate from previous turn, else default to today
      const dateVal = slots.date?.value || (slots.date as any)?.slotValue?.value;
      let resolvedDate: ResolvedDate;
      if (dateVal) {
        resolvedDate = resolveDateSlot(slots.date);
      } else if (sessionAttributes.pendingDate) {
        resolvedDate = resolveDateSlot({ name: 'date', value: sessionAttributes.pendingDate });
        delete sessionAttributes.pendingDate;
      } else {
        resolvedDate = resolveDateSlot(undefined);
      }

      const levelConfig = LEVEL_CONFIG[schoolLevel] || LEVEL_CONFIG.ES;

      // Case A: User asked about a week (e.g. "next week", "this week", or ISO week)
      if (resolvedDate.type === 'week') {
        const weekLabel = resolvedDate.label || 'this week';
        let speechText = '';
        let cardMealTitle = 'Menu';

        if (mealType === 'breakfast') {
          cardMealTitle = 'Breakfast';
          const weekData = await fetchBreakfastMenuForWeek(resolvedDate.weekStr, schoolLevel);
          const res = await generateWeeklyLunchSummary(levelConfig.name, weekData, `${weekLabel}'s breakfast`);
          speechText = res.speechText;
        } else if (mealType === 'lunch') {
          cardMealTitle = 'Lunch';
          const weekData = await fetchLunchMenuForWeek(resolvedDate.weekStr, schoolLevel);
          const res = await generateWeeklyLunchSummary(levelConfig.name, weekData, weekLabel);
          speechText = res.speechText;
        } else {
          cardMealTitle = 'Menu';
          const [bWeek, lWeek] = await Promise.all([
            fetchBreakfastMenuForWeek(resolvedDate.weekStr, schoolLevel),
            fetchLunchMenuForWeek(resolvedDate.weekStr, schoolLevel),
          ]);
          const res = await generateWeeklyCombinedSummary(levelConfig.name, bWeek, lWeek, weekLabel);
          speechText = res.speechText;
        }

        return NextResponse.json(
          buildAlexaResponse({
            speechText,
            shouldEndSession: true,
            sessionAttributes,
            cardTitle: `${levelConfig.name} ${cardMealTitle} (${resolvedDate.weekStr})`,
          })
        );
      }

      // Case B: User asked about a single day (today, tomorrow, yesterday, or specific date)
      const dateStr = resolvedDate.dateStr;

      // Check cache first (for current day)
      const cached = await getCachedMenu(dateStr, schoolLevel, mealType);
      if (cached) {
        return NextResponse.json(
          buildAlexaResponse({
            speechText: cached.speechText,
            shouldEndSession: true,
            sessionAttributes,
            cardTitle: `${cached.levelName} ${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Menu'} - ${dateStr}`,
          })
        );
      }

      let speechText = '';
      let summary = '';
      let cardTitle = '';
      let result: LunchSummaryResult;

      if (mealType === 'breakfast') {
        const dayData = await fetchBreakfastMenuForDay(dateStr, schoolLevel);
        const res = await generateBreakfastSummary(dayData);
        speechText = res.speechText;
        summary = res.summary;
        cardTitle = `${dayData.levelName} Breakfast - ${dateStr}`;
        result = {
          date: dateStr,
          level: schoolLevel,
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
      } else if (mealType === 'lunch') {
        const dayData = await fetchLunchMenuForDay(dateStr, schoolLevel);
        const res = await generateLunchSummary(dayData);
        speechText = res.speechText;
        summary = res.summary;
        cardTitle = `${dayData.levelName} Lunch - ${dateStr}`;
        result = {
          date: dateStr,
          level: schoolLevel,
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
        // Both breakfast and lunch
        const [breakfastData, lunchData] = await Promise.all([
          fetchBreakfastMenuForDay(dateStr, schoolLevel),
          fetchLunchMenuForDay(dateStr, schoolLevel),
        ]);
        const res = await generateCombinedMenuSummary(breakfastData, lunchData);
        speechText = res.speechText;
        summary = res.summary;
        cardTitle = `${lunchData.levelName} Menu - ${dateStr}`;
        result = {
          date: dateStr,
          level: schoolLevel,
          levelName: lunchData.levelName,
          mealType: 'both',
          speechText,
          summary,
          cached: false,
          generatedAt: new Date().toISOString(),
          details: {
            specialEntrees: [...breakfastData.specialEntrees, ...lunchData.specialEntrees],
            sides: [...breakfastData.sides, ...lunchData.sides],
            treats: [...breakfastData.treats, ...lunchData.treats],
            stapleEntrees: [...breakfastData.stapleEntrees, ...lunchData.stapleEntrees],
          },
          breakfast: {
            specialEntrees: breakfastData.specialEntrees,
            sides: breakfastData.sides,
            treats: breakfastData.treats,
            stapleEntrees: breakfastData.stapleEntrees,
          },
          lunch: {
            specialEntrees: lunchData.specialEntrees,
            sides: lunchData.sides,
            treats: lunchData.treats,
            stapleEntrees: lunchData.stapleEntrees,
          },
        };
      }

      // Save to cache if today
      await setCachedMenu(dateStr, schoolLevel, mealType, result);

      return NextResponse.json(
        buildAlexaResponse({
          speechText,
          shouldEndSession: true,
          sessionAttributes,
          cardTitle,
        })
      );
    }

    // Default fallback for any unrecognized request type
    return NextResponse.json(
      buildAlexaResponse({
        speechText: 'Welcome to Verona School Lunch. Which school would you like: elementary, middle, or high school?',
        repromptText: 'Please say elementary, middle, or high school.',
        shouldEndSession: false,
        sessionAttributes,
      })
    );
  } catch (error: any) {
    console.error('Error handling Alexa request:', error);
    return NextResponse.json(
      buildAlexaResponse({
        speechText:
          'Sorry, I encountered an issue retrieving the school lunch menu. Please try again in a moment.',
        shouldEndSession: true,
      })
    );
  }
}
