import { APL_COLORS } from '../styles';
import { createHeaderBar } from '../components/header-bar';
import { createHintBar } from '../components/hint-bar';

function createLandscapeDateCard({
  badge,
  title,
  subtitle,
  description,
  buttonText,
  dateCode,
}: {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  dateCode: 'today' | 'tomorrow' | 'week';
}): any {
  return {
    type: 'TouchWrapper',
    width: '32%',
    height: '100%',
    shrink: 0,
    onPress: [
      {
        type: 'SendEvent',
        arguments: ['selectDate', dateCode],
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
        justifyContent: 'spaceBetween',
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
              },
              {
                type: 'Text',
                text: title,
                style: 'textTitle',
                fontSize: '26dp',
                spacing: '6dp',
              },
              {
                type: 'Text',
                text: subtitle,
                color: APL_COLORS.orangeAccent,
                fontSize: '16dp',
                fontWeight: '700',
                spacing: '6dp',
              },
              {
                type: 'Text',
                text: description,
                color: APL_COLORS.textBody,
                fontSize: '13dp',
                lineHeight: '18dp',
                spacing: '8dp',
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

function createRoundDateRow({
  iconTitle,
  subtitle,
  dateCode,
  spacing,
}: {
  iconTitle: string;
  subtitle: string;
  dateCode: 'today' | 'tomorrow' | 'week';
  spacing?: string;
}): any {
  return {
    type: 'TouchWrapper',
    width: '100%',
    height: '62dp',
    ...(spacing ? { spacing } : {}),
    onPress: [
      {
        type: 'SendEvent',
        arguments: ['selectDate', dateCode],
      },
    ],
    items: [
      {
        type: 'Container',
        width: '100%',
        height: '100%',
        direction: 'row',
        alignItems: 'center',
        justifyContent: 'spaceBetween',
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
                spacing: '2dp',
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
 * Page 3: Step 3 Date Selection Screen.
 */
export function createStep3DateScreen(): any {
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
            text: 'CHOOSE DATE',
            color: APL_COLORS.orangeAccent,
            fontSize: '14dp',
            fontWeight: '800',
            letterSpacing: '1dp',
            textAlign: 'center',
          },
          {
            type: 'Container',
            width: '100%',
            direction: 'column',
            spacing: '12dp',
            items: [
              createRoundDateRow({
                iconTitle: '📅 Today',
                subtitle: '${payload.wizardData.todayDateText}',
                dateCode: 'today',
              }),
              createRoundDateRow({
                iconTitle: '🌅 Tomorrow',
                subtitle: '${payload.wizardData.tomorrowDateText}',
                dateCode: 'tomorrow',
                spacing: '8dp',
              }),
              createRoundDateRow({
                iconTitle: '📆 Next Week',
                subtitle: '5-Day Monday–Friday Outlook',
                dateCode: 'week',
                spacing: '8dp',
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
        justifyContent: 'spaceBetween',
        items: [
          createHeaderBar({
            titleText:
              "${payload.wizardData.selectedLevelName || 'Verona Schools'} • ${payload.wizardData.selectedMealTitle || 'Menu'}",
            badgeText: 'STEP 3 OF 3 • CHOOSE DATE',
          }),

          {
            type: 'Container',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            justifyContent: 'spaceBetween',
            spacing: '12dp',
            items: [
              createLandscapeDateCard({
                badge: "TODAY'S MENU",
                title: '📅 Today',
                subtitle: '${payload.wizardData.todayDateText}',
                description: 'Instant overview of meals, fresh sides, fruits, and milks served today.',
                buttonText: 'Show Today →',
                dateCode: 'today',
              }),
              createLandscapeDateCard({
                badge: 'NEXT SCHOOL DAY',
                title: '🌅 Tomorrow',
                subtitle: '${payload.wizardData.tomorrowDateText}',
                description: 'Plan ahead with tomorrow’s scheduled hot lunch, breakfast, and sides.',
                buttonText: 'Show Tomorrow →',
                dateCode: 'tomorrow',
              }),
              createLandscapeDateCard({
                badge: '5-DAY OUTLOOK',
                title: '📆 Next Week',
                subtitle: 'Mon – Fri Forecast',
                description: 'Explore next week’s full weekly meal rotation from Monday to Friday.',
                buttonText: 'Show Next Week →',
                dateCode: 'week',
              }),
            ],
          },

          createHintBar("💡 Or say: 'Today', 'Tomorrow', or 'Next Week'", '10dp'),
        ],
      },
    ],
  };
}
