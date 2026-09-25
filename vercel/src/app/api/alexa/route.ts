import { NextRequest, NextResponse } from 'next/server';
import {
  AlexaRequestEnvelope,
  buildAlexaResponse,
  resolveSchoolLevel,
  resolveDateSlot,
  resolveDateSlotExplicit,
  resolveMealType,
  resolveMealTypeExplicit,
  ResolvedDate,
  getIsoWeekString,
  supportsApl,
  supportsAplt,
  buildApltDirective,
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
    skill: 'Unofficial Verona Wisconsin School Lunch',
    endpoint: '/api/alexa',
    message:
      'Alexa Custom Skill endpoint is active. Configure this URL as your HTTPS endpoint in the Amazon Alexa Developer Console.',
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
  shouldEndSession,
}: {
  schoolLevel: LunchLevel;
  mealType: MealType;
  dateStr: string;
  sessionAttributes: any;
  body: AlexaRequestEnvelope;
  shouldEndSession?: boolean;
}): Promise<NextResponse> {
  const isApl = supportsApl(body);
  const endSession = shouldEndSession !== undefined ? shouldEndSession : !isApl;
  const reprompt = isApl ? "Say 'see more' to view food photos, or ask for another day." : undefined;

  // Preserve navigation context in session attributes
  sessionAttributes.schoolLevel = schoolLevel;
  sessionAttributes.mealType = mealType;
  sessionAttributes.dateStr = dateStr;
  sessionAttributes.screen = 'menu';

  // 1. Check cache first (for current day)
  const isAplt = supportsAplt(body);
  const cached = await getCachedMenu(dateStr, schoolLevel, mealType);
  if (cached) {
    const directives = isApl
      ? [
          {
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: 'vasdMenuToken',
            document: buildMenuAplDocument(),
            datasources: buildMenuAplDatasource(cached),
          },
        ]
      : isAplt
      ? [buildApltDirective(mealType === 'breakfast' ? 'BRK' : 'LNCH')]
      : undefined;

    return NextResponse.json(
      buildAlexaResponse({
        speechText: cached.speechText,
        repromptText: reprompt,
        shouldEndSession: endSession,
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

  // 3. Save to cache
  await setCachedMenu(dateStr, schoolLevel, mealType, result);

  const directives = isApl
    ? [
        {
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'vasdMenuToken',
          document: buildMenuAplDocument(),
          datasources: buildMenuAplDatasource(result),
        },
      ]
    : isAplt
    ? [buildApltDirective(mealType === 'breakfast' ? 'BRK' : 'LNCH')]
    : undefined;

  return NextResponse.json(
    buildAlexaResponse({
      speechText,
      repromptText: reprompt,
      shouldEndSession: endSession,
      sessionAttributes,
      cardTitle,
      directives,
    })
  );
}

/**
 * Handles weekly menu requests for voice or screens
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

  const isApl = supportsApl(body);
  const isAplt = supportsAplt(body);
  const directives = isApl
    ? [
        {
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'vasdWeeklyToken',
          document: buildWeeklyAplDocument(),
          datasources: buildWeeklyAplDatasource(weekResult),
        },
      ]
    : isAplt
    ? [buildApltDirective('WEEK')]
    : undefined;

  return NextResponse.json(
    buildAlexaResponse({
      speechText,
      repromptText: isApl ? "You can ask for today's menu or choose another school." : undefined,
      shouldEndSession: !isApl,
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
    // Renders OnMount Headline splash with VASD paw logo & title, auto-advancing to 3 equal school buttons
    if (request.type === 'LaunchRequest') {
      const speech =
        'Welcome to Unofficial Verona Wisconsin School Lunch. Would you like the menu for Elementary, Middle, or High School?';
      const reprompt = 'Which school would you like: Elementary, Middle, or High School?';

      sessionAttributes.wizardStep = 'school';

      const directives = supportsApl(body)
        ? [
            {
              type: 'Alexa.Presentation.APL.RenderDocument',
              token: 'vasdWelcomeToken',
              document: buildWelcomeAplDocument(),
              datasources: buildWelcomeAplDatasource({ step: 'splash' }),
            },
          ]
        : supportsAplt(body)
        ? [buildApltDirective('VASD')]
        : undefined;

      return NextResponse.json(
        buildAlexaResponse({
          speechText: speech,
          repromptText: reprompt,
          shouldEndSession: false,
          sessionAttributes,
          cardTitle: 'Unofficial Verona Wisconsin School Lunch',
          directives,
        })
      );
    }

    // 2. Handle Touchscreen UserEvents from APL
    if (request.type === 'Alexa.Presentation.APL.UserEvent') {
      const args = (request as any).arguments || [];
      const action = args[0] || 'selectLevel';

      // ==========================================
      // A: User tapped a School Level (Page 1)
      // ==========================================
      if (action === 'selectLevel') {
        const targetLevel = (args[1] as LunchLevel) || 'ES';
        sessionAttributes.schoolLevel = targetLevel;

        // If meal type is not yet known, stay on Step 2 (Meal)
        if (!sessionAttributes.mealType) {
          sessionAttributes.wizardStep = 'meal';
          const levelName = LEVEL_CONFIG[targetLevel]?.name || 'Verona Schools';
          return NextResponse.json(
            buildAlexaResponse({
              speechText: `${levelName}! Would you like breakfast, lunch, or both?`,
              repromptText: 'Would you like breakfast, lunch, or both?',
              shouldEndSession: false,
              sessionAttributes,
              cardTitle: `${levelName} • Select Meal`,
            })
          );
        }

        // If date is not yet known, advance to Step 3 (Date)
        if (!sessionAttributes.pendingDate && !sessionAttributes.dateStr) {
          sessionAttributes.wizardStep = 'date';
          return NextResponse.json(
            buildAlexaResponse({
              speechText: "Would you like today's menu or tomorrow's?",
              repromptText: 'Please choose today or tomorrow.',
              shouldEndSession: false,
              sessionAttributes,
              cardTitle: 'Select Date',
              directives: [
                {
                  type: 'Alexa.Presentation.APL.ExecuteCommands',
                  token: 'vasdWelcomeToken',
                  commands: [
                    {
                      type: 'SetPage',
                      componentId: 'wizardPager',
                      value: 3,
                    },
                  ],
                },
              ],
            })
          );
        }

        // Both meal and date are known: jump directly to menu!
        const dateStr = sessionAttributes.pendingDate || sessionAttributes.dateStr || getTodayDateStr();
        return await handleSingleDayMenu({
          schoolLevel: targetLevel,
          mealType: sessionAttributes.mealType,
          dateStr,
          sessionAttributes,
          body,
        });
      }

      // ==========================================
      // B: User tapped a Meal Type (Page 2)
      // ==========================================
      if (action === 'selectMeal') {
        const targetLevel = (args[1] as LunchLevel) || sessionAttributes.schoolLevel || 'ES';
        const targetMeal = (args[2] as MealType) || 'both';
        sessionAttributes.schoolLevel = targetLevel;
        sessionAttributes.mealType = targetMeal;

        // If date is not yet known, wait on Step 3 (Date)
        if (!sessionAttributes.pendingDate && !sessionAttributes.dateStr) {
          sessionAttributes.wizardStep = 'date';
          const mealWord = targetMeal === 'breakfast' ? 'breakfast' : targetMeal === 'lunch' ? 'lunch' : 'menu';
          return NextResponse.json(
            buildAlexaResponse({
              speechText: `Would you like today's ${mealWord} or tomorrow's?`,
              repromptText: 'Please choose today or tomorrow.',
              shouldEndSession: false,
              sessionAttributes,
              cardTitle: 'Select Date',
            })
          );
        }

        // Both school, meal, and date are known: jump directly to menu!
        const dateStr = sessionAttributes.pendingDate || sessionAttributes.dateStr || getTodayDateStr();
        return await handleSingleDayMenu({
          schoolLevel: targetLevel,
          mealType: targetMeal,
          dateStr,
          sessionAttributes,
          body,
        });
      }

      // ==========================================
      // C: User tapped a Date (Page 3)
      // ==========================================
      if (action === 'selectDate') {
        const targetLevel = (args[1] as LunchLevel) || sessionAttributes.schoolLevel || 'ES';
        const targetMeal = (args[2] as MealType) || sessionAttributes.mealType || 'both';
        const dateChoice = String(args[3] || 'today').toLowerCase();

        sessionAttributes.schoolLevel = targetLevel;
        sessionAttributes.mealType = targetMeal;

        if (dateChoice.includes('week')) {
          const today = new Date(getTodayDateStr() + 'T12:00:00');
          const nextWeekDate = new Date(today.getTime() + 7 * 86400000);
          return await handleWeekMenu({
            schoolLevel: targetLevel,
            mealType: targetMeal,
            resolvedDate: { type: 'week', weekStr: getIsoWeekString(nextWeekDate), label: 'next week' },
            sessionAttributes,
            body,
          });
        }

        if (dateChoice.includes('tomorrow')) {
          const today = new Date(getTodayDateStr() + 'T12:00:00');
          const tomorrow = new Date(today.getTime() + 86400000);
          const dateStr = tomorrow.toISOString().split('T')[0];
          return await handleSingleDayMenu({
            schoolLevel: targetLevel,
            mealType: targetMeal,
            dateStr,
            sessionAttributes,
            body,
          });
        }

        // Today or default
        const dateStr = getTodayDateStr();
        return await handleSingleDayMenu({
          schoolLevel: targetLevel,
          mealType: targetMeal,
          dateStr,
          sessionAttributes,
          body,
        });
      }

      // ==========================================
      // D: User tapped Hero Image or "See Photos"
      // ==========================================
      if (action === 'showPhotos') {
        return NextResponse.json(
          buildAlexaResponse({
            speechText: "Here are the photos of today's menu items. Tap any photo, or say 'back to menu' to return.",
            repromptText: "Say 'back to menu' to return to the dinner menu.",
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Menu Photo Gallery',
          })
        );
      }

      // ==========================================
      // E: User tapped "Back to Restaurant Menu"
      // ==========================================
      if (action === 'showMenu') {
        return NextResponse.json(
          buildAlexaResponse({
            speechText: "Returning to the restaurant dinner menu. Say 'see more' anytime to view the food photos.",
            repromptText: "Say 'see more' to view food photos, or ask for another day.",
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Restaurant Dinner Menu',
          })
        );
      }

      // ==========================================
      // F: User tapped a School Switcher Chip on Menu Header
      // ==========================================
      if (action === 'switchLevel') {
        const targetLevel = (args[1] as LunchLevel) || 'ES';
        const targetMeal = sessionAttributes.mealType || 'lunch';
        const dateStr = sessionAttributes.dateStr || getTodayDateStr();
        return await handleSingleDayMenu({
          schoolLevel: targetLevel,
          mealType: targetMeal,
          dateStr,
          sessionAttributes,
          body,
        });
      }

      // ==========================================
      // G: User tapped a Meal Switcher Chip on Menu Header
      // ==========================================
      if (action === 'switchMeal') {
        const targetMeal = (args[1] as MealType) || 'lunch';
        const targetLevel = sessionAttributes.schoolLevel || 'ES';
        const dateStr = sessionAttributes.dateStr || getTodayDateStr();
        return await handleSingleDayMenu({
          schoolLevel: targetLevel,
          mealType: targetMeal,
          dateStr,
          sessionAttributes,
          body,
        });
      }
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
          "You can ask for breakfast, lunch, or the full menu for elementary, middle, or high school for today, tomorrow, or next week. For example, say: what's for lunch today at elementary school, or what's the menu for high school? Which school would you like?";
        const reprompt = 'Which school would you like: Elementary, Middle, or High School?';
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
          "Sorry, I didn't catch that. You can ask for breakfast, lunch, or both for elementary, middle, or high school for today, tomorrow, or next week. Which school would you like?";
        const reprompt = 'Which school would you like: Elementary, Middle, or High School?';
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

      // "See More" Intent (Voice command to flip to the Food Photo Gallery)
      if (
        intentName === 'SeeMoreIntent' ||
        intentName === 'AMAZON.MoreIntent' ||
        intentName === 'AMAZON.NextIntent'
      ) {
        if (supportsApl(body)) {
          return NextResponse.json(
            buildAlexaResponse({
              speechText: "Here are the photos of today's menu items. Say 'back to menu' to return to the dinner menu.",
              repromptText: "Say 'back to menu' to return to the dinner menu.",
              shouldEndSession: false,
              sessionAttributes,
              cardTitle: 'Food Photo Gallery',
              directives: [
                {
                  type: 'Alexa.Presentation.APL.ExecuteCommands',
                  token: 'vasdMenuToken',
                  commands: [
                    {
                      type: 'SetPage',
                      componentId: 'menuPager',
                      value: 1,
                    },
                  ],
                },
              ],
            })
          );
        } else {
          return NextResponse.json(
            buildAlexaResponse({
              speechText: 'Food photos are only available on Echo devices with screens, like the Echo Show.',
              shouldEndSession: true,
              sessionAttributes,
            })
          );
        }
      }

      // "Back to Menu" Intent (Voice command to return to Restaurant Dinner Menu)
      if (intentName === 'BackToMenuIntent' || intentName === 'AMAZON.PreviousIntent') {
        if (supportsApl(body)) {
          return NextResponse.json(
            buildAlexaResponse({
              speechText: 'Returning to the restaurant dinner menu.',
              repromptText: "Say 'see more' to view food photos, or ask for another day.",
              shouldEndSession: false,
              sessionAttributes,
              cardTitle: 'Restaurant Dinner Menu',
              directives: [
                {
                  type: 'Alexa.Presentation.APL.ExecuteCommands',
                  token: 'vasdMenuToken',
                  commands: [
                    {
                      type: 'SetPage',
                      componentId: 'menuPager',
                      value: 0,
                    },
                  ],
                },
              ],
            })
          );
        } else {
          return NextResponse.json(
            buildAlexaResponse({
              speechText: 'Returning to the main menu.',
              shouldEndSession: true,
              sessionAttributes,
            })
          );
        }
      }

      // ==========================================
      // General Menu Intents & Slot Resolution
      // ==========================================
      const slots = request.intent.slots || {};

      // 1. Resolve school level (or check session attributes)
      const extractedLevel = resolveSchoolLevel(slots.schoolLevel);
      const schoolLevel = extractedLevel || (sessionAttributes.schoolLevel as LunchLevel) || null;

      // 2. Resolve date explicitly (null if user hasn't chosen yet)
      const extractedDate = resolveDateSlotExplicit(slots.date);
      let resolvedDate: ResolvedDate | null = null;
      if (extractedDate) {
        resolvedDate = extractedDate;
      } else if (sessionAttributes.pendingDate) {
        resolvedDate = resolveDateSlot({ name: 'date', value: sessionAttributes.pendingDate });
      } else if (sessionAttributes.dateStr) {
        resolvedDate = { type: 'day', dateStr: sessionAttributes.dateStr };
      }

      // 3. Resolve meal type explicitly (null if user hasn't chosen yet)
      const extractedMeal = resolveMealTypeExplicit(slots.mealType);
      let mealType = extractedMeal || (sessionAttributes.mealType as MealType) || null;

      // If school and date are both provided (e.g. "what's the menu for tomorrow for elementary"),
      // default mealType to 'both' so it immediately fulfills the request with breakfast and lunch
      if (!mealType && schoolLevel && resolvedDate) {
        mealType = 'both';
      }

      // Preserve any provided information in session attributes
      if (schoolLevel) sessionAttributes.schoolLevel = schoolLevel;
      if (mealType) sessionAttributes.mealType = mealType;
      if (resolvedDate) {
        sessionAttributes.pendingDate = resolvedDate.type === 'week' ? resolvedDate.weekStr : resolvedDate.dateStr;
      }

      // =========================================================================
      // FAST-PATH: If all 3 parameters were specified initially, jump right to menu!
      // =========================================================================
      if (schoolLevel && mealType && resolvedDate) {
        if (resolvedDate.type === 'week') {
          return await handleWeekMenu({
            schoolLevel,
            mealType,
            resolvedDate,
            sessionAttributes,
            body,
          });
        }
        return await handleSingleDayMenu({
          schoolLevel,
          mealType,
          dateStr: resolvedDate.dateStr,
          sessionAttributes,
          body,
        });
      }

      // =========================================================================
      // STEP 1: School Level missing -> 3 equally spaced buttons
      // =========================================================================
      if (!schoolLevel) {
        sessionAttributes.wizardStep = 'school';
        const speech = 'Which school would you like: Elementary, Middle, or High School?';
        const reprompt = 'Please choose Elementary, Middle, or High School.';

        const directives = supportsApl(body)
          ? [
              {
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: 'vasdWelcomeToken',
                document: buildWelcomeAplDocument(),
                datasources: buildWelcomeAplDatasource({
                  step: 'school',
                  schoolLevel: undefined,
                  mealType: mealType || undefined,
                }),
              },
            ]
          : undefined;

        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Select School Level',
            directives,
          })
        );
      }

      // =========================================================================
      // STEP 2: Meal Type missing -> Breakfast, Lunch, Both
      // =========================================================================
      if (!mealType) {
        sessionAttributes.wizardStep = 'meal';
        const levelName = LEVEL_CONFIG[schoolLevel]?.name || 'Verona Schools';
        const speech = `For ${levelName}, would you like breakfast, lunch, or both?`;
        const reprompt = 'Would you like breakfast, lunch, or both?';

        const directives = supportsApl(body)
          ? [
              {
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: 'vasdWelcomeToken',
                document: buildWelcomeAplDocument(),
                datasources: buildWelcomeAplDatasource({
                  step: 'meal',
                  schoolLevel,
                  mealType: undefined,
                }),
              },
            ]
          : undefined;

        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: `${levelName} • Select Meal`,
            directives,
          })
        );
      }

      // =========================================================================
      // STEP 3: Date missing -> Today or Tomorrow (or Next Week)
      // =========================================================================
      if (!resolvedDate) {
        sessionAttributes.wizardStep = 'date';
        const mealWord = mealType === 'breakfast' ? 'breakfast' : mealType === 'lunch' ? 'lunch' : 'menu';
        const speech = `Would you like today's ${mealWord} or tomorrow's?`;
        const reprompt = 'Would you like today or tomorrow? You can also say next week.';

        const directives = supportsApl(body)
          ? [
              {
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: 'vasdWelcomeToken',
                document: buildWelcomeAplDocument(),
                datasources: buildWelcomeAplDatasource({
                  step: 'date',
                  schoolLevel,
                  mealType,
                }),
              },
            ]
          : undefined;

        return NextResponse.json(
          buildAlexaResponse({
            speechText: speech,
            repromptText: reprompt,
            shouldEndSession: false,
            sessionAttributes,
            cardTitle: 'Select Date',
            directives,
          })
        );
      }
    }

    // Default fallback for any unrecognized request type
    return NextResponse.json(
      buildAlexaResponse({
        speechText: 'Welcome to Unofficial Verona Wisconsin School Lunch. Which school would you like: Elementary, Middle, or High School?',
        repromptText: 'Please say Elementary, Middle, or High School.',
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
