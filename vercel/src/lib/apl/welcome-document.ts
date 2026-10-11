import { COMMON_APL_STYLES } from './styles';
import { createSplashScreen } from './screens/splash';
import { createStep1SchoolScreen } from './screens/step1-school';
import { createStep2MealScreen } from './screens/step2-meal';
import { createStep3DateScreen } from './screens/step3-date';

/**
 * Returns the Welcome / Guided Multi-Step Wizard APL Document.
 * Features an onMount Headline splash of the VASD paw logo and title,
 * then 3 full-screen options for:
 *  - Page 1: Elementary, Middle, and High School
 *  - Page 2: Breakfast, Lunch, Both
 *  - Page 3: Today, Tomorrow, Next Week
 *
 * Fully responsive: adapts between circular Echo Spot hub (@hubRound)
 * and widescreen Echo Show displays (Show 5, 8, 10, 15, Fire TV).
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
    styles: COMMON_APL_STYLES,
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
                // Page 0: Splash & Brand Launcher
                createSplashScreen(),

                // Page 1: Step 1 • School Level Selection
                createStep1SchoolScreen(),

                // Page 2: Step 2 • Meal Type Selection
                createStep2MealScreen(),

                // Page 3: Step 3 • Date Selection
                createStep3DateScreen(),
              ],
            },
          ],
        },
      ],
    },
  };
}
