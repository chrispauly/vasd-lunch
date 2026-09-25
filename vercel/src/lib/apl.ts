import { LunchSummaryResult, LunchLevel, MealType } from './types';
import { LEVEL_CONFIG } from './healthepro';

const VASD_PAW_LOGO = 'https://vasd-lunch.vercel.app/paw-logo.png';

/**
 * Returns the Welcome / Guided Multi-Step Wizard APL Document.
 * Features an onMount Headline splash of the VASD paw logo and title,
 * then 3 full-screen equally spaced options for:
 *  - Page 1: Elementary, Middle, and High School
 *  - Page 2: Breakfast, Lunch, Both
 *  - Page 3: Today, Tomorrow, Next Week
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
            fontFamily: 'Amazon Ember, Georgia, sans-serif',
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
          backgroundColor: '#080C14',
          items: [
            {
              type: 'Pager',
              id: 'wizardPager',
              width: '100%',
              height: '100%',
              navigation: 'none',
              initialPage: '${payload.wizardData.initialPage || 0}',
              onMount: [
                {
                  when: '${payload.wizardData.showSplash != false}',
                  type: 'Sequential',
                  commands: [
                    {
                      type: 'Idle',
                      delay: 1300,
                    },
                    {
                      type: 'SetPage',
                      componentId: 'wizardPager',
                      position: 'relative',
                      value: 1,
                    },
                  ],
                },
              ],
              items: [
                // ==========================================
                // PAGE 0: SPLASH / HEADLINE INTRO
                // ==========================================
                {
                  type: 'TouchWrapper',
                  width: '100%',
                  height: '100%',
                  onPress: {
                    type: 'SetPage',
                    componentId: 'wizardPager',
                    position: 'relative',
                    value: 1,
                  },
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#080C14',
                      items: [
                        {
                          type: 'Image',
                          source: '${payload.wizardData.logoUrl}',
                          fallbackSource: VASD_PAW_LOGO,
                          width: '130dp',
                          height: '130dp',
                          marginBottom: '20dp',
                        },
                        {
                          type: 'Text',
                          text: 'Verona Area School District',
                          style: 'textTitle',
                          fontSize: '32dp',
                          textAlign: 'center',
                        },
                        {
                          type: 'Text',
                          text: 'Daily School Menus • Breakfast & Lunch',
                          color: '#F97316',
                          fontSize: '18dp',
                          fontWeight: '700',
                          marginTop: '8dp',
                          textAlign: 'center',
                        },
                        {
                          type: 'Container',
                          marginTop: '24dp',
                          backgroundColor: 'rgba(249, 115, 22, 0.15)',
                          borderRadius: '20dp',
                          paddingLeft: '18dp',
                          paddingRight: '18dp',
                          paddingTop: '8dp',
                          paddingBottom: '8dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'Touch anywhere to start →',
                              color: '#FDBA74',
                              fontSize: '13dp',
                              fontWeight: '600',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },

                // ==========================================
                // PAGE 1: STEP 1 - SCHOOL LEVEL SELECTION (3 EQUAL BUTTONS)
                // ==========================================
                {
                  type: 'Container',
                  width: '100%',
                  height: '100%',
                  paddingLeft: '24dp',
                  paddingRight: '24dp',
                  paddingTop: '16dp',
                  paddingBottom: '16dp',
                  justifyContent: 'space-between',
                  items: [
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
                              source: '${payload.wizardData.logoUrl}',
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
                        {
                          type: 'Container',
                          backgroundColor: 'rgba(249, 115, 22, 0.2)',
                          borderRadius: '10dp',
                          paddingLeft: '12dp',
                          paddingRight: '12dp',
                          paddingTop: '6dp',
                          paddingBottom: '6dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'STEP 1 OF 3 • SELECT SCHOOL',
                              color: '#F97316',
                              fontSize: '12dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      width: '100%',
                      height: 'calc(100% - 90dp)',
                      gap: '16dp',
                      items: [
                        // Elementary
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectLevel', 'ES'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 2,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'GRADES K-5',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Elementary',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Sugar Creek • Stoner Prairie • Glacier Edge • Country View • VAIS',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Select Elementary →',
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
                        // Middle
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectLevel', 'MS'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 2,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'GRADES 6-8',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Middle School',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Badger Ridge Middle School • Core Knowledge Charter School (CKCS)',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Select Middle School →',
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
                        // High School
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectLevel', 'HS'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 2,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'GRADES 9-12',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'High School',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Verona Area High School (VAHS) • Wildcat Cafe, Pizza Line & Main Lines',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Select High School →',
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
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '28dp',
                      items: [
                        {
                          type: 'Text',
                          text: '💡 Or say: "Elementary", "Middle School", or "High School"',
                          color: '#64748B',
                          fontSize: '12dp',
                        },
                      ],
                    },
                  ],
                },

                // ==========================================
                // PAGE 2: STEP 2 - MEAL TYPE SELECTION (3 EQUAL BUTTONS)
                // ==========================================
                {
                  type: 'Container',
                  width: '100%',
                  height: '100%',
                  paddingLeft: '24dp',
                  paddingRight: '24dp',
                  paddingTop: '16dp',
                  paddingBottom: '16dp',
                  justifyContent: 'space-between',
                  items: [
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
                              source: '${payload.wizardData.logoUrl}',
                              fallbackSource: VASD_PAW_LOGO,
                              width: '32dp',
                              height: '32dp',
                              marginRight: '10dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.wizardData.selectedLevelName || "Verona Schools"}',
                              style: 'textTitle',
                              fontSize: '18dp',
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          backgroundColor: 'rgba(249, 115, 22, 0.2)',
                          borderRadius: '10dp',
                          paddingLeft: '12dp',
                          paddingRight: '12dp',
                          paddingTop: '6dp',
                          paddingBottom: '6dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'STEP 2 OF 3 • SELECT MEAL TYPE',
                              color: '#F97316',
                              fontSize: '12dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      width: '100%',
                      height: 'calc(100% - 90dp)',
                      gap: '16dp',
                      items: [
                        // Breakfast
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectMeal', "${payload.wizardData.selectedLevel || 'ES'}", 'breakfast'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 3,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'MORNING MENU',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '🥐 Breakfast',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Warm breakfast sandwiches, fresh muffins, cereals, fruit juices, and cold 1% white milk.',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Choose Breakfast →',
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
                        // Lunch
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectMeal', "${payload.wizardData.selectedLevel || 'ES'}", 'lunch'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 3,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: "CHEF'S LUNCH",
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '🍔 Lunch',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Hot daily main entrées, vegetarian alternatives, farm-fresh vegetables, fruit and milk.',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Choose Lunch →',
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
                        // Both Meals
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: [
                            {
                              type: 'SendEvent',
                              arguments: ['selectMeal', "${payload.wizardData.selectedLevel || 'ES'}", 'both'],
                            },
                            {
                              type: 'SetPage',
                              componentId: 'wizardPager',
                              value: 3,
                            },
                          ],
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'COMPLETE DAY',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '🍽️ Both Meals',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Full view of both breakfast and lunch options, sides, and nutritional details together.',
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 4,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Choose Both →',
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
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '28dp',
                      items: [
                        {
                          type: 'Text',
                          text: '💡 Or say: "Breakfast", "Lunch", or "Both"',
                          color: '#64748B',
                          fontSize: '12dp',
                        },
                      ],
                    },
                  ],
                },

                // ==========================================
                // PAGE 3: STEP 3 - DATE SELECTION (EQUALLY SPACED)
                // ==========================================
                {
                  type: 'Container',
                  width: '100%',
                  height: '100%',
                  paddingLeft: '24dp',
                  paddingRight: '24dp',
                  paddingTop: '16dp',
                  paddingBottom: '16dp',
                  justifyContent: 'space-between',
                  items: [
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
                              source: '${payload.wizardData.logoUrl}',
                              fallbackSource: VASD_PAW_LOGO,
                              width: '32dp',
                              height: '32dp',
                              marginRight: '10dp',
                            },
                            {
                              type: 'Text',
                              text: '${payload.wizardData.selectedLevelName || "Verona Schools"} • ${payload.wizardData.selectedMealTitle || "Menu"}',
                              style: 'textTitle',
                              fontSize: '18dp',
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          backgroundColor: 'rgba(249, 115, 22, 0.2)',
                          borderRadius: '10dp',
                          paddingLeft: '12dp',
                          paddingRight: '12dp',
                          paddingTop: '6dp',
                          paddingBottom: '6dp',
                          items: [
                            {
                              type: 'Text',
                              text: 'STEP 3 OF 3 • CHOOSE DATE',
                              color: '#F97316',
                              fontSize: '12dp',
                              fontWeight: '800',
                              letterSpacing: '1dp',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Container',
                      direction: 'row',
                      width: '100%',
                      height: 'calc(100% - 90dp)',
                      gap: '16dp',
                      items: [
                        // Today
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: {
                            type: 'SendEvent',
                            arguments: [
                              'selectDate',
                              "${payload.wizardData.selectedLevel || 'ES'}",
                              "${payload.wizardData.selectedMeal || 'lunch'}",
                              'today',
                            ],
                          },
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'CURRENT DAY',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: "📅 Today's Menu",
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '${payload.wizardData.todayDateText}',
                                      color: '#F97316',
                                      fontSize: '16dp',
                                      fontWeight: '700',
                                      marginTop: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: "View today's hot entrees, fresh sides, fruits, and allergens.",
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 3,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: "Show Today's Menu →",
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
                        // Tomorrow
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: {
                            type: 'SendEvent',
                            arguments: [
                              'selectDate',
                              "${payload.wizardData.selectedLevel || 'ES'}",
                              "${payload.wizardData.selectedMeal || 'lunch'}",
                              'tomorrow',
                            ],
                          },
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'UPCOMING DAY',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '☀️ Tomorrow',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '${payload.wizardData.tomorrowDateText}',
                                      color: '#F97316',
                                      fontSize: '16dp',
                                      fontWeight: '700',
                                      marginTop: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: "Preview tomorrow's upcoming dishes and prepare ahead of time.",
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 3,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: "Show Tomorrow's Menu →",
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
                        // Next Week
                        {
                          type: 'TouchWrapper',
                          grow: 1,
                          height: '100%',
                          onPress: {
                            type: 'SendEvent',
                            arguments: [
                              'selectDate',
                              "${payload.wizardData.selectedLevel || 'ES'}",
                              "${payload.wizardData.selectedMeal || 'lunch'}",
                              'next week',
                            ],
                          },
                          items: [
                            {
                              type: 'Container',
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#1E293B',
                              borderRadius: '20dp',
                              padding: '20dp',
                              borderWidth: '2dp',
                              borderColor: 'rgba(249, 115, 22, 0.4)',
                              justifyContent: 'space-between',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: '5-DAY OUTLOOK',
                                      color: '#F97316',
                                      fontSize: '12dp',
                                      fontWeight: '800',
                                      letterSpacing: '1dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: '📆 Next Week',
                                      style: 'textTitle',
                                      fontSize: '26dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: 'Mon – Fri Forecast',
                                      color: '#F97316',
                                      fontSize: '16dp',
                                      fontWeight: '700',
                                      marginTop: '6dp',
                                    },
                                    {
                                      type: 'Text',
                                      text: "Explore next week's full weekly meal rotation from Monday to Friday.",
                                      color: '#94A3B8',
                                      fontSize: '13dp',
                                      lineHeight: '18dp',
                                      marginTop: '8dp',
                                      maxLines: 3,
                                    },
                                  ],
                                },
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Show Next Week →',
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
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '28dp',
                      items: [
                        {
                          type: 'Text',
                          text: '💡 Or say: "Today", "Tomorrow", or "Next Week"',
                          color: '#64748B',
                          fontSize: '12dp',
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
 * Returns the Restaurant-Style Dinner Menu & Image Gallery APL Document.
 * Features:
 *  - Page 0: High-end restaurant dinner menu with chef's hero photo, course headers (Entrées, Sides, Fruits, Beverages)
 *  - Page 1: Complete Food Photo Gallery sequence of large cards with real photos
 *  - Supports instant client-side SetPage switching upon tapping the hero photo or 'See Photos' button,
 *    and supports voice navigation ('see more' / 'back to menu').
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
            fontFamily: 'Amazon Ember, Georgia, serif',
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
          backgroundColor: '#070A11',
          items: [
            {
              type: 'Pager',
              id: 'menuPager',
              width: '100%',
              height: '100%',
              navigation: 'none',
              initialPage: 0,
              items: [
                // ==========================================
                // PAGE 0: RESTAURANT DINNER MENU
                // ==========================================
                {
                  type: 'Container',
                  width: '100%',
                  height: '100%',
                  paddingLeft: '24dp',
                  paddingRight: '24dp',
                  paddingTop: '14dp',
                  paddingBottom: '14dp',
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
                              source: '${payload.menuData.logoUrl}',
                              fallbackSource: VASD_PAW_LOGO,
                              width: '34dp',
                              height: '34dp',
                              marginRight: '10dp',
                            },
                            {
                              type: 'Container',
                              items: [
                                {
                                  type: 'Text',
                                  text: 'Verona Area School District • ${payload.menuData.schoolLevel}',
                                  style: 'textTitle',
                                  fontSize: '17dp',
                                },
                                {
                                  type: 'Text',
                                  text: '${payload.menuData.dateText} • ${payload.menuData.mealTypeTitle}',
                                  color: '#F97316',
                                  fontSize: '12dp',
                                  fontWeight: '600',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'Container',
                          direction: 'row',
                          gap: '6dp',
                          alignItems: 'center',
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
                                  borderRadius: '8dp',
                                  paddingLeft: '10dp',
                                  paddingRight: '10dp',
                                  paddingTop: '5dp',
                                  paddingBottom: '5dp',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Elementary',
                                      color: '#FFFFFF',
                                      fontWeight: '700',
                                      fontSize: '12dp',
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
                                  borderRadius: '8dp',
                                  paddingLeft: '10dp',
                                  paddingRight: '10dp',
                                  paddingTop: '5dp',
                                  paddingBottom: '5dp',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'Middle',
                                      color: '#FFFFFF',
                                      fontWeight: '700',
                                      fontSize: '12dp',
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
                                  borderRadius: '8dp',
                                  paddingLeft: '10dp',
                                  paddingRight: '10dp',
                                  paddingTop: '5dp',
                                  paddingBottom: '5dp',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: 'High School',
                                      color: '#FFFFFF',
                                      fontWeight: '700',
                                      fontSize: '12dp',
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              type: 'TouchWrapper',
                              onPress: {
                                type: 'SetPage',
                                componentId: 'menuPager',
                                value: 1,
                              },
                              items: [
                                {
                                  type: 'Container',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '8dp',
                                  paddingLeft: '12dp',
                                  paddingRight: '12dp',
                                  paddingTop: '5dp',
                                  paddingBottom: '5dp',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: '📷 See Photos',
                                      color: '#FFFFFF',
                                      fontWeight: '800',
                                      fontSize: '12dp',
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },

                    // 2-Column Dinner Menu Content
                    {
                      type: 'Container',
                      direction: 'row',
                      width: '100%',
                      height: 'calc(100% - 56dp)',
                      gap: '16dp',
                      items: [
                        // Left Column: Chef's Featured Entrée Presentation
                        {
                          type: 'Container',
                          width: '40%',
                          height: '100%',
                          backgroundColor: '#1E293B',
                          borderRadius: '18dp',
                          padding: '16dp',
                          borderWidth: '1dp',
                          borderColor: 'rgba(249, 115, 22, 0.35)',
                          justifyContent: 'space-between',
                          items: [
                            {
                              type: 'Container',
                              items: [
                                {
                                  type: 'TouchWrapper',
                                  width: '100%',
                                  height: '190dp',
                                  onPress: {
                                    type: 'SetPage',
                                    componentId: 'menuPager',
                                    value: 1,
                                  },
                                  items: [
                                    {
                                      type: 'Container',
                                      width: '100%',
                                      height: '100%',
                                      items: [
                                        {
                                          type: 'Image',
                                          source: '${payload.menuData.heroItem.imageUrl}',
                                          fallbackSource: VASD_PAW_LOGO,
                                          width: '100%',
                                          height: '100%',
                                          scale: 'best-fill',
                                          borderRadius: '14dp',
                                        },
                                        {
                                          type: 'Container',
                                          position: 'absolute',
                                          bottom: '8dp',
                                          left: '8dp',
                                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                          borderRadius: '8dp',
                                          paddingLeft: '10dp',
                                          paddingRight: '10dp',
                                          paddingTop: '4dp',
                                          paddingBottom: '4dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '📷 Tap photo for all dish pictures',
                                              color: '#FDBA74',
                                              fontSize: '11dp',
                                              fontWeight: '700',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: 'Text',
                                  text: "CHEF'S FEATURED MAIN COURSE",
                                  color: '#F97316',
                                  fontSize: '11dp',
                                  fontWeight: '800',
                                  letterSpacing: '1dp',
                                  marginTop: '10dp',
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
                                  text: '${payload.menuData.summarySnippet}',
                                  color: '#CBD5E1',
                                  fontSize: '13dp',
                                  lineHeight: '18dp',
                                  maxLines: 3,
                                  marginTop: '6dp',
                                },
                                {
                                  type: 'Text',
                                  when: '${payload.menuData.heroItem.allergens != ""}',
                                  text: 'Allergens: ${payload.menuData.heroItem.allergens}',
                                  color: '#94A3B8',
                                  fontSize: '12dp',
                                  marginTop: '6dp',
                                },
                              ],
                            },
                            {
                              type: 'TouchWrapper',
                              width: '100%',
                              onPress: {
                                type: 'SetPage',
                                componentId: 'menuPager',
                                value: 1,
                              },
                              items: [
                                {
                                  type: 'Container',
                                  width: '100%',
                                  backgroundColor: '#EA580C',
                                  borderRadius: '10dp',
                                  padding: '10dp',
                                  alignItems: 'center',
                                  items: [
                                    {
                                      type: 'Text',
                                      text: '📷 View Full Food Photo Gallery →',
                                      color: '#FFFFFF',
                                      fontWeight: '800',
                                      fontSize: '13dp',
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },

                        // Right Column: Restaurant Dinner Menu Board
                        {
                          type: 'Container',
                          width: '58%',
                          height: '100%',
                          backgroundColor: '#111827',
                          borderRadius: '18dp',
                          padding: '16dp',
                          borderWidth: '1dp',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          items: [
                            {
                              type: 'Container',
                              direction: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingBottom: '8dp',
                              borderBottomWidth: '1dp',
                              borderBottomColor: 'rgba(249, 115, 22, 0.3)',
                              marginBottom: '10dp',
                              items: [
                                {
                                  type: 'Text',
                                  text: "TODAY'S DINNER MENU SELECTIONS",
                                  color: '#F97316',
                                  fontWeight: '800',
                                  fontSize: '13dp',
                                  letterSpacing: '1dp',
                                },
                                {
                                  type: 'Text',
                                  text: 'Prepared Fresh Daily',
                                  color: '#64748B',
                                  fontSize: '11dp',
                                },
                              ],
                            },
                            {
                              type: 'ScrollView',
                              width: '100%',
                              height: 'calc(100% - 36dp)',
                              items: [
                                {
                                  type: 'Container',
                                  items: [
                                    // 1. Hot Entrées
                                    {
                                      type: 'Text',
                                      text: '🍽️ MAIN HOT ENTRÉES',
                                      color: '#FDBA74',
                                      fontWeight: '800',
                                      fontSize: '13dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Sequence',
                                      scrollDirection: 'vertical',
                                      width: '100%',
                                      data: '${payload.menuData.courses.entrees}',
                                      items: [
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          paddingTop: '4dp',
                                          paddingBottom: '4dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '• ${data.name}',
                                              color: '#FFFFFF',
                                              fontWeight: '600',
                                              fontSize: '14dp',
                                              width: '75%',
                                            },
                                            {
                                              type: 'Text',
                                              text: '${data.category}',
                                              color: '#F97316',
                                              fontSize: '11dp',
                                              fontWeight: '600',
                                            },
                                          ],
                                        },
                                      ],
                                    },

                                    // 2. Sides & Veggies
                                    {
                                      type: 'Text',
                                      text: '🥗 FARM-FRESH SIDES & VEGETABLES',
                                      color: '#FDBA74',
                                      fontWeight: '800',
                                      fontSize: '13dp',
                                      marginTop: '12dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Sequence',
                                      scrollDirection: 'vertical',
                                      width: '100%',
                                      data: '${payload.menuData.courses.sides}',
                                      items: [
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          paddingTop: '3dp',
                                          paddingBottom: '3dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '• ${data.name}',
                                              color: '#E2E8F0',
                                              fontSize: '13dp',
                                              width: '75%',
                                            },
                                            {
                                              type: 'Text',
                                              text: '${data.category}',
                                              color: '#64748B',
                                              fontSize: '11dp',
                                            },
                                          ],
                                        },
                                      ],
                                    },

                                    // 3. Fruits & Juices
                                    {
                                      type: 'Text',
                                      text: '🍎 FRUITS & JUICES',
                                      color: '#FDBA74',
                                      fontWeight: '800',
                                      fontSize: '13dp',
                                      marginTop: '12dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Sequence',
                                      scrollDirection: 'vertical',
                                      width: '100%',
                                      data: '${payload.menuData.courses.fruits}',
                                      items: [
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          paddingTop: '3dp',
                                          paddingBottom: '3dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '• ${data.name}',
                                              color: '#E2E8F0',
                                              fontSize: '13dp',
                                              width: '75%',
                                            },
                                            {
                                              type: 'Text',
                                              text: '${data.category}',
                                              color: '#64748B',
                                              fontSize: '11dp',
                                            },
                                          ],
                                        },
                                      ],
                                    },

                                    // 4. Milk & Beverages
                                    {
                                      type: 'Text',
                                      text: '🥛 BEVERAGES & MILK',
                                      color: '#FDBA74',
                                      fontWeight: '800',
                                      fontSize: '13dp',
                                      marginTop: '12dp',
                                      marginBottom: '6dp',
                                    },
                                    {
                                      type: 'Sequence',
                                      scrollDirection: 'vertical',
                                      width: '100%',
                                      data: '${payload.menuData.courses.staples}',
                                      items: [
                                        {
                                          type: 'Container',
                                          direction: 'row',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          paddingTop: '3dp',
                                          paddingBottom: '3dp',
                                          items: [
                                            {
                                              type: 'Text',
                                              text: '• ${data.name}',
                                              color: '#94A3B8',
                                              fontSize: '12dp',
                                              width: '75%',
                                            },
                                            {
                                              type: 'Text',
                                              text: 'Dairy',
                                              color: '#64748B',
                                              fontSize: '11dp',
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
                // PAGE 1: FOOD PHOTO GALLERY (IMAGE LIST)
                // ==========================================
                {
                  type: 'Container',
                  width: '100%',
                  height: '100%',
                  paddingLeft: '24dp',
                  paddingRight: '24dp',
                  paddingTop: '14dp',
                  paddingBottom: '14dp',
                  justifyContent: 'space-between',
                  items: [
                    // Gallery Header
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: '48dp',
                      items: [
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SetPage',
                            componentId: 'menuPager',
                            value: 0,
                          },
                          items: [
                            {
                              type: 'Container',
                              direction: 'row',
                              alignItems: 'center',
                              backgroundColor: '#1E293B',
                              borderRadius: '10dp',
                              paddingLeft: '14dp',
                              paddingRight: '14dp',
                              paddingTop: '8dp',
                              paddingBottom: '8dp',
                              borderWidth: '1dp',
                              borderColor: '#EA580C',
                              items: [
                                {
                                  type: 'Text',
                                  text: '← Back to Restaurant Menu',
                                  color: '#FDBA74',
                                  fontWeight: '800',
                                  fontSize: '13dp',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'Text',
                          text: 'Food Photo Gallery • ${payload.menuData.schoolLevel}',
                          style: 'textTitle',
                          fontSize: '18dp',
                        },
                        {
                          type: 'Text',
                          text: '${payload.menuData.itemCountText}',
                          color: '#F97316',
                          fontWeight: '700',
                          fontSize: '13dp',
                        },
                      ],
                    },

                    // Horizontal Photo Sequence
                    {
                      type: 'Sequence',
                      scrollDirection: 'horizontal',
                      width: '100%',
                      height: 'calc(100% - 96dp)',
                      data: '${payload.menuData.allItems}',
                      items: [
                        {
                          type: 'TouchWrapper',
                          width: '250dp',
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
                              borderWidth: '1dp',
                              borderColor: 'rgba(255, 255, 255, 0.08)',
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
                                      fontSize: '15dp',
                                      maxLines: 2,
                                      marginTop: '2dp',
                                    },
                                    {
                                      type: 'Text',
                                      when: '${data.allergens != ""}',
                                      text: 'Allergens: ${data.allergens}',
                                      color: '#94A3B8',
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

                    // Gallery Footer
                    {
                      type: 'Container',
                      direction: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '32dp',
                      items: [
                        {
                          type: 'TouchWrapper',
                          onPress: {
                            type: 'SetPage',
                            componentId: 'menuPager',
                            value: 0,
                          },
                          items: [
                            {
                              type: 'Text',
                              text: '← Tap here or say "back" to return to Dinner Menu',
                              color: '#64748B',
                              fontSize: '12dp',
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
 * Builds APL Datasource for the Guided Wizard (School, Meal, Date selection)
 */
