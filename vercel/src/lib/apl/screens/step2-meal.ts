import { APL_COLORS } from '../styles';
import { createHeaderBar } from '../components/header-bar';
import { createHintBar } from '../components/hint-bar';

function createLandscapeMealCard({
  badge,
  title,
  subtitle,
  description,
  buttonText,
  mealCode,
}: {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  mealCode: 'breakfast' | 'lunch' | 'both';
}): any {
  return {
    type: 'TouchWrapper',
    width: '32%',
    height: '100%',
    shrink: 0,
    onPress: [
      {
        type: 'SendEvent',
        arguments: ['selectMeal', mealCode],
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
        backgroundColor: APL_COLORS.cardBg,
        borderRadius: '20dp',
        padding: '20dp',
        borderWidth: '2dp',
        borderColor: APL_COLORS.orangeBorder,
        justifyContent: 'space-between',
        items: [
          {
            type: 'Container',
            items: [
              {
                type: 'Text',
                text: badge,
                color: APL_COLORS.orangeAccent,
                fontSize: '12dp',
                fontWeight: '800',
                letterSpacing: '1dp',
                marginBottom: '6dp',
              },
              {
                type: 'Text',
                text: title,
                style: 'textTitle',
                fontSize: '26dp',
              },
              {
                type: 'Text',
                text: subtitle,
                color: APL_COLORS.orangeAccent,
                fontSize: '16dp',
                fontWeight: '700',
                marginTop: '6dp',
              },
              {
                type: 'Text',
                text: description,
                color: APL_COLORS.textBody,
                fontSize: '13dp',
                lineHeight: '18dp',
                marginTop: '8dp',
                maxLines: 3,
              },
            ],
          },
          {
            type: 'Container',
            backgroundColor: APL_COLORS.orangeBtn,
            borderRadius: '10dp',
            padding: '10dp',
            alignItems: 'center',
            width: '100%',
            items: [
              {
                type: 'Text',
                text: buttonText,
                color: APL_COLORS.white,
                fontWeight: '700',
                fontSize: '13dp',
              },
            ],
          },
        ],
      },
    ],
  };
}

function createRoundMealRow({
  iconTitle,
  subtitle,
  mealCode,
  isLast = false,
}: {
  iconTitle: string;
  subtitle: string;
  mealCode: 'breakfast' | 'lunch' | 'both';
  isLast?: boolean;
}): any {
  return {
    type: 'TouchWrapper',
    width: '100%',
    height: '62dp',
    marginBottom: isLast ? '0dp' : '8dp',
    onPress: [
      {
        type: 'SendEvent',
        arguments: ['selectMeal', mealCode],
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
        direction: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: APL_COLORS.cardBg,
        borderRadius: '16dp',
        borderWidth: '1.5dp',
        borderColor: APL_COLORS.orangeBorder,
        paddingLeft: '16dp',
        paddingRight: '16dp',
        items: [
          {
            type: 'Container',
            direction: 'column',
            justifyContent: 'center',
            items: [
              {
                type: 'Text',
                text: iconTitle,
                color: APL_COLORS.textTitle,
                fontSize: '17dp',
                fontWeight: '700',
              },
              {
                type: 'Text',
                text: subtitle,
                color: APL_COLORS.orangeAccent,
                fontSize: '11dp',
                fontWeight: '600',
                marginTop: '2dp',
              },
            ],
          },
          {
            type: 'Text',
            text: '›',
            color: APL_COLORS.orangeAccent,
            fontSize: '24dp',
            fontWeight: '700',
          },
        ],
      },
    ],
  };
}

/**
 * Page 2: Step 2 Meal Type Selection Screen.
 */
export function createStep2MealScreen(): any {
  return {
    type: 'Container',
    width: '100%',
    height: '100%',
    items: [
      // 1. ROUND / CIRCULAR HUB VIEWPORT (Echo Spot)
      {
        type: 'Container',
        when: "${viewport.shape == 'round' || @viewportProfile == '@hubRound'}",
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: '24dp',
        paddingRight: '24dp',
        paddingTop: '20dp',
        paddingBottom: '20dp',
        items: [
          {
            type: 'Text',
            text: 'SELECT MEAL',
            color: APL_COLORS.orangeAccent,
            fontSize: '14dp',
            fontWeight: '800',
            letterSpacing: '1dp',
            textAlign: 'center',
            marginBottom: '12dp',
          },
          {
            type: 'Container',
            width: '100%',
            direction: 'column',
            items: [
              createRoundMealRow({
                iconTitle: '🥞 Breakfast',
                subtitle: 'Morning Entrées & Juices',
                mealCode: 'breakfast',
              }),
              createRoundMealRow({
                iconTitle: '🍱 Lunch',
                subtitle: 'Hot Entrées & Sides',
                mealCode: 'lunch',
              }),
              createRoundMealRow({
                iconTitle: '🌟 Both Meals',
                subtitle: 'Full Day Menu Breakdown',
                mealCode: 'both',
                isLast: true,
              }),
            ],
          },
        ],
      },

      // 2. RECTANGULAR / LANDSCAPE VIEWPORT
      {
        type: 'Container',
        when: "${viewport.shape != 'round' && @viewportProfile != '@hubRound'}",
        width: '100%',
        height: '100%',
        paddingLeft: '24dp',
        paddingRight: '24dp',
        paddingTop: '16dp',
        paddingBottom: '16dp',
        direction: 'column',
        justifyContent: 'space-between',
        items: [
          createHeaderBar({
            titleText: "${payload.wizardData.selectedLevelName || 'Verona Schools'}",
            badgeText: 'STEP 2 OF 3 • SELECT MEAL TYPE',
          }),

          {
            type: 'Container',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            justifyContent: 'space-between',
            marginTop: '12dp',
            marginBottom: '10dp',
            items: [
              createLandscapeMealCard({
                badge: 'MORNING FUEL',
                title: '🥞 Breakfast',
                subtitle: 'Hot Breakfast & Fruits',
                description: 'Featured daily pastries, whole grains, 100% fruit juices, and milk.',
                buttonText: 'Choose Breakfast →',
                mealCode: 'breakfast',
              }),
              createLandscapeMealCard({
                badge: 'POPULAR CHOICE',
                title: '🍱 Lunch',
                subtitle: 'Hot Entrées & Sides',
                description: 'Main rotating course, daily vegetarian alternates, side veggies & fresh fruit.',
                buttonText: 'Choose Lunch →',
                mealCode: 'lunch',
              }),
              createLandscapeMealCard({
                badge: 'ALL-DAY SUMMARY',
                title: '🌟 Both Meals',
                subtitle: 'Breakfast + Lunch',
                description: 'See the complete breakfast and lunch selections for your student.',
                buttonText: 'Choose Both →',
                mealCode: 'both',
              }),
            ],
          },

          createHintBar("💡 Or say: 'Breakfast', 'Lunch', or 'Both'"),
        ],
      },
    ],
  };
}
