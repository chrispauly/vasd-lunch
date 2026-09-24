import { LunchLevel, MealType } from './types';
import { getTodayDateStr } from './cache';

export interface AlexaSlot {
  name: string;
  value?: string;
  confirmationStatus?: string;
  resolutions?: {
    resolutionsPerAuthority?: Array<{
      authority: string;
      status: { code: 'ER_SUCCESS_MATCH' | 'ER_SUCCESS_NO_MATCH' };
      values?: Array<{
        value: {
          name: string;
          id: string;
        };
      }>;
    }>;
  };
}

export interface AlexaIntent {
  name: string;
  confirmationStatus?: string;
  slots?: Record<string, AlexaSlot>;
}

export interface AlexaRequest {
  type: 'LaunchRequest' | 'IntentRequest' | 'SessionEndedRequest';
  requestId: string;
  timestamp: string;
  locale?: string;
  intent?: AlexaIntent;
  reason?: string;
}

export interface AlexaSession {
  new: boolean;
  sessionId: string;
  attributes?: Record<string, any>;
  application?: {
    applicationId: string;
  };
  user?: {
    userId: string;
  };
}

export interface AlexaRequestEnvelope {
  version: string;
  session?: AlexaSession;
  context?: any;
  request: AlexaRequest;
}

export interface AlexaResponseEnvelope {
  version: '1.0';
  sessionAttributes?: Record<string, any>;
  response: {
    outputSpeech?: {
      type: 'PlainText' | 'SSML';
      text?: string;
      ssml?: string;
    };
    card?: {
      type: 'Simple' | 'Standard';
      title: string;
      content?: string;
      text?: string;
    };
    reprompt?: {
      outputSpeech: {
        type: 'PlainText' | 'SSML';
        text?: string;
        ssml?: string;
      };
    };
    shouldEndSession: boolean;
  };
}

export function buildAlexaResponse(options: {
  speechText: string;
  repromptText?: string;
  shouldEndSession?: boolean;
  sessionAttributes?: Record<string, any>;
  cardTitle?: string;
}): AlexaResponseEnvelope {
  const { speechText, repromptText, shouldEndSession = true, sessionAttributes, cardTitle } = options;

  const response: AlexaResponseEnvelope['response'] = {
    outputSpeech: {
      type: 'PlainText',
      text: speechText,
    },
    shouldEndSession,
  };

  if (repromptText) {
    response.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: repromptText,
      },
    };
  }

  if (cardTitle) {
    response.card = {
      type: 'Simple',
      title: cardTitle,
      content: speechText,
    };
  }

  return {
    version: '1.0',
    sessionAttributes: sessionAttributes || {},
    response,
  };
}

/**
 * Resolves school level from Alexa slot or fallback to session attributes
 */
export function resolveSchoolLevel(
  slot?: AlexaSlot,
  sessionAttributes?: Record<string, any>
): LunchLevel | null {
  // 1. Check entity resolution from slot
  if (slot?.resolutions?.resolutionsPerAuthority) {
    for (const auth of slot.resolutions.resolutionsPerAuthority) {
      if (auth.status?.code === 'ER_SUCCESS_MATCH' && auth.values && auth.values.length > 0) {
        const id = auth.values[0].value.id.toUpperCase();
        if (id === 'ES' || id === 'MS' || id === 'HS') {
          return id as LunchLevel;
        }
      }
    }
  }

  // 2. Check slot spoken value
  if (slot?.value) {
    const v = slot.value.toLowerCase().trim();
    if (v.includes('elem') || v.includes('grade') || v.includes('k-5') || v.includes('k five') || v.includes('primary')) {
      return 'ES';
    }
    if (v.includes('mid') || v.includes('junior') || v.includes('jr') || v.includes('6-8') || v.includes('six')) {
      return 'MS';
    }
    if (v.includes('high') || v.includes('hs') || v.includes('senior') || v.includes('9-12') || v.includes('nine')) {
      return 'HS';
    }
  }

  // 3. Fallback to existing session attribute if already known
  if (sessionAttributes?.schoolLevel) {
    const sl = String(sessionAttributes.schoolLevel).toUpperCase();
    if (sl === 'ES' || sl === 'MS' || sl === 'HS') {
      return sl as LunchLevel;
    }
  }

  return null;
}

/**
 * Resolves meal type from Alexa slot or fallback to session attributes.
 * Defaults to 'both' if user asks for 'the menu' or doesn't specify.
 */
