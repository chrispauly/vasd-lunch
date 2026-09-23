import { NextRequest, NextResponse } from 'next/server';
import {
  AlexaRequestEnvelope,
  buildAlexaResponse,
  resolveSchoolLevel,
  resolveDateSlot,
  ResolvedDate,
} from '@/lib/alexa';
import { LunchLevel, LunchSummaryResult } from '@/lib/types';
import { fetchLunchMenuForDay, fetchLunchMenuForWeek, LEVEL_CONFIG } from '@/lib/healthepro';
import { generateLunchSummary, generateWeeklyLunchSummary } from '@/lib/gemini';
import { getCachedLunch, setCachedLunch } from '@/lib/cache';

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
      const speech = 'Welcome to Verona School Lunch! Would you like the lunch menu for elementary, middle, or high school?';
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
          "You can ask what's for lunch for elementary, middle, or high school for today, tomorrow, yesterday, or next week. For example, say: what's for lunch tomorrow for elementary school? Which school would you like?";
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
          "Sorry, I didn't catch that. You can ask what's for lunch for elementary, middle, or high school for today, tomorrow, or next week. Which school would you like?";
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

      // GetLunchIntent or default intent handling
      const slots = request.intent.slots || {};
      const schoolLevel = resolveSchoolLevel(slots.schoolLevel, sessionAttributes);

      // If school level is not known yet, prompt the user
      if (!schoolLevel) {
        // If a date was provided in this utterance, remember it for the next turn
        const rawDateSlot = slots.date;
        if (rawDateSlot?.value) {
          sessionAttributes.pendingDate = rawDateSlot.value;
        }

        const speech = 'Would you like the lunch menu for elementary, middle, or high school?';
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

      // Determine date: check slot first, then check pendingDate from previous turn, else default to today
      let resolvedDate: ResolvedDate;
      if (slots.date?.value) {
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
        const weekData = await fetchLunchMenuForWeek(resolvedDate.weekStr, schoolLevel);
        const { speechText } = await generateWeeklyLunchSummary(levelConfig.name, weekData);

        return NextResponse.json(
          buildAlexaResponse({
            speechText,
            shouldEndSession: true,
            sessionAttributes,
            cardTitle: `${levelConfig.name} Lunch (${resolvedDate.weekStr})`,
          })
        );
      }

      // Case B: User asked about a single day (today, tomorrow, yesterday, or specific date)
      const dateStr = resolvedDate.dateStr;

      // Check cache first (for current day)
      const cached = await getCachedLunch(dateStr, schoolLevel);
      if (cached) {
        return NextResponse.json(
          buildAlexaResponse({
            speechText: cached.speechText,
            shouldEndSession: true,
            sessionAttributes,
            cardTitle: `${cached.levelName} Lunch - ${dateStr}`,
          })
        );
      }

      // Fetch from Health-e Pro
      const dayData = await fetchLunchMenuForDay(dateStr, schoolLevel);
      const { speechText, summary } = await generateLunchSummary(dayData);

      // Save to cache if today
      const result: LunchSummaryResult = {
        date: dateStr,
        level: schoolLevel,
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
      await setCachedLunch(dateStr, schoolLevel, result);

      return NextResponse.json(
        buildAlexaResponse({
          speechText,
          shouldEndSession: true,
          sessionAttributes,
          cardTitle: `${dayData.levelName} Lunch - ${dateStr}`,
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
