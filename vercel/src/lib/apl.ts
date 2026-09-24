import { LunchSummaryResult } from './types';

const FALLBACK_FOOD_IMG = 'https://vasd-lunch.vercel.app/paw-logo.png';
const VASD_PAW_LOGO = 'https://vasd-lunch.vercel.app/paw-logo.png';

/**
 * Returns responsive APL Document for Day Menus
 * Adapts seamlessly across:
 * - Hub Small / Round (Echo Show 5, Echo Spot)
 * - Hub Medium (Echo Show 8)
 * - Hub Large / Extra Large / TV (Echo Show 10, Echo Show 15, Fire TV)
 */
export function buildMenuAplDocument(): any {
  return {
    type: 'APL',
    version: '2023.3',
    import: [
      {
        name: 'alexa-layouts',
        version: '1.7.0',
      },
    ],
    theme: 'dark',
    styles: {
      textTitle: {
        values: [
          {
            color: '#F8FAFC',
            fontFamily: 'Amazon Ember, sans-serif',
            fontWeight: '700',
          },
        ],
      },
      textSubtitle: {
        values: [
          {
            color: '#F97316',
            fontFamily: 'Amazon Ember, sans-serif',
            fontWeight: '600',
          },
        ],
      },
      textBody: {
        values: [
          {
            color: '#94A3B8',
            fontFamily: 'Amazon Ember, sans-serif',
            fontWeight: '400',
          },
        ],
      },
    },
    mainTemplate: {
      parameters: ['payload'],
      items: [
        {
          type: 'Container',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#090D16',
          items: [
            // ==========================================
            // 1. SMALL VIEWPORT (Echo Show 5, Echo Spot)
            // ==========================================
            {
              type: 'Container',
              when: '${@viewportProfile == "@hubSmall" || @viewportProfile == "@hubRound" || viewport.pixelWidth < 1000}',
              width: '100%',
              height: '100%',
              direction: 'row',
              paddingLeft: '24dp',
              paddingRight: '24dp',
              paddingTop: '20dp',
              paddingBottom: '20dp',
              items: [
                // Left Column: Text & Badges
                {
                  type: 'Container',
                  width: '58%',
                  height: '100%',
                  justifyContent: 'space-between',
                  items: [
                    {
                      type: 'Container',
                      items: [
                        {
                          type: 'Container',
                          direction: 'row',
                          alignItems: 'center',
                          items: [
                            {
                              type: 'Image',
                              source: '${payload.menuData.logoUrl}',
                              width: '28dp',
                              height: '28dp',
                              marginRight: '8dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.schoolLevel} • ${payload.menuData.mealTypeTitle}',
                              style: 'textSubtitle',
                              fontSize: '15dp',
                              maxLines: 1,
                            },
                          ],
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.dateText}',
                          style: 'textBody',
                          fontSize: '13dp',
                          marginTop: '2dp',
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.heroItem.name}',
                          style: 'textTitle',
                          fontSize: '24dp',
                          maxLines: 2,
                          marginTop: '10dp',
                        },
                        {
                          type: 'Text',
                          when: '${payload.menuData.heroItem.category != ""}',
                          text: '${payload.menuData.heroItem.category}',
                          color: '#F97316',
                          fontSize: '13dp',
                          fontWeight: '600',
                          marginTop: '4dp',
                        },
                      ],
                    },
                    // Bottom Badge
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      backgroundColor: '#1E293B',
                      borderRadius: '8dp',
                      paddingLeft: '10dp',
                      paddingRight: '10dp',
                      paddingTop: '4dp',
                      paddingBottom: '4dp',
                      alignSelf: 'flex-start',
                      items: [
                        {
                          type: 'Text',
                          text: '${payload.menuData.itemCountText}',
                          color: '#CBD5E1',
                          fontSize: '12dp',
                        },
                      ],
                    },
                  ],
                },
                // Right Column: Hero Image
                {
                  type: 'Container',
                  width: '42%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.menuData.heroItem.imageUrl}',
                      width: '100%',
                      height: '85%',
                      scale: 'best-fill',
                      borderRadius: '16dp',
                      overlayColor: 'rgba(0,0,0,0.1)',
                    },
                  ],
                },
              ],
            },

            // ==========================================
            // 2. MEDIUM VIEWPORT (Echo Show 8)
            // ==========================================
            {
              type: 'Container',
              when: '${@viewportProfile == "@hubMedium" || (viewport.pixelWidth >= 1000 && viewport.pixelWidth < 1600 && viewport.pixelHeight < 1000)}',
              width: '100%',
              height: '100%',
              paddingLeft: '32dp',
              paddingRight: '32dp',
              paddingTop: '24dp',
              paddingBottom: '24dp',
              items: [
                // Top Header
                {
                  type: 'Container',
                  direction: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '44dp',
                  items: [
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      items: [
                        {
                          type: 'Image',
                          source: '${payload.menuData.logoUrl}',
                          width: '36dp',
                          height: '36dp',
                          marginRight: '12dp',
                        },
                        {
                          type: 'Text',
                          text: 'Verona Area School District',
                          style: 'textTitle',
                          fontSize: '20dp',
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(234, 88, 12, 0.15)',
                      borderRadius: '12dp',
                      paddingLeft: '14dp',
                      paddingRight: '14dp',
                      paddingTop: '6dp',
                      paddingBottom: '6dp',
                      items: [
                        {
                          type: 'Text',
                          text: '${payload.menuData.schoolLevel} • ${payload.menuData.mealTypeTitle}',
                          color: '#F97316',
                          fontWeight: '700',
                          fontSize: '14dp',
                        },
                      ],
                    },
                  ],
                },

                // Split Body
                {
                  type: 'Container',
                  direction: 'row',
                  width: '100%',
                  height: 'calc(100% - 48dp)',
                  marginTop: '12dp',
                  items: [
                    // Left Column: Featured Main Course Card
                    {
                      type: 'Container',
                      width: '40%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '20dp',
                      padding: '20dp',
                      marginRight: '20dp',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Image',
                              source: '${payload.menuData.heroItem.imageUrl}',
                              width: '100%',
                              height: '240dp',
                              scale: 'best-fill',
                              borderRadius: '14dp',
                            },
                            {
                              type: 'Container',
                              direction: 'row',
                              marginTop: '12dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'FEATURED ENTRÉE',
                                  color: '#F97316',
                                  fontSize: '12dp',
                                  fontWeight: '800',
                                  letterSpacing: '1dp',
                                },
                              ],
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.heroItem.name}',
                              style: 'textTitle',
                              fontSize: '24dp',
                              maxLines: 2,
                              marginTop: '4dp',
                            },
                            {
                              type: 'Text',
                              when: '${payload.menuData.heroItem.allergens != ""}',
                              text: 'Allergens: ${payload.menuData.heroItem.allergens}',
                              style: 'textBody',
                              fontSize: '13dp',
                              marginTop: '6dp',
                            },
                          ],
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.dateText}',
                          color: '#64748B',
                          fontSize: '13dp',
                        },
                      ],
                    },

                    // Right Column: Scrollable List of All Items
                    {
                      type: 'Container',
                      width: '60%',
                      height: '100%',
                      items: [
                        {
                          type: 'Container',
                          direction: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'All Menu Items (Touch to scroll)',
                              style: 'textTitle',
                              fontSize: '18dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.itemCountText}',
                              style: 'textBody',
                              fontSize: '13dp',
                            },
                          ],
                        },
                        {
                          type: 'Sequence',
                          scrollDirection: 'vertical',
                          width: '100%',
                          height: 'calc(100% - 36dp)',
                          data: '${payload.menuData.allItems}',
                          items: [
                            {
                              type: 'TouchWrapper',
                              width: '100%',
                              paddingBottom: '10dp',
                              items: [
                                {
                                  type: 'Container',
                                  direction: 'row',
                                  backgroundColor: '#1E293B',
                                  borderRadius: '14dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Image',
                                      source: '${data.imageUrl}',
                                      width: '64dp',
                                      height: '64dp',
                                      borderRadius: '10dp',
                                      scale: 'best-fill',
                                      marginRight: '14dp',
                                    },
                                    {
                                      type: 'Container',
                                      width: 'calc(100% - 84dp)',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '${data.name}',
                                          style: 'textTitle',
                                          fontSize: '16dp',
                                          maxLines: 1,
                                        },
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          alignItems: 'center',
                                          marginTop: '3dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '${data.category}',
                                              color: '#F97316',
                                              fontSize: '12dp',
                                              fontWeight: '600',
                                              marginRight: '8dp',
                                            },
                                            {
                                              type: 'Text',
                                              when: '${data.allergens != ""}',
                                              text: '• ${data.allergens}',
                                              color: '#64748B',
                                              fontSize: '11dp',
                                              maxLines: 1,
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },

            // ==========================================
            // 3. LARGE / XL / TV VIEWPORT (Echo Show 10, Echo Show 15, Fire TV)
            // ==========================================
            {
              type: 'Container',
              when: '${@viewportProfile == "@hubLarge" || @viewportProfile == "@hubExtraLarge" || @viewportProfile == "@tvLandscape" || viewport.pixelWidth >= 1600 || viewport.pixelHeight >= 1000}',
              width: '100%',
              height: '100%',
              paddingLeft: '48dp',
              paddingRight: '48dp',
              paddingTop: '36dp',
              paddingBottom: '36dp',
              items: [
                // Top Header Bar
                {
                  type: 'Container',
                  direction: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '64dp',
                  marginBottom: '20dp',
                  items: [
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      items: [
                        {
                          type: 'Image',
                          source: '${payload.menuData.logoUrl}',
                          width: '54dp',
                          height: '54dp',
                          marginRight: '16dp',
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'Verona Area School District',
                              style: 'textTitle',
                              fontSize: '26dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.dateText}',
                              style: 'textBody',
                              fontSize: '16dp',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(234, 88, 12, 0.2)',
                      borderRadius: '16dp',
                      borderWidth: '1dp',
                      borderColor: '#EA580C',
                      paddingLeft: '20dp',
                      paddingRight: '20dp',
                      paddingTop: '8dp',
                      paddingBottom: '8dp',
                      items: [
                        {
                          type: 'Text',
                          text: '${payload.menuData.schoolLevel} • ${payload.menuData.mealTypeTitle}',
                          color: '#F97316',
                          fontWeight: '800',
                          fontSize: '18dp',
                        },
                      ],
                    },
                  ],
                },

                // Featured Entrée Hero Wide Banner (Top half)
                {
                  type: 'Container',
                  direction: 'row',
                  width: '100%',
                  height: '270dp',
                  backgroundColor: '#1E293B',
                  borderRadius: '24dp',
                  padding: '24dp',
                  marginBottom: '24dp',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.menuData.heroItem.imageUrl}',
                      width: '380dp',
                      height: '100%',
                      borderRadius: '18dp',
                      scale: 'best-fill',
                      marginRight: '28dp',
                    },
                    {
                      type: 'Container',
                      width: 'calc(100% - 410dp)',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Container',
                              direction: 'row',
                              alignItems: 'center',
                              marginBottom: '6dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'FEATURED MAIN COURSE',
                                  color: '#F97316',
                                  fontSize: '14dp',
                                  fontWeight: '800',
                                  letterSpacing: '1dp',
                                },
                              ],
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.heroItem.name}',
                              style: 'textTitle',
                              fontSize: '34dp',
                              maxLines: 2,
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.summarySnippet}',
                              color: '#CBD5E1',
                              fontSize: '18dp',
                              maxLines: 3,
                              marginTop: '10dp',
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          direction: 'row',
                          alignItems: 'center',
                          items: [
                            {
                              type: 'Text',
                              when: '${payload.menuData.heroItem.allergens != ""}',
                              text: 'Allergens: ${payload.menuData.heroItem.allergens}',
                              color: '#94A3B8',
                              fontSize: '14dp',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },

                // Bottom Gallery: Touch-Scrollable Horizontal Carousel
                {
                  type: 'Container',
                  width: '100%',
                  height: 'calc(100% - 380dp)',
                  items: [
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12dp',
                      items: [
                        {
                          type: 'Text',
                          text: 'Full Menu Items & Sides (Swipe or touch to explore)',
                          style: 'textTitle',
                          fontSize: '22dp',
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.itemCountText}',
                          style: 'textBody',
                          fontSize: '15dp',
                        },
                      ],
                    },
                    {
                      type: 'Sequence',
                      scrollDirection: 'horizontal',
                      width: '100%',
                      height: 'calc(100% - 38dp)',
                      data: '${payload.menuData.allItems}',
                      items: [
                        {
                          type: 'TouchWrapper',
                          width: '260dp',
                          height: '100%',
                          marginRight: '18dp',
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '14dp',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Image',
                                  source: '${data.imageUrl}',
                                  width: '100%',
                                  height: '62%',
                                  borderRadius: '14dp',
                                  scale: 'best-fill',
                                },
                                {
                                  type: 'Container',
                                  height: '35%',
                                  justifyContent: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: '${data.category}',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '700',
                                    },
                                    {
                                      type: 'Text',
                                      text: '${data.name}',
                                      style: 'textTitle',
                                      fontSize: '18dp',
                                      maxLines: 2,
                                      marginTop: '2dp',
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

/**
 * Returns responsive APL Document for Weekly Menus
 */
export function buildWeeklyAplDocument(): any {
  return {
    type: 'APL',
    version: '2023.3',
    import: [
      {
        name: 'alexa-layouts',
        version: '1.7.0',
      },
    ],
    theme: 'dark',
    styles: {
      textTitle: {
        values: [
          {
            color: '#F8FAFC',
            fontFamily: 'Amazon Ember, sans-serif',
            fontWeight: '700',
          },
        ],
      },
      textSubtitle: {
        values: [
          {
            color: '#F97316',
            fontFamily: 'Amazon Ember, sans-serif',
            fontWeight: '600',
          },
        ],
      },
    },
    mainTemplate: {
      parameters: ['payload'],
      items: [
        {
          type: 'Container',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#090D16',
          padding: '28dp',
          items: [
            // Header
            {
              type: 'Container',
              direction: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '52dp',
              marginBottom: '16dp',
              items: [
                {
                  type: 'Container',
                  direction: 'row',
                  alignItems: 'center',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.weeklyData.logoUrl}',
                      width: '40dp',
                      height: '40dp',
                      marginRight: '12dp',
                    },
                    {
                      type: 'Text',
                      text: 'Verona Area School District — Weekly Forecast',
                      style: 'textTitle',
                      fontSize: '22dp',
                    },
                  ],
                },
                {
                  type: 'Text',
                  text: '${payload.weeklyData.schoolLevel} • ${payload.weeklyData.weekLabel}',
                  color: '#F97316',
                  fontWeight: '700',
                  fontSize: '16dp',
                },
              ],
            },

            // 5-Day Sequence
            {
              type: 'Sequence',
              scrollDirection: 'horizontal',
              width: '100%',
              height: 'calc(100% - 70dp)',
              data: '${payload.weeklyData.days}',
              items: [
                {
                  type: 'TouchWrapper',
                  width: '270dp',
                  height: '100%',
                  marginRight: '18dp',
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '20dp',
                      padding: '16dp',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '${data.dayOfWeek}',
                              color: '#F97316',
                              fontSize: '16dp',
                              fontWeight: '800',
                            },
                            {
                              type: 'Text',
                              text: '${data.dateText}',
                              color: '#94A3B8',
                              fontSize: '13dp',
                              marginTop: '2dp',
                            },
                          ],
                        },
                        {
                          type: 'Image',
                          source: '${data.imageUrl}',
                          width: '100%',
                          height: '55%',
                          borderRadius: '14dp',
                          scale: 'best-fill',
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '${data.entreeName}',
                              style: 'textTitle',
                              fontSize: '18dp',
                              maxLines: 2,
                            },
                            {
                              type: 'Text',
                              when: '${data.secondaryText != ""}',
                              text: '${data.secondaryText}',
                              color: '#64748B',
                              fontSize: '12dp',
                              maxLines: 1,
                              marginTop: '2dp',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

/**
 * Builds APL Datasource for a single day menu
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
  const heroImg = result.heroImage || `${baseUrl}/paw-logo.png`;
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
    imageUrl: it.imageUrl || `${baseUrl}/paw-logo.png`,
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
        imageUrl: `${baseUrl}/paw-logo.png`,
        allergens: '',
      });
    }
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

  return {
    menuData: {
      title: 'Verona School Lunch',
      schoolLevel: result.levelName,
      mealTypeTitle: mealTitle,
      dateText,
      logoUrl,
      heroItem,
      allItems,
      itemCountText: `${allItems.length} items on today's menu`,
      summarySnippet: result.summary,
    },
  };
}

/**
 * Builds APL Datasource for a weekly menu
 */
export function buildWeeklyAplDatasource(
  weekResult: any,
  baseUrl: string = 'https://vasd-lunch.vercel.app'
): any {
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
      weekLabel: weekResult.week || 'Weekly Forecast',
      days,
    },
  };
}