export function resolveMealType(
  slot?: AlexaSlot,
  sessionAttributes?: Record<string, any>
): MealType {
  // 1. Check entity resolution from slot
  if (slot?.resolutions?.resolutionsPerAuthority) {
    for (const auth of slot.resolutions.resolutionsPerAuthority) {
      if (auth.status?.code === 'ER_SUCCESS_MATCH' && auth.values && auth.values.length > 0) {
        const id = auth.values[0].value.id.toUpperCase();
        if (id === 'BREAKFAST') return 'breakfast';
        if (id === 'LUNCH') return 'lunch';
        if (id === 'BOTH') return 'both';
      }
    }
  }

  // 2. Check slot spoken value
  const val = slot?.value || (slot as any)?.slotValue?.value;
  if (val) {
    const v = String(val).toLowerCase().trim();
    if (v.includes('both') || v.includes('all') || v.includes('everything') || (v.includes('breakfast') && v.includes('lunch'))) {
      return 'both';
    }
    if (v.includes('breakfast') || v.includes('morning')) {
      return 'breakfast';
    }
    if (v.includes('lunch') || v.includes('afternoon') || v.includes('dinner')) {
      return 'lunch';
    }
    if (v.includes('menu')) {
      return 'both';
    }
  }

  // 3. Fallback to existing session attribute if already known
  if (sessionAttributes?.mealType) {
    const mt = String(sessionAttributes.mealType).toLowerCase();
    if (mt === 'breakfast' || mt === 'lunch' || mt === 'both') {
      return mt as MealType;
    }
  }

  // 4. Default: User asked for "the menu", so include both breakfast and lunch
  return 'both';
}

export type ResolvedDate =
  | { type: 'day'; dateStr: string; label?: string }
  | { type: 'week'; weekStr: string; label?: string };

/**
 * Computes the ISO week string (e.g. "2026-W40") for a given date
 */
export function getIsoWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Resolves date slot from Alexa AMAZON.DATE value
 */
export function resolveDateSlot(slot?: AlexaSlot): ResolvedDate {
  const todayStr = getTodayDateStr();

  let val = slot?.value || (slot as any)?.slotValue?.value;
  if (!val && Array.isArray((slot as any)?.slotValue?.values) && (slot as any)?.slotValue?.values.length > 0) {
    val = (slot as any).slotValue.values[0]?.value;
  }

  if (!val) {
    return { type: 'day', dateStr: todayStr, label: 'today' };
  }

  let raw = String(val).trim().toUpperCase();

  if (raw === 'PRESENT_REF') {
    return { type: 'day', dateStr: todayStr, label: 'today' };
  }

  // Alexa may send week with weekend suffix like "2026-W39-WE", strip it
  if (raw.endsWith('-WE')) {
    raw = raw.replace('-WE', '');
  }

  // Check if it's an ISO week format (e.g. "2026-W40")
  if (/^\d{4}-W\d{2}$/.test(raw)) {
    const today = new Date(todayStr + 'T12:00:00');
    const thisWeek = getIsoWeekString(today);
    let label = 'that week';
    if (raw === thisWeek) {
      label = 'this week';
    } else {
      const nextWeekDate = new Date(today.getTime() + 7 * 86400000);
      if (raw === getIsoWeekString(nextWeekDate)) {
        label = 'next week';
      }
    }
    return { type: 'week', weekStr: raw, label };
  }

  // Check if it's a specific date (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { type: 'day', dateStr: raw };
  }

  // Handle human words if passed in slot
  const lower = raw.toLowerCase();
  if (lower.includes('tomorrow')) {
    const today = new Date(todayStr + 'T12:00:00');
    const tomorrow = new Date(today.getTime() + 86400000);
    return { type: 'day', dateStr: tomorrow.toISOString().split('T')[0], label: 'tomorrow' };
  }
  if (lower.includes('yesterday')) {
    const today = new Date(todayStr + 'T12:00:00');
    const yesterday = new Date(today.getTime() - 86400000);
    return { type: 'day', dateStr: yesterday.toISOString().split('T')[0], label: 'yesterday' };
  }
  if (lower.includes('next week')) {
    const today = new Date(todayStr + 'T12:00:00');
    const nextWeekDate = new Date(today.getTime() + 7 * 86400000);
    return { type: 'week', weekStr: getIsoWeekString(nextWeekDate), label: 'next week' };
  }
  if (lower.includes('this week') || lower.includes('week')) {
    const today = new Date(todayStr + 'T12:00:00');
    return { type: 'week', weekStr: getIsoWeekString(today), label: 'this week' };
  }

  // Default to today
  return { type: 'day', dateStr: todayStr, label: 'today' };
}
