import { GoogleGenerativeAI } from '@google/generative-ai';
import { LunchDayData } from './types';
import { getTodayDateStr } from './cache';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

function getDateRelativeLabel(dateStr: string): { label: string; dateFormatted: string; isPast: boolean } {
  const todayStr = getTodayDateStr();
  const dateObj = new Date(dateStr + 'T12:00:00');
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const today = new Date(todayStr + 'T12:00:00');
  const diffDays = Math.round((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Today', dateFormatted, isPast: false };
  if (diffDays === 1) return { label: 'Tomorrow', dateFormatted, isPast: false };
  if (diffDays === -1) return { label: 'Yesterday', dateFormatted, isPast: true };
  if (diffDays < 0) return { label: `On ${dateFormatted}`, dateFormatted, isPast: true };
  return { label: `On ${dateFormatted}`, dateFormatted, isPast: false };
}

export async function generateLunchSummary(dayData: LunchDayData): Promise<{ speechText: string; summary: string }> {
  const { levelName, date, hasSchool, specialEntrees, sides, treats } = dayData;
  const { label, dateFormatted, isPast } = getDateRelativeLabel(date);

  if (!hasSchool || (specialEntrees.length === 0 && sides.length === 0 && treats.length === 0)) {
    const verb = isPast ? 'was' : 'is';
    const noSchoolText = `There ${verb} no school lunch scheduled for ${levelName} on ${dateFormatted}.`;
    return {
      speechText: noSchoolText,
      summary: noSchoolText,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Using template-based fallback summary.');
    return generateFallbackSummary(dayData, label, dateFormatted, isPast);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    });

    const prompt = `
You are an assistant preparing a short, spoken school lunch announcement for Amazon Alexa.
Target Audience: Parents and students listening to Alexa smart speaker.
School Level: ${levelName}
Date: ${dateFormatted} (${label})
Is Past Date: ${isPast}

Here are the lunch options:
- Featured Hot Specials: ${specialEntrees.length > 0 ? specialEntrees.join(', ') : 'None listed'}
- Featured Sides: ${sides.length > 0 ? sides.join(', ') : 'Standard sides'}
- Special Treats / Desserts: ${treats.length > 0 ? treats.join(', ') : 'None'}

Instructions:
1. Provide a friendly, natural 2-to-3 sentence spoken summary of lunch for ${label.toLowerCase()}.
2. If it is past (yesterday), use past tense (e.g. "Yesterday for elementary lunch, the main hot entree was...").
3. If it is today, say "Today for...". If tomorrow, say "Tomorrow for...". If another day in the future, say "${label} for...". NEVER say "Today" unless the target date is actually today.
4. Focus ONLY on the special rotating hot entrees and any special treats.
5. DO NOT mention everyday staples like milk cartons, routine salad bar items, or daily cold wraps unless they are the only items.
6. DO NOT use markdown, bullet points, asterisks (*), hashtags, or special characters. It will be read aloud by Alexa Text-to-Speech.
`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();

    // Clean up any stray markdown formatting that would sound weird on voice assistants
    speechText = speechText.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();

    return {
      speechText,
      summary: speechText,
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to rule-based summary:', error);
    return generateFallbackSummary(dayData, label, dateFormatted, isPast);
  }
}

function generateFallbackSummary(
  dayData: LunchDayData,
  label: string,
  dateFormatted: string,
  isPast: boolean
): { speechText: string; summary: string } {
  const { levelName, specialEntrees, treats, sides } = dayData;
  const verbIs = isPast ? 'was' : 'is';
  const verbInclude = isPast ? 'included' : 'include';

  const parts: string[] = [];

  if (specialEntrees.length > 0) {
    if (specialEntrees.length === 1) {
      parts.push(`the main hot entree ${verbIs} ${specialEntrees[0]}`);
    } else if (specialEntrees.length === 2) {
      parts.push(`featured entrees ${verbInclude} ${specialEntrees[0]} or ${specialEntrees[1]}`);
    } else {
      const firstTwo = specialEntrees.slice(0, 2).join(' and ');
      parts.push(`featured entrees ${verbInclude} ${firstTwo}, among other choices`);
    }
  }

  if (treats.length > 0) {
    parts.push(`with a special treat of ${treats.join(' and ')}`);
  } else if (sides.length > 0) {
    parts.push(`accompanied by ${sides[0]}`);
  }

  const prefix = label.startsWith('On ') ? `${label} for ${levelName} lunch` : `${label} for ${levelName} lunch`;

  const speechText = parts.length > 0
    ? `${prefix}, ${parts.join(', ')}.`
    : `${prefix}, standard lunch options are available.`;

  return {
    speechText,
    summary: speechText,
  };
}

export async function generateWeeklyLunchSummary(
  levelName: string,
  days: LunchDayData[],
  weekLabel: string = 'this week'
): Promise<{ speechText: string; summary: string }> {
  if (!days || days.length === 0) {
    const text = `No lunch menu information is available for ${levelName} for that week.`;
    return { speechText: text, summary: text };
  }

  // Format each day's brief description
  const dayDescriptions = days.map(d => {
    const dateObj = new Date(d.date + 'T12:00:00');
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (!d.hasSchool || (d.specialEntrees.length === 0 && d.sides.length === 0)) {
      return `${weekday}: No school scheduled`;
    }
    const entree = d.specialEntrees.length > 0 ? d.specialEntrees.join(' or ') : 'Standard lunch';
    const treat = d.treats.length > 0 ? ` with ${d.treats[0]}` : '';
    return `${weekday}: ${entree}${treat}`;
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackWeeklySummary(levelName, days, weekLabel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.3,
      },
    });

    const prompt = `
You are an assistant preparing a spoken weekly school lunch summary for Amazon Alexa.
Target Audience: Parents and students listening to Alexa smart speaker.
School Level: ${levelName}
Timeframe: ${weekLabel}

Here are the lunch options for Monday through Friday:
${dayDescriptions.join('\n')}

Instructions:
1. Provide a concise, clear, and friendly spoken summary of the entire week (approximately 3 to 5 sentences).
2. Start by introducing the timeframe: "Here is ${weekLabel}'s lunch menu for ${levelName}."
3. Go day by day from Monday to Friday, stating the main featured hot entree. If a day has no school, mention that there is no school that day.
4. DO NOT mention sides, condiments, or milk.
5. DO NOT use markdown, bullet points, asterisks (*), hashtags, or special characters. It will be read aloud by Alexa Text-to-Speech.
6. Example phrasing: "Here is ${weekLabel}'s lunch menu for elementary school. On Monday, the main entree is Pizza Bites. Tuesday features Chicken Nuggets. Wednesday is Cheese Pizza. Thursday is Hot Dogs, and on Friday the entree is Macaroni and Cheese."
`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();
    speechText = speechText.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();

    return {
      speechText,
      summary: speechText,
    };
  } catch (err) {
    console.error('Gemini weekly summary failed, using fallback:', err);
    return generateFallbackWeeklySummary(levelName, days, weekLabel);
  }
}

function generateFallbackWeeklySummary(
  levelName: string,
  days: LunchDayData[],
  weekLabel: string = 'this week'
): { speechText: string; summary: string } {
  const daySentences = days.map(d => {
    const dateObj = new Date(d.date + 'T12:00:00');
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (!d.hasSchool || (d.specialEntrees.length === 0 && d.sides.length === 0)) {
      return `on ${weekday}, there is no school`;
    }
    const entree = d.specialEntrees.length > 0 ? d.specialEntrees.join(' or ') : 'standard lunch options';
    return `on ${weekday}, ${entree}`;
  });

  const speechText = `Here is ${weekLabel}'s lunch menu for ${levelName}: ${daySentences.join('; ')}.`;
  return { speechText, summary: speechText };
}

export async function generateBreakfastSummary(dayData: LunchDayData): Promise<{ speechText: string; summary: string }> {
  const { levelName, date, hasSchool, specialEntrees, sides, treats } = dayData;
  const { label, dateFormatted, isPast } = getDateRelativeLabel(date);

  if (!hasSchool || (specialEntrees.length === 0 && sides.length === 0 && treats.length === 0)) {
    const verb = isPast ? 'was' : 'is';
    const noSchoolText = `There ${verb} no school breakfast scheduled for ${levelName} on ${dateFormatted}.`;
    return {
      speechText: noSchoolText,
      summary: noSchoolText,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. Using template-based fallback summary.');
    return generateFallbackBreakfastSummary(dayData, label, dateFormatted, isPast);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    });

    const prompt = `
You are an assistant preparing a short, spoken school breakfast announcement for Amazon Alexa.
Target Audience: Parents and students listening to Alexa smart speaker.
School Level: ${levelName}
Date: ${dateFormatted} (${label})
Is Past Date: ${isPast}

Breakfast items:
- Entrees: ${specialEntrees.length > 0 ? specialEntrees.join(', ') : 'Standard breakfast options'}
- Fruit / Sides: ${sides.length > 0 ? sides.join(', ') : 'Standard fruit and sides'}
- Treats: ${treats.length > 0 ? treats.join(', ') : 'None'}

Instructions:
1. Provide a friendly, natural 2-to-3 sentence spoken summary of breakfast for ${label.toLowerCase()}.
2. If it is past (yesterday), use past tense (e.g. "Yesterday for elementary breakfast, students had...").
3. If it is today, say "Today for...". If tomorrow, say "Tomorrow for...". If another day in the future, say "${label} for...". NEVER say "Today" unless the target date is actually today.
4. Focus on the main rotating breakfast entrees (like muffins, pancakes, breakfast bars, or cereals) and featured fruit.
5. DO NOT mention everyday staples like plain milk cartons or butter.
6. DO NOT use markdown, bullet points, asterisks (*), hashtags, or special characters. It will be read aloud by Alexa Text-to-Speech.
`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();
    speechText = speechText.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();

    return {
      speechText,
      summary: speechText,
    };
  } catch (error) {
    console.error('Gemini breakfast summary failed, falling back:', error);
    return generateFallbackBreakfastSummary(dayData, label, dateFormatted, isPast);
  }
}

