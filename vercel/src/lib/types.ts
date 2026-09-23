export type LunchLevel = 'ES' | 'MS' | 'HS';

export interface LunchItem {
  name: string;
  category: string;
  isStaple?: boolean;
}

export interface LunchDayData {
  date: string;
  level: LunchLevel;
  levelName: string;
  entrees: string[];
  stapleEntrees: string[];
  specialEntrees: string[];
  sides: string[];
  treats: string[];
  rawItems: LunchItem[];
  hasSchool: boolean;
}

export interface LunchSummaryResult {
  date: string;
  level: LunchLevel;
  levelName: string;
  speechText: string;
  summary: string;
  cached: boolean;
  generatedAt: string;
  details: {
    specialEntrees: string[];
    sides: string[];
    treats: string[];
    stapleEntrees: string[];
  };
}

export interface AlexaFlashBriefingItem {
  uid: string;
  updateDate: string;
  titleText: string;
  mainText: string;
  redirectionUrl: string;
}