export function buildWelcomeAplDatasource({
  step = 'splash',
  schoolLevel,
  mealType,
  baseUrl = 'https://vasd-lunch.vercel.app',
}: {
  step?: 'splash' | 'school' | 'meal' | 'date';
  schoolLevel?: LunchLevel;
  mealType?: MealType;
  baseUrl?: string;
} = {}): any {
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

/**
 * Builds APL Datasource for the Restaurant Dinner Menu & Image Gallery
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

  // Group items into restaurant courses
  const entrees: Array<{ name: string; category: string; allergens: string }> = [];
  const sides: Array<{ name: string; category: string; allergens: string }> = [];
  const fruits: Array<{ name: string; category: string; allergens: string }> = [];
  const staples: Array<{ name: string; category: string; allergens: string }> = [];

  for (const item of allItems) {
    const catLower = (item.category || '').toLowerCase();
    const nameLower = (item.name || '').toLowerCase();

    if (catLower.includes('entrée') || catLower.includes('entree') || catLower.includes('main')) {
      entrees.push({ name: item.name, category: item.category, allergens: item.allergens });
    } else if (catLower.includes('fruit') || catLower.includes('juice') || nameLower.includes('juice') || nameLower.includes('apple') || nameLower.includes('fruit')) {
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

  return {
    menuData: {
      title: 'Verona Area School District',
      schoolLevel: result.levelName,
      currentLevel: result.level || 'ES',
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
