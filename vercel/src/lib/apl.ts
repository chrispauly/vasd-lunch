import { LunchSummaryResult } from './types';

const FALLBACK_FOOD_IMG = 'https://vasd-lunch.vercel.app/paw-logo.png';
const VASD_PAW_LOGO = 'https://vasd-lunch.vercel.app/paw-logo.png';

/**
 * Returns the Welcome / Interactive School Selection APL Document.
 * Renders on LaunchRequest or whenever the user is prompted to choose a school level.
 * Features large touchscreen cards for Elementary, Middle, and High School,
 * plus quick touch buttons for Breakfast, Lunch, and Both.
 */
export function buildWelcomeAplDocument(): any {
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
            fontWeight: '800',
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
          backgroundColor: '#0B0F19',
          paddingLeft: '28dp',
          paddingRight: '28dp',
          paddingTop: '20dp',
          paddingBottom: '20dp',
          justifyContent: 'space-between',
          items: [
            // Header Bar
            {
              type: 'Container',
              direction: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '48dp',
              items: [
                {
                  type: 'Container',
                  direction: 'row',
                  alignItems: 'center',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.welcomeData.logoUrl}',
                      width: '38dp',
                      height: '38dp',
                      marginRight: '12dp',
                    },
                    {
                      type: 'Container',
                      items: [
                        {
                          type: 'Text',
                          text: 'Verona Area School District',
                          style: 'textTitle',
                          fontSize: '20dp',
                        },
                        {
                          type: 'Text',
                          text: 'Tap your school or meal to view today\'s menu',
                          color: '#94A3B8',
                          fontSize: '13dp',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'Container',
                  direction: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  borderRadius: '10dp',
                  paddingLeft: '12dp',
                  paddingRight: '12dp',
                  paddingTop: '6dp',
                  paddingBottom: '6dp',
                  items: [
                    {
                      type: 'Text',
                      text: '${payload.welcomeData.dateText}',
                      color: '#F97316',
                      fontWeight: '700',
                      fontSize: '13dp',
                    },
                  ],
                },
              ],
            },

            // 3 Interactive School Cards (Touchscreen Grid)
            {
              type: 'Container',
              direction: 'row',
              width: '100%',
              height: 'calc(100% - 100dp)',
              justifyContent: 'space-between',
              items: [
                // 1. Elementary Card
                {
                  type: 'TouchWrapper',
                  width: '31.5%',
                  height: '100%',
                  onPress: {
                    type: 'SendEvent',
                    arguments: ['selectLevel', 'ES', 'both'],
                  },
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '16dp',
                      borderWidth: '2dp',
                      borderColor: 'rgba(249, 115, 22, 0.3)',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Container',
                              direction: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: '🎒 GRADES K-5',
                                  color: '#F97316',
                                  fontSize: '12dp',
                                  fontWeight: '800',
                                  letterSpacing: '1dp',
                                },
                              ],
                            },
                            {
                              type: 'Text',
                              text: 'Elementary Schools',
                              style: 'textTitle',
                              fontSize: '22dp',
                            },
                            {
                              type: 'Text',
                              text: 'Country View • Glacier Edge • Stoner Prairie • Sugar Creek • New Century • VAIS • CKCS',
                              color: '#94A3B8',
                              fontSize: '12dp',
                              lineHeight: '16dp',
                              marginTop: '6dp',
                              maxLines: 3,
                            },
                          ],
                        },
                        // Quick Touch Buttons Row
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'Tap to view menu:',
                              color: '#64748B',
                              fontSize: '11dp',
                              marginBottom: '6dp',
                            },
                            {
                              type: 'Container',
                              direction: 'row',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'ES', 'lunch'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'var(--primary, #EA580C)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🍔 Lunch',
                                          color: '#FFFFFF',
                                          fontWeight: '700',
                                          fontSize: '13dp',
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'ES', 'breakfast'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🥐 Breakfast',
                                          color: '#E2E8F0',
                                          fontWeight: '700',
                                          fontSize: '13dp',
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

                // 2. Middle School Card
                {
                  type: 'TouchWrapper',
                  width: '31.5%',
                  height: '100%',
                  onPress: {
                    type: 'SendEvent',
                    arguments: ['selectLevel', 'MS', 'both'],
                  },
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '16dp',
                      borderWidth: '2dp',
                      borderColor: 'rgba(249, 115, 22, 0.3)',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '🏫 GRADES 6-8',
                              color: '#F97316',
                              fontSize: '12dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                              marginBottom: '8dp',
                            },
                            {
                              type: 'Text',
                              text: 'Middle Schools',
                              style: 'textTitle',
                              fontSize: '22dp',
                            },
                            {
                              type: 'Text',
                              text: 'Badger Ridge Middle School • Savanna Oaks Middle School (Lines 1 & 2)',
                              color: '#94A3B8',
                              fontSize: '12dp',
                              lineHeight: '16dp',
                              marginTop: '6dp',
                              maxLines: 3,
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'Tap to view menu:',
                              color: '#64748B',
                              fontSize: '11dp',
                              marginBottom: '6dp',
                            },
                            {
                              type: 'Container',
                              direction: 'row',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'MS', 'lunch'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'var(--primary, #EA580C)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🍔 Lunch',
                                          color: '#FFFFFF',
                                          fontWeight: '700',
                                          fontSize: '13dp',
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'MS', 'breakfast'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🥐 Breakfast',
                                          color: '#E2E8F0',
                                          fontWeight: '700',
                                          fontSize: '13dp',
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

                // 3. High School Card
                {
                  type: 'TouchWrapper',
                  width: '31.5%',
                  height: '100%',
                  onPress: {
                    type: 'SendEvent',
                    arguments: ['selectLevel', 'HS', 'both'],
                  },
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '16dp',
                      borderWidth: '2dp',
                      borderColor: 'rgba(249, 115, 22, 0.3)',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '🎓 GRADES 9-12',
                              color: '#F97316',
                              fontSize: '12dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                              marginBottom: '8dp',
                            },
                            {
                              type: 'Text',
                              text: 'High School',
                              style: 'textTitle',
                              fontSize: '22dp',
                            },
                            {
                              type: 'Text',
                              text: 'Verona Area High School (VAHS) • Cafe, Pizza Line, and Lines 1 & 3',
                              color: '#94A3B8',
                              fontSize: '12dp',
                              lineHeight: '16dp',
                              marginTop: '6dp',
                              maxLines: 3,
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'Tap to view menu:',
                              color: '#64748B',
                              fontSize: '11dp',
                              marginBottom: '6dp',
                            },
                            {
                              type: 'Container',
                              direction: 'row',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'HS', 'lunch'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'var(--primary, #EA580C)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🍔 Lunch',
                                          color: '#FFFFFF',
                                          fontWeight: '700',
                                          fontSize: '13dp',
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'TouchWrapper',
                                  width: '48%',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectLevel', 'HS', 'breakfast'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                      borderRadius: '10dp',
                                      padding: '8dp',
                                      alignItems: 'center',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '🥐 Breakfast',
                                          color: '#E2E8F0',
                                          fontWeight: '700',
                                          fontSize: '13dp',
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

            // Bottom Voice Hint
            {
              type: 'Container',
              direction: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: '32dp',
              items: [
                {
                  type: 'Text',
                  text: '💡 Or say: "What\'s for breakfast tomorrow?" or "What\'s the menu next week?"',
                  color: '#64748B',
                  fontSize: '13dp',
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
 * Returns responsive APL Document for Day Menus with Interactive Touch Navigation
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
              when: '${@viewportProfile == "@hubSmall" || @viewportProfile == "@hubRound" || (viewport.pixelWidth < 960)}',
              width: '100%',
              height: '100%',
              direction: 'row',
              paddingLeft: '20dp',
              paddingRight: '20dp',
              paddingTop: '16dp',
              paddingBottom: '16dp',
              items: [
                // Left Column: Text & Badges
                {
                  type: 'Container',
                  width: '56%',
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
                              fallbackSource: VASD_PAW_LOGO,
                              width: '26dp',
                              height: '26dp',
                              marginRight: '8dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.schoolLevel} • ${payload.menuData.mealTypeTitle}',
                              style: 'textSubtitle',
                              fontSize: '14dp',
                              maxLines: 1,
                            },
                          ],
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.dateText}',
                          style: 'textBody',
                          fontSize: '12dp',
                          marginTop: '2dp',
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.heroItem.name}',
                          style: 'textTitle',
                          fontSize: '22dp',
                          maxLines: 2,
                          marginTop: '8dp',
                        },
                        {
                          type: 'Text',
                          when: '${payload.menuData.heroItem.category != ""}',
                          text: '${payload.menuData.heroItem.category}',
                          color: '#F97316',
                          fontSize: '12dp',
                          fontWeight: '600',
                          marginTop: '4dp',
                        },
                      ],
                    },
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
                  width: '44%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.menuData.heroItem.imageUrl}',
                      fallbackSource: VASD_PAW_LOGO,
                      width: '100%',
                      height: '170dp',
                      scale: 'best-fill',
                      borderRadius: '16dp',
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
              when: '${@viewportProfile == "@hubMedium" || (viewport.pixelWidth >= 960 && viewport.pixelWidth < 1600)}',
              width: '100%',
              height: '100%',
              paddingLeft: '28dp',
              paddingRight: '28dp',
              paddingTop: '16dp',
              paddingBottom: '16dp',
              justifyContent: 'space-between',
              items: [
                // Top Interactive Navigation Bar
                {
                  type: 'Container',
                  direction: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '46dp',
                  items: [
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      items: [
                        {
                          type: 'Image',
                          source: '${payload.menuData.logoUrl}',
                          fallbackSource: VASD_PAW_LOGO,
                          width: '32dp',
                          height: '32dp',
                          marginRight: '10dp',
                        },
                        {
                          type: 'Text',
                          text: 'Verona Area School District',
                          style: 'textTitle',
                          fontSize: '18dp',
                        },
                      ],
                    },
                    // Interactive Touch School Switcher Buttons
                    {
                      type: 'Container',
                      direction: 'row',
                      gap: '8dp',
                      items: [
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'ES', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "ES" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '10dp',
                              paddingLeft: '12dp',
                              paddingRight: '12dp',
                              paddingTop: '6dp',
                              paddingBottom: '6dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'Elementary',
                                  color: '#FFFFFF',
                                  fontWeight: '700',
                                  fontSize: '13dp',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'MS', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "MS" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '10dp',
                              paddingLeft: '12dp',
                              paddingRight: '12dp',
                              paddingTop: '6dp',
                              paddingBottom: '6dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'Middle',
                                  color: '#FFFFFF',
                                  fontWeight: '700',
                                  fontSize: '13dp',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'HS', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "HS" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '10dp',
                              paddingLeft: '12dp',
                              paddingRight: '12dp',
                              paddingTop: '6dp',
                              paddingBottom: '6dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'High School',
                                  color: '#FFFFFF',
                                  fontWeight: '700',
                                  fontSize: '13dp',
                                },
                              ],
                            },
                          ],
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
                  height: 'calc(100% - 56dp)',
                  items: [
                    // Left Column: Featured Main Course Card
                    {
                      type: 'Container',
                      width: '40%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '16dp',
                      marginRight: '16dp',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Image',
                              source: '${payload.menuData.heroItem.imageUrl}',
                              fallbackSource: VASD_PAW_LOGO,
                              width: '100%',
                              height: '210dp',
                              scale: 'best-fill',
                              borderRadius: '14dp',
                            },
                            {
                              type: 'Container',
                              direction: 'row',
                              marginTop: '10dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'FEATURED ENTRÉE',
                                  color: '#F97316',
                                  fontSize: '11dp',
                                  fontWeight: '800',
                                  letterSpacing: '1dp',
                                },
                              ],
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.heroItem.name}',
                              style: 'textTitle',
                              fontSize: '22dp',
                              maxLines: 2,
                              marginTop: '2dp',
                            },
                            {
                              type: 'Text',
                              when: '${payload.menuData.heroItem.allergens != ""}',
                              text: 'Allergens: ${payload.menuData.heroItem.allergens}',
                              style: 'textBody',
                              fontSize: '12dp',
                              marginTop: '4dp',
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          direction: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '6dp',
                          items: [
                            {
                              type: 'Text',
                              text: '${payload.menuData.dateText}',
                              color: '#64748B',
                              fontSize: '12dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.mealTypeTitle}',
                              color: '#F97316',
                              fontWeight: '700',
                              fontSize: '12dp',
                            },
                          ],
                        },
                      ],
                    },

                    // Right Column: Scrollable List of All Items
                    {
                      type: 'Container',
                      width: '60%',
                      height: '100%',
                      items: [
                        // Header with Meal Switcher Chips
                        {
                          type: 'Container',
                          direction: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'All Menu Items (Touch to scroll)',
                              style: 'textTitle',
                              fontSize: '16dp',
                            },
                            // Meal Switcher Chips
                            {
                              type: 'Container',
                              direction: 'row',
                              gap: '6dp',
                              items: [
                                {
                                  type: 'TouchWrapper',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectMeal', '${payload.menuData.currentLevel}', 'breakfast'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: '${payload.menuData.currentMealType == "breakfast" ? "#EA580C" : "rgba(255,255,255,0.06)"}',
                                      borderRadius: '8dp',
                                      paddingLeft: '8dp',
                                      paddingRight: '8dp',
                                      paddingTop: '4dp',
                                      paddingBottom: '4dp',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: 'Breakfast',
                                          color: '#FFFFFF',
                                          fontSize: '11dp',
                                          fontWeight: '700',
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'TouchWrapper',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectMeal', '${payload.menuData.currentLevel}', 'lunch'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: '${payload.menuData.currentMealType == "lunch" ? "#EA580C" : "rgba(255,255,255,0.06)"}',
                                      borderRadius: '8dp',
                                      paddingLeft: '8dp',
                                      paddingRight: '8dp',
                                      paddingTop: '4dp',
                                      paddingBottom: '4dp',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: 'Lunch',
                                          color: '#FFFFFF',
                                          fontSize: '11dp',
                                          fontWeight: '700',
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'TouchWrapper',
                                  onPress: {
                                    type: 'SendEvent',
                                    arguments: ['selectMeal', '${payload.menuData.currentLevel}', 'both'],
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      backgroundColor: '${payload.menuData.currentMealType == "both" ? "#EA580C" : "rgba(255,255,255,0.06)"}',
                                      borderRadius: '8dp',
                                      paddingLeft: '8dp',
                                      paddingRight: '8dp',
                                      paddingTop: '4dp',
                                      paddingBottom: '4dp',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: 'Both',
                                          color: '#FFFFFF',
                                          fontSize: '11dp',
                                          fontWeight: '700',
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
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
                              paddingBottom: '8dp',
                              items: [
                                {
                                  type: 'Container',
                                  direction: 'row',
                                  backgroundColor: '#1E293B',
                                  borderRadius: '12dp',
                                  padding: '8dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Image',
                                      source: '${data.imageUrl}',
                                      fallbackSource: VASD_PAW_LOGO,
                                      width: '60dp',
                                      height: '60dp',
                                      borderRadius: '10dp',
                                      scale: 'best-fill',
                                      marginRight: '12dp',
                                    },
                                    {
                                      type: 'Container',
                                      width: 'calc(100% - 78dp)',
                                      items: [
                                        {
                                          type: 'Text',
                                          text: '${data.name}',
                                          style: 'textTitle',
                                          fontSize: '15dp',
                                          maxLines: 1,
                                        },
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          alignItems: 'center',
                                          marginTop: '2dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '${data.category}',
                                              color: '#F97316',
                                              fontSize: '11dp',
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
              when: '${@viewportProfile == "@hubLarge" || @viewportProfile == "@hubExtraLarge" || @viewportProfile == "@tvLandscape" || viewport.pixelWidth >= 1600}',
              width: '100%',
              height: '100%',
              paddingLeft: '40dp',
              paddingRight: '40dp',
              paddingTop: '28dp',
              paddingBottom: '28dp',
              items: [
                // Top Header Bar
                {
                  type: 'Container',
                  direction: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '56dp',
                  marginBottom: '16dp',
                  items: [
                    {
                      type: 'Container',
                      direction: 'row',
                      alignItems: 'center',
                      items: [
                        {
                          type: 'Image',
                          source: '${payload.menuData.logoUrl}',
                          fallbackSource: VASD_PAW_LOGO,
                          width: '48dp',
                          height: '48dp',
                          marginRight: '14dp',
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'Verona Area School District',
                              style: 'textTitle',
                              fontSize: '24dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.dateText}',
                              style: 'textBody',
                              fontSize: '15dp',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      gap: '10dp',
                      items: [
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'ES', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "ES" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '12dp',
                              paddingLeft: '16dp',
                              paddingRight: '16dp',
                              paddingTop: '8dp',
                              paddingBottom: '8dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'Elementary (K-5)',
                                  color: '#FFFFFF',
                                  fontWeight: '800',
                                  fontSize: '15dp',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'MS', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "MS" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '12dp',
                              paddingLeft: '16dp',
                              paddingRight: '16dp',
                              paddingTop: '8dp',
                              paddingBottom: '8dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'Middle (6-8)',
                                  color: '#FFFFFF',
                                  fontWeight: '800',
                                  fontSize: '15dp',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SendEvent',
                            arguments: ['selectLevel', 'HS', '${payload.menuData.currentMealType}'],
                          },
                          items: [
                            {
                              type: 'Container',
                              backgroundColor: '${payload.menuData.currentLevel == "HS" ? "#EA580C" : "#1E293B"}',
                              borderRadius: '12dp',
                              paddingLeft: '16dp',
                              paddingRight: '16dp',
                              paddingTop: '8dp',
                              paddingBottom: '8dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'High School (9-12)',
                                  color: '#FFFFFF',
                                  fontWeight: '800',
                                  fontSize: '15dp',
                                },
                              ],
                            },
                          ],
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
                  height: '250dp',
                  backgroundColor: '#1E293B',
                  borderRadius: '22dp',
                  padding: '20dp',
                  marginBottom: '20dp',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.menuData.heroItem.imageUrl}',
                      fallbackSource: VASD_PAW_LOGO,
                      width: '340dp',
                      height: '100%',
                      borderRadius: '16dp',
                      scale: 'best-fill',
                      marginRight: '24dp',
                    },
                    {
                      type: 'Container',
                      width: 'calc(100% - 370dp)',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: 'FEATURED MAIN COURSE',
                              color: '#F97316',
                              fontSize: '13dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                              marginBottom: '4dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.heroItem.name}',
                              style: 'textTitle',
                              fontSize: '30dp',
                              maxLines: 2,
                            },
                            {
                              type: 'Text',
                              text: '${payload.menuData.summarySnippet}',
                              color: '#CBD5E1',
                              fontSize: '16dp',
                              maxLines: 3,
                              marginTop: '8dp',
                            },
                          ],
                        },
                        {
                          type: 'Text',
                          when: '${payload.menuData.heroItem.allergens != ""}',
                          text: 'Allergens: ${payload.menuData.heroItem.allergens}',
                          color: '#94A3B8',
                          fontSize: '13dp',
                        },
                      ],
                    },
                  ],
                },

                // Bottom Gallery: Touch-Scrollable Horizontal Carousel
                {
                  type: 'Container',
                  width: '100%',
                  height: 'calc(100% - 350dp)',
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
                          text: 'All Menu Items & Sides (Swipe or touch to explore)',
                          style: 'textTitle',
                          fontSize: '20dp',
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.itemCountText}',
                          style: 'textBody',
                          fontSize: '14dp',
                        },
                      ],
                    },
                    {
                      type: 'Sequence',
                      scrollDirection: 'horizontal',
                      width: '100%',
                      height: 'calc(100% - 34dp)',
                      data: '${payload.menuData.allItems}',
                      items: [
                        {
                          type: 'TouchWrapper',
                          width: '240dp',
                          height: '100%',
                          marginRight: '16dp',
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '18dp',
                              padding: '12dp',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Image',
                                  source: '${data.imageUrl}',
                                  fallbackSource: VASD_PAW_LOGO,
                                  width: '100%',
                                  height: '62%',
                                  borderRadius: '12dp',
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
                                      fontSize: '11dp',
                                      fontWeight: '700',
                                    },
                                    {
                                      type: 'Text',
                                      text: '${data.name}',
                                      style: 'textTitle',
                                      fontSize: '16dp',
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
          padding: '24dp',
          items: [
            // Header
            {
              type: 'Container',
              direction: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '48dp',
              marginBottom: '14dp',
              items: [
                {
                  type: 'Container',
                  direction: 'row',
                  alignItems: 'center',
                  items: [
                    {
                      type: 'Image',
                      source: '${payload.weeklyData.logoUrl}',
                      fallbackSource: VASD_PAW_LOGO,
                      width: '36dp',
                      height: '36dp',
                      marginRight: '12dp',
                    },
                    {
                      type: 'Text',
                      text: 'Verona Area School District — Weekly Forecast',
                      style: 'textTitle',
                      fontSize: '20dp',
                    },
                  ],
                },
                {
                  type: 'Text',
                  text: '${payload.weeklyData.schoolLevel} • ${payload.weeklyData.weekLabel}',
                  color: '#F97316',
                  fontWeight: '700',
                  fontSize: '15dp',
                },
              ],
            },

            // 5-Day Sequence
            {
              type: 'Sequence',
              scrollDirection: 'horizontal',
              width: '100%',
              height: 'calc(100% - 66dp)',
              data: '${payload.weeklyData.days}',
              items: [
                {
                  type: 'TouchWrapper',
                  width: '260dp',
                  height: '100%',
                  marginRight: '16dp',
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '14dp',
                      justifyContent: 'space-between',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '${data.dayOfWeek}',
                              color: '#F97316',
                              fontSize: '15dp',
                              fontWeight: '800',
                            },
                            {
                              type: 'Text',
                              text: '${data.dateText}',
                              color: '#94A3B8',
                              fontSize: '12dp',
                              marginTop: '2dp',
                            },
                          ],
                        },
                        {
                          type: 'Image',
                          source: '${data.imageUrl}',
                          fallbackSource: VASD_PAW_LOGO,
                          width: '100%',
                          height: '55%',
                          borderRadius: '12dp',
                          scale: 'best-fill',
                        },
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '${data.entreeName}',
                              style: 'textTitle',
                              fontSize: '16dp',
                              maxLines: 2,
                            },
                            {
                              type: 'Text',
                              when: '${data.secondaryText != ""}',
                              text: '${data.secondaryText}',
                              color: '#64748B',
                              fontSize: '11dp',
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
 * Builds APL Datasource for the Welcome / Interactive School Selection screen
 */
export function buildWelcomeAplDatasource(
  baseUrl: string = 'https://vasd-lunch.vercel.app'
): any {
  const d = new Date();
  const dateText = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return {
    welcomeData: {
      title: 'Verona School Lunch',
      dateText,
      logoUrl: `${baseUrl}/paw-logo.png`,
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
      currentLevel: result.level || 'ES',
      mealTypeTitle: mealTitle,
      currentMealType: result.mealType || 'lunch',
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
