import { LunchLevel, MealType } from '../types';
import { LEVEL_CONFIG } from '../healthepro';

export interface WelcomeAplDatasourceOptions {
  step?: 'splash' | 'school' | 'meal' | 'date';
  schoolLevel?: LunchLevel;
  mealType?: MealType;
  baseUrl?: string;
  isWeekend?: boolean;
  nextSchoolDayDateStr?: string;
  nextSchoolDayDateText?: string;
  weekDateText?: string;
}

/**
 * Builds APL Datasource for the Guided Setup Wizard.
 */
export function buildWelcomeAplDatasource({
  step,
  schoolLevel,
  mealType,
  baseUrl = 'https://vasd-lunch.vercel.app',
  isWeekend: explicitIsWeekend,
  nextSchoolDayDateStr,
  nextSchoolDayDateText,
  weekDateText,
}: WelcomeAplDatasourceOptions = {}): any {
  const d = new Date();
  const dow = d.getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = explicitIsWeekend !== undefined ? explicitIsWeekend : (dow === 0 || dow === 6);

  const todayDateText = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const tomorrow = new Date(d);
  tomorrow.setDate(d.getDate() + 1);
  const tomorrowDateText = tomorrow.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate next school day text
  let resolvedNextSchoolDayDateText = nextSchoolDayDateText;
  if (!resolvedNextSchoolDayDateText) {
    if (nextSchoolDayDateStr) {
      const nd = new Date(nextSchoolDayDateStr + 'T12:00:00');
      resolvedNextSchoolDayDateText = nd.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } else {
      // Default: upcoming Monday
      const daysUntilMon = dow === 0 ? 1 : dow === 6 ? 2 : (8 - dow);
      const nextMon = new Date(d);
      nextMon.setDate(d.getDate() + daysUntilMon);
      resolvedNextSchoolDayDateText = nextMon.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  // Calculate week date range text (e.g. "Oct 12-16")
  let resolvedWeekDateText = weekDateText;
  if (!resolvedWeekDateText) {
    const daysUntilMon = isWeekend ? (dow === 0 ? 1 : 2) : 0;
    const mon = new Date(d);
    mon.setDate(d.getDate() + daysUntilMon);
    const fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);

    const monMonth = mon.toLocaleDateString('en-US', { month: 'short' });
    const friMonth = fri.toLocaleDateString('en-US', { month: 'short' });
    if (monMonth === friMonth) {
      resolvedWeekDateText = `${monMonth} ${mon.getDate()}-${fri.getDate()}`;
    } else {
      resolvedWeekDateText = `${monMonth} ${mon.getDate()} – ${friMonth} ${fri.getDate()}`;
    }
  }

  // Calculate initial page based on requested step
  let initialPage = 0;
  let showSplash = true;

  if (step === 'school') {
    initialPage = 1;
    showSplash = false;
  } else if (step === 'meal') {
    initialPage = 2;
    showSplash = false;
  } else if (step === 'date') {
    initialPage = 3;
    showSplash = false;
  }

  const levelName = schoolLevel ? LEVEL_CONFIG[schoolLevel]?.name || 'Verona Schools' : 'Verona Schools';
  const mealTitle =
    mealType === 'breakfast' ? 'Breakfast' : mealType === 'both' ? 'Both Meals' : 'Lunch';

  return {
    wizardData: {
      initialPage,
      showSplash,
      isWeekend,
      title: 'Verona Area School District',
      logoUrl: `${baseUrl}/paw-logo.png`,
      todayDateText,
      tomorrowDateText,
      nextSchoolDayDateStr: nextSchoolDayDateStr || '',
      nextSchoolDayDateText: resolvedNextSchoolDayDateText,
      weekDateText: resolvedWeekDateText,
      selectedLevel: schoolLevel || 'ES',
      selectedLevelName: levelName,
      selectedMeal: mealType || 'lunch',
      selectedMealTitle: mealTitle,
    },
  };
}
