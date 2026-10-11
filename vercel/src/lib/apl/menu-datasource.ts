import { LunchLevel, LunchSummaryResult } from '../types';
import { VASD_PAW_LOGO } from './styles';

/**
 * Mapping of schools for each school level in Verona Area School District.
 */
export const LEVEL_SCHOOLS: Record<LunchLevel, { title: string; schools: string; footerText: string }> = {
  ES: {
    title: 'Elementary Schools',
    schools: 'Sugar Creek • Stoner Prairie • Glacier Edge • Country View • VAIS • Core Knowledge (CKCS)',
    footerText: 'Elementary Schools (K-5): Sugar Creek • Stoner Prairie • Glacier Edge • Country View • VAIS • Core Knowledge (CKCS)',
  },
  MS: {
    title: 'Middle Schools',
    schools: 'Badger Ridge Middle School • Core Knowledge (CKCS)',
    footerText: 'Middle Schools (6-8): Badger Ridge Middle School • Core Knowledge (CKCS)',
  },
  HS: {
    title: 'High School',
    schools: 'Verona Area High School (VAHS)',
    footerText: 'High School (9-12): Verona Area High School (VAHS)',
  },
};

/**
 * Builds APL Datasource for the School Menu & Image Gallery.
 */
export function buildMenuAplDatasource(
  result: LunchSummaryResult,
  baseUrl: string = 'https://vasd-lunch.vercel.app'
): any {
  const mealTitle =
    result.mealType === 'breakfast'
      ? 'Breakfast Menu'
      : result.mealType === 'both'
      ? 'Breakfast & Lunch'
      : 'Lunch Menu';

  const logoUrl = `${baseUrl}/paw-logo.png`;

  // Hero Item
  const heroImg = result.heroImage || VASD_PAW_LOGO;
  const primaryEntreeName =
    result.details.specialEntrees[0] ||
    (result.mealType === 'both' && result.lunch?.specialEntrees[0]) ||
    'School Meal';

  const heroItem = {
    name: primaryEntreeName,
    category: result.mealType === 'breakfast' ? 'Breakfast Entrée' : 'Main Hot Entrée',
    imageUrl: heroImg,
    allergens: '',
  };

  // Transform all items with real photos
  const rawItems = result.items || [];
  const allItems = rawItems.map((it) => ({
    name: it.name,
    category: it.category || 'Menu Item',
    imageUrl: it.imageUrl || VASD_PAW_LOGO,
    allergens: (it.allergens || []).join(', '),
  }));

  // If no items list was generated, fallback to text lists
  if (allItems.length === 0) {
    for (const name of result.details.specialEntrees) {
      allItems.push({
        name,
        category: 'Entrée',
        imageUrl: heroImg,
        allergens: '',
      });
    }
    for (const name of result.details.sides) {
      allItems.push({
        name,
        category: 'Side',
        imageUrl: VASD_PAW_LOGO,
        allergens: '',
      });
    }
  }

  // Group items into courses
  const entrees: Array<{ name: string; category: string; allergens: string }> = [];
  const sides: Array<{ name: string; category: string; allergens: string }> = [];
  const fruits: Array<{ name: string; category: string; allergens: string }> = [];
  const staples: Array<{ name: string; category: string; allergens: string }> = [];

  for (const item of allItems) {
    const catLower = (item.category || '').toLowerCase();
    const nameLower = (item.name || '').toLowerCase();

    if (catLower.includes('entrée') || catLower.includes('entree') || catLower.includes('main')) {
      entrees.push({ name: item.name, category: item.category, allergens: item.allergens });
    } else if (
      catLower.includes('fruit') ||
      catLower.includes('juice') ||
      nameLower.includes('juice') ||
      nameLower.includes('apple') ||
      nameLower.includes('fruit')
    ) {
      fruits.push({ name: item.name, category: item.category, allergens: item.allergens });
    } else if (catLower.includes('milk') || catLower.includes('beverage') || nameLower.includes('milk')) {
      staples.push({ name: item.name, category: item.category, allergens: item.allergens });
    } else {
      sides.push({ name: item.name, category: item.category, allergens: item.allergens });
    }
  }

  // Ensure entrees is never empty
  if (entrees.length === 0) {
    for (const name of result.details.specialEntrees) {
      entrees.push({ name, category: 'Entrée', allergens: '' });
    }
  }

  // Ensure sides is never empty
  if (sides.length === 0 && result.details.sides.length > 0) {
    for (const name of result.details.sides) {
      sides.push({ name, category: 'Vegetable/Side', allergens: '' });
    }
  }

  // Default staples if empty
  if (staples.length === 0) {
    staples.push(
      { name: '1% White Milk', category: 'Dairy', allergens: 'Milk' },
      { name: 'Fat-Free Chocolate Milk', category: 'Dairy', allergens: 'Milk' }
    );
  }

  // Format date readable
  let dateText = result.date;
  try {
    const d = new Date(result.date + 'T12:00:00Z');
    dateText = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    // keep raw date
  }

  const schoolConfig = LEVEL_SCHOOLS[result.level || 'ES'] || LEVEL_SCHOOLS.ES;

  return {
    menuData: {
      title: 'Verona Area School District',
      schoolLevel: result.levelName,
      currentLevel: result.level || 'ES',
      schoolsListText: schoolConfig.schools,
      schoolsFooterText: schoolConfig.footerText,
      mealTypeTitle: mealTitle,
      currentMealType: result.mealType || 'lunch',
      dateText,
      logoUrl,
      heroItem,
      courses: {
        entrees,
        sides,
        fruits,
        staples,
      },
      allItems,
      itemCountText: `${allItems.length} items on today's menu`,
      summarySnippet: result.summary,
      attributionText: 'Health-e Pro 🍏',
      attributionLogoUrl: 'https://menus.healthepro.com/build/assets/health-e-pro-logo-BhLpsEAS.png',
    },
  };
}