function generateFallbackBreakfastSummary(
  dayData: LunchDayData,
  label: string,
  dateFormatted: string,
  isPast: boolean
): { speechText: string; summary: string } {
  const { levelName, specialEntrees, sides } = dayData;
  const verbIs = isPast ? 'was' : 'is';
  const prefix = label.startsWith('On ') ? `${label} for ${levelName} breakfast` : `${label} for ${levelName} breakfast`;

  let speechText = `${prefix}, `;
  if (specialEntrees.length > 0) {
    speechText += `the entree ${verbIs} ${specialEntrees.slice(0, 2).join(' or ')}`;
    if (sides.length > 0) {
      speechText += ` with ${sides[0]}.`;
    } else {
      speechText += '.';
    }
  } else {
    speechText += 'standard breakfast options are available.';
  }

  return { speechText, summary: speechText };
}

export async function generateCombinedMenuSummary(
  breakfastData: LunchDayData,
  lunchData: LunchDayData
): Promise<{ speechText: string; summary: string }> {
  const { levelName, date } = lunchData;
  const { label, dateFormatted, isPast } = getDateRelativeLabel(date);

  const hasSchool = breakfastData.hasSchool || lunchData.hasSchool;
  if (!hasSchool) {
    const verb = isPast ? 'was' : 'is';
    const noSchoolText = `There ${verb} no school meals scheduled for ${levelName} on ${dateFormatted}.`;
    return {
      speechText: noSchoolText,
      summary: noSchoolText,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackCombinedSummary(breakfastData, lunchData, label, dateFormatted, isPast);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.3,
      },
    });

    const prompt = `
You are an assistant preparing a short, spoken school menu announcement for Amazon Alexa covering BOTH breakfast and lunch.
Target Audience: Parents and students listening to Alexa smart speaker.
School Level: ${levelName}
Date: ${dateFormatted} (${label})
Is Past Date: ${isPast}

Breakfast items:
- Entrees: ${breakfastData.specialEntrees.length > 0 ? breakfastData.specialEntrees.join(', ') : 'None listed'}
- Fruit / Sides: ${breakfastData.sides.length > 0 ? breakfastData.sides.join(', ') : 'Standard sides'}

Lunch items:
- Featured Hot Specials: ${lunchData.specialEntrees.length > 0 ? lunchData.specialEntrees.join(', ') : 'None listed'}
- Featured Sides: ${lunchData.sides.length > 0 ? lunchData.sides.join(', ') : 'Standard sides'}
- Special Treats: ${lunchData.treats.length > 0 ? lunchData.treats.join(', ') : 'None'}

Instructions:
1. Provide a friendly, concise, natural 3-to-4 sentence spoken summary covering both breakfast and lunch.
2. Structure: Start with the timeframe and school level, mention what is for breakfast, and then what is for lunch.
3. If it is past, use past tense. If today, say "Today for...". If tomorrow, say "Tomorrow for...". If another day in the future, say "${label} for...". NEVER say "Today" unless the target date is actually today.
4. Focus only on the featured rotating entrees and special treats. DO NOT mention plain milk cartons or common condiments.
5. DO NOT use markdown, bullet points, asterisks (*), hashtags, or special characters. It will be read aloud by Alexa Text-to-Speech.
6. Example: "Tomorrow for elementary school, breakfast features a Birthday Cake Bar with dried cranberries and juice. For lunch, the hot special is mini corn dogs served with vegetarian baked beans and a dragon punch juice box."
`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();
    speechText = speechText.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();

    return {
      speechText,
      summary: speechText,
    };
  } catch (error) {
    console.error('Gemini combined summary failed, falling back:', error);
    return generateFallbackCombinedSummary(breakfastData, lunchData, label, dateFormatted, isPast);
  }
}

