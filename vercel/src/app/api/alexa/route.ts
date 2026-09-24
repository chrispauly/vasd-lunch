import { NextRequest, NextResponse } from 'next/server';
import {
  AlexaRequestEnvelope,
  buildAlexaResponse,
  resolveSchoolLevel,
  resolveDateSlot,
  resolveMealType,
  ResolvedDate,
  supportsApl,
} from '@/lib/alexa';
import {
  buildWelcomeAplDocument,
  buildWelcomeAplDatasource,
  buildMenuAplDocument,
  buildMenuAplDatasource,
  buildWeeklyAplDocument,
  buildWeeklyAplDatasource,
} from '@/lib/apl';
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
import { getCachedMenu, setCachedMenu, getTodayDateStr } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    skill: 'Verona School Lunch',
    endpoint: '/api/alexa',
    message: 'Alexa Custom Skill endpoint is active. Configure this URL as your HTTPS endpoint in the Amazon Alexa Developer Console.',
  });
}

/**
 * Handles single-day menu requests (today, tomorrow, specific date) for voice or touchscreen taps
 */
async function handleSingleDayMenu({
  schoolLevel,
  mealType,
  dateStr,
  sessionAttributes,
  body,
  shouldEndSession = true,
}: {
  schoolLevel: LunchLevel;
  mealType: MealType;
  dateStr: string;
  sessionAttributes: any;
  body: AlexaRequestEnvelope;
  shouldEndSession?: boolean;
}): Promise<NextResponse> {
  const levelConfig = LEVEL_CONFIG[schoolLevel] || LEVEL_CONFIG.ES;

  // 1. Check cache first (for current day)
  const cached = await getCachedMenu(dateStr, schoolLevel, mealType);
  if (cached) {
    const directives = supportsApl(body)
      ? [
          {
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: 'vasdMenuToken',
            document: buildMenuAplDocument(),
            datasources: buildMenuAplDatasource(cached),
          },
        ]
      : undefined;

    return NextResponse.json(
      buildAlexaResponse({
        speechText: cached.speechText,
        shouldEndSession,
        sessionAttributes,
        cardTitle: `${cached.levelName} ${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Menu'} - ${dateStr}`,
        directives,
      })
    );
  }

  // 2. Fetch fresh menu data from Health-e Pro
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
      heroImage: dayData.heroImage,
      items: dayData.itemsWithImages,
      details: {
        specialEntrees: dayData.specialEntrees,
        sides: dayData.sides,
        treats: dayData.treats,
        stapleEntrees: dayData.stapleEntrees,
        heroImage: dayData.heroImage,
        items: dayData.itemsWithImages,
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
      heroImage: dayData.heroImage,
      items: dayData.itemsWithImages,
      details: {
        specialEntrees: dayData.specialEntrees,
        sides: dayData.sides,
        treats: dayData.treats,
        stapleEntrees: dayData.stapleEntrees,
        heroImage: dayData.heroImage,
        items: dayData.itemsWithImages,
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
    const combinedHeroImage = lunchData.heroImage || breakfastData.heroImage;
    const combinedItems = [...(lunchData.itemsWithImages || []), ...(breakfastData.itemsWithImages || [])];
    result = {
      date: dateStr,
      level: schoolLevel,
      levelName: lunchData.levelName,
      mealType: 'both',
      speechText,
      summary,
      cached: false,
      generatedAt: new Date().toISOString(),
      heroImage: combinedHeroImage,
      items: combinedItems,
      details: {
        specialEntrees: [...breakfastData.specialEntrees, ...lunchData.specialEntrees],
        sides: [...breakfastData.sides, ...lunchData.sides],
        treats: [...breakfastData.treats, ...lunchData.treats],
        stapleEntrees: [...breakfastData.stapleEntrees, ...lunchData.stapleEntrees],
        heroImage: combinedHeroImage,
        items: combinedItems,
      },
      breakfast: {
        specialEntrees: breakfastData.specialEntrees,
        sides: breakfastData.sides,
        treats: breakfastData.treats,
        stapleEntrees: breakfastData.stapleEntrees,
        heroImage: breakfastData.heroImage,
        items: breakfastData.itemsWithImages,
      },
      lunch: {
        specialEntrees: lunchData.specialEntrees,
        sides: lunchData.sides,
        treats: lunchData.treats,
        stapleEntrees: lunchData.stapleEntrees,
        heroImage: lunchData.heroImage,
        items: lunchData.itemsWithImages,
      },
    };
  }

  // 3. Save to cache if it is today
  await setCachedMenu(dateStr, schoolLevel, mealType, result);

  const directives = supportsApl(body)
    ? [
        {
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'vasdMenuToken',
          document: buildMenuAplDocument(),
          datasources: buildMenuAplDatasource(result),
        },
      ]
    : undefined;

  return NextResponse.json(
    buildAlexaResponse({
      speechText,
      shouldEndSession,
      sessionAttributes,
      cardTitle,
      directives,
    })
  );
}

/**
 * Handles weekly menu requests for voice
 */
async function handleWeekMenu({
  schoolLevel,
  mealType,
  resolvedDate,
  sessionAttributes,
  body,
}: {
  schoolLevel: LunchLevel;
  mealType: MealType;
  resolvedDate: Extract<ResolvedDate, { type: 'week' }>;
  sessionAttributes: any;
  body: AlexaRequestEnvelope;
}): Promise<NextResponse> {
  const levelConfig = LEVEL_CONFIG[schoolLevel] || LEVEL_CONFIG.ES;
  const weekLabel = resolvedDate.label || 'this week';
  let speechText = '';
  let cardMealTitle = 'Menu';
  let weekResult: any;

  if (mealType === 'breakfast') {
    cardMealTitle = 'Breakfast';
    const weekData = await fetchBreakfastMenuForWeek(resolvedDate.weekStr, schoolLevel);
    const res = await generateWeeklyLunchSummary(levelConfig.name, weekData, `${weekLabel}'s breakfast`);
    speechText = res.speechText;
    weekResult = {
      levelName: levelConfig.name,
      week: `${resolvedDate.weekStr} (${weekLabel})`,
      days: weekData.map((d) => ({
        date: d.date,
        hasSchool: d.hasSchool,
        specialEntrees: d.specialEntrees,
        sides: d.sides,
        treats: d.treats,
        heroImage: d.heroImage,
      })),
    };
  } else if (mealType === 'lunch') {
    cardMealTitle = 'Lunch';
    const weekData = await fetchLunchMenuForWeek(resolvedDate.weekStr, schoolLevel);
    const res = await generateWeeklyLunchSummary(levelConfig.name, weekData, weekLabel);
    speechText = res.speechText;
    weekResult = {
      levelName: levelConfig.name,
      week: `${resolvedDate.weekStr} (${weekLabel})`,
      days: weekData.map((d) => ({
        date: d.date,
        hasSchool: d.hasSchool,
        specialEntrees: d.specialEntrees,
        sides: d.sides,
        treats: d.treats,
        heroImage: d.heroImage,
      })),
    };
  } else {
    cardMealTitle = 'Menu';
    const [bWeek, lWeek] = await Promise.all([
      fetchBreakfastMenuForWeek(resolvedDate.weekStr, schoolLevel),
      fetchLunchMenuForWeek(resolvedDate.weekStr, schoolLevel),
    ]);
    const res = await generateWeeklyCombinedSummary(levelConfig.name, bWeek, lWeek, weekLabel);
    speechText = res.speechText;
    weekResult = {
      levelName: levelConfig.name,
      week: `${resolvedDate.weekStr} (${weekLabel})`,
      days: lWeek.map((ld, i) => {
        const bd = bWeek[i];
        return {
          date: ld.date,
          hasSchool: ld.hasSchool || bd?.hasSchool,
          heroImage: ld.heroImage || bd?.heroImage,
          breakfast: bd ? { specialEntrees: bd.specialEntrees } : null,
          lunch: { specialEntrees: ld.specialEntrees },
        };
      }),
    };
  }

  const directives = supportsApl(body)
    ? [
        {
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'vasdWeeklyToken',
          document: buildWeeklyAplDocument(),
          datasources: buildWeeklyAplDatasource(weekResult),
        },
      ]
    : undefined;

  return NextResponse.json(
    buildAlexaResponse({
      speechText,
      shouldEndSession: true,
      sessionAttributes,
      cardTitle: `${levelConfig.name} ${cardMealTitle} (${resolvedDate.weekStr})`,
      directives,
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: AlexaRequestEnvelope = await req.json();
    if (!body || !body.request) {
      return NextResponse.json({ error: 'Invalid Alexa request payload' }, { status: 400 });
    }
    const { request, session } = body;
    const sessionAttributes = session?.attributes ? { ...session.attributes } : {};

    // 1. Handle LaunchRequest ("Alexa, open Verona School Lunch")
    // Renders interactive Touchscreen School Selection on Echo Show 8 / screens
    if (request.type === 'LaunchRequest') {
      const speech =
        'Welcome to Verona School Lunch! Would you like the menu for elementary, middle, or high school? You can also ask for breakfast or lunch.';
      const reprompt = 'Which school level would you like: elementary, middle, or high school?';

      const directives = supportsApl(body)
        ? [
            {
              type: 'Alexa.Presentation.APL.RenderDocument',
              token: 'vasdWelcomeToken',
              document: buildWelcomeAplDocument(),
              datasources: buildWelcomeAplDatasource(),
            },
          ]
        : undefined;

      return NextResponse.json(
        buildAlexaResponse({
          speechText: speech,
          repromptText: reprompt,
          shouldEndSession: false,
          sessionAttributes,
          cardTitle: 'Verona School Lunch',
          directives,
        })
      );
    }

    // 2. Handle Touchscreen UserEvent (User tapped a school card or meal button on Echo Show)
    if (request.type === 'Alexa.Presentation.APL.UserEvent') {
      const args = (request as any).arguments || [];
      const action = args[0] || 'selectLevel';
      const targetLevel = (args[1] as LunchLevel) || sessionAttributes.schoolLevel || 'ES';
      const targetMeal = (args[2] as MealType) || sessionAttributes.mealType || 'both';

      sessionAttributes.schoolLevel = targetLevel;
      sessionAttributes.mealType = targetMeal;

      const dateStr = sessionAttributes.pendingDate || getTodayDateStr();

      return await handleSingleDayMenu({
        schoolLevel: targetLevel,
        mealType: targetMeal,
        dateStr,
        sessionAttributes,
        body,
        shouldEndSession: true,
      });
    }

    // 3. Handle SessionEndedRequest
    if (request.type === 'SessionEndedRequest') {
      return NextResponse.json({
        version: '1.0',
        response: { shouldEndSession: true },
      });
    }

    // 4. Handle IntentRequest
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

      // If school level is not known yet, prompt the user with interactive touch screen cards on Echo Show
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

        const directives = supportsApl(body)
          ? [
              {
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: 'vasdWelcomeToken',
                document: buildWelcomeAplDocument(),
                datasources: buildWelcomeAplDatasource(),
              },
            ]
          : undefined;

        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Verona School Lunch',
            directives,
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

      // Case A: User asked about a week (e.g. "next week", "this week", or ISO week)
      if (resolvedDate.type === 'week') {
        return await handleWeekMenu({
          schoolLevel,
          mealType,
          resolvedDate,
          sessionAttributes,
          body,
        });
      }

      // Case B: User asked about a single day (today, tomorrow, yesterday, or specific date)
      return await handleSingleDayMenu({
        schoolLevel,
        mealType,
        dateStr: resolvedDate.dateStr,
        sessionAttributes,
        body,
        shouldEndSession: true,
      });
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
