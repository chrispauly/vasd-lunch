export type LunchLevel = 'ES' | 'MS' | 'HS';

export type MealType = 'breakfast' | 'lunch' | 'both';

export interface LunchItem {
  name: string;
  category: string;
  isStaple?: boolean;
  imageUrl?: string | null;
  allergens?: string[];
}

export interface LunchDayData {
  date: string;
  level: LunchLevel;
  levelName: string;
  mealType?: 'breakfast' | 'lunch';
  entrees: string[];
  stapleEntrees: string[];
  specialEntrees: string[];
  sides: string[];
  treats: string[];
  rawItems: LunchItem[];
  hasSchool: boolean;
  heroImage?: string | null;
  itemsWithImages?: LunchItem[];
}

export interface LunchSummaryResult {
  date: string;
  level: LunchLevel;
  levelName: string;
  mealType?: MealType;
  type?: 'day' | 'week';
  speechText: string;
  summary: string;
  cached: boolean;
  generatedAt: string;
  schoolClosed?: boolean;
  heroImage?: string | null;
  items?: LunchItem[];
  details: {
    specialEntrees: string[];
    sides: string[];
    treats: string[];
    stapleEntrees: string[];
    heroImage?: string | null;
    items?: LunchItem[];
  };
  breakfast?: {
    specialEntrees: string[];
    sides: string[];
    treats: string[];
    stapleEntrees: string[];
    heroImage?: string | null;
    items?: LunchItem[];
  };
  lunch?: {
    specialEntrees: string[];
    sides: string[];
    treats: string[];
    stapleEntrees: string[];
    heroImage?: string | null;
    items?: LunchItem[];
  };
  days?: Array<{
    date: string;
    dayOfWeek: string;
    summary: string;
    heroImage?: string | null;
    breakfast?: { specialEntrees: string[]; heroImage?: string | null };
    lunch?: { specialEntrees: string[]; heroImage?: string | null };
  }>;
}

export interface AlexaFlashBriefingItem {
  uid: string;
  updateDate: string;
  titleText: string;
  mainText: string;
  redirectionUrl: string;
}