function generateFallbackCombinedSummary(
  breakfastData: LunchDayData,
  lunchData: LunchDayData,
  label: string,
  dateFormatted: string,
  isPast: boolean
): { speechText: string; summary: string } {
  const b = generateFallbackBreakfastSummary(breakfastData, label, dateFormatted, isPast);
  const l = generateFallbackSummary(lunchData, label, dateFormatted, isPast);
  const speechText = `${b.speechText} ${l.speechText}`;
  return { speechText, summary: speechText };
}

export async function generateWeeklyCombinedSummary(
  levelName: string,
  breakfastDays: LunchDayData[],
  lunchDays: LunchDayData[],
  weekLabel: string = 'this week'
): Promise<{ speechText: string; summary: string }> {
  const dayDescriptions = lunchDays.map((ld, i) => {
    const bd = breakfastDays[i] || ld;
    const dateObj = new Date(ld.date + 'T12:00:00');
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (!ld.hasSchool && !bd.hasSchool) {
      return `${weekday}: No school scheduled`;
    }
    const bEntree = bd.specialEntrees.length > 0 ? bd.specialEntrees[0] : 'Standard breakfast';
    const lEntree = ld.specialEntrees.length > 0 ? ld.specialEntrees[0] : 'Standard lunch';
    return `${weekday}: Breakfast is ${bEntree}; Lunch is ${lEntree}`;
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const speechText = `Here is ${weekLabel}'s menu for ${levelName}: ${dayDescriptions.join('. ')}.`;
    return { speechText, summary: speechText };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
    });

    const prompt = `
You are an assistant preparing a spoken weekly school menu summary for Amazon Alexa covering both breakfast and lunch.
Target Audience: Parents and students listening to Alexa smart speaker.
School Level: ${levelName}
Timeframe: ${weekLabel}

Options Monday through Friday:
${dayDescriptions.join('\n')}

Instructions:
1. Provide a concise, clear 4-to-5 sentence spoken summary of the entire week covering both breakfast and lunch.
2. Start: "Here is ${weekLabel}'s menu for ${levelName}."
3. Mention Monday through Friday concisely (e.g. "On Monday, breakfast is ... and lunch is ...").
4. DO NOT mention sides, milk, or condiments.
5. DO NOT use markdown or special characters.
`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();
    speechText = speechText.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();
    return { speechText, summary: speechText };
  } catch (err) {
    const speechText = `Here is ${weekLabel}'s menu for ${levelName}: ${dayDescriptions.join('. ')}.`;
    return { speechText, summary: speechText };
  }
}

