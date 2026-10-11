import { formatWeekDateRange } from '../healthepro';

/**
 * Builds APL Datasource for a weekly menu.
 */
export function buildWeeklyAplDatasource(
  weekResult: any,
  baseUrl: string = 'https://vasd-lunch.vercel.app'
): any {
  let weekLabel = weekResult.week || 'Weekly Forecast';
  const match = weekLabel.match(/(\d{4}-W\d{2})/i);
  if (match) {
    weekLabel = formatWeekDateRange(match[1]);
  }
  const days = (weekResult.days || []).map((d: any) => {
    let dayOfWeek = 'Weekday';
    let dateText = d.date;
    try {
      const dt = new Date(d.date + 'T12:00:00Z');
      dayOfWeek = dt.toLocaleDateString('en-US', { weekday: 'long' });
      dateText = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {}

    const entree =
      d.specialEntrees?.[0] ||
      d.lunch?.specialEntrees?.[0] ||
      d.breakfast?.specialEntrees?.[0] ||
      (d.hasSchool ? 'School Meal' : 'No School');

    const secText = d.breakfast?.specialEntrees?.[0]
      ? `Breakfast: ${d.breakfast.specialEntrees[0]}`
      : d.sides?.[0] || '';

    const img = d.heroImage || d.lunch?.heroImage || `${baseUrl}/paw-logo.png`;

    return {
      dayOfWeek,
      dateText,
      entreeName: entree,
      secondaryText: secText,
      imageUrl: img,
    };
  });

  return {
    weeklyData: {
      logoUrl: `${baseUrl}/paw-logo.png`,
      schoolLevel: weekResult.levelName || 'Verona Area Schools',
      weekLabel,
      days,
      attributionText: 'Health-e Pro 🍏',
      attributionLogoUrl: 'https://menus.healthepro.com/build/assets/health-e-pro-logo-BhLpsEAS.png',
    },
  };
}
