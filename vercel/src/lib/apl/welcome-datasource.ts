import { LunchLevel, MealType } from '../types';
import { LEVEL_CONFIG } from '../healthepro';

export interface WelcomeAplDatasourceOptions {
  step?: 'splash' | 'school' | 'meal' | 'date';
  schoolLevel?: LunchLevel;
  mealType?: MealType;
  baseUrl?: string;
}

/**
 * Builds APL Datasource for the Guided Setup Wizard.
 */
export function buildWelcomeAplDatasource({
  step,
  schoolLevel,
  mealType,
  baseUrl = 'https://vasd-lunch.vercel.app',
}: WelcomeAplDatasourceOptions = {}): any {
  const d = new Date();
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
      title: 'Verona Area School District',
      logoUrl: `${baseUrl}/paw-logo.png`,
      todayDateText,
      tomorrowDateText,
      selectedLevel: schoolLevel || 'ES',
      selectedLevelName: levelName,
      selectedMeal: mealType || 'lunch',
      selectedMealTitle: mealTitle,
    },
  };
}
