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
  width = '32%',
}: {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  dateCode: 'today' | 'tomorrow' | 'week' | 'nextSchoolDay';
  width?: string;
}): any {
  return {
    type: 'TouchWrapper',
    width,
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
        type: 'Frame',
        width: '100%',
        height: '100%',
        backgroundColor: APL_COLORS.cardBg,
        borderRadius: "${viewport.width >= 1600 ? '24dp' : '20dp'}",
        borderWidth: '2dp',
        borderColor: APL_COLORS.orangeBorder,
        paddingLeft: "${viewport.width >= 1600 ? '28dp' : (viewport.width >= 1100 ? '20dp' : '14dp')}",
        paddingRight: "${viewport.width >= 1600 ? '28dp' : (viewport.width >= 1100 ? '20dp' : '14dp')}",
        paddingTop: "${viewport.width >= 1600 ? '26dp' : (viewport.width >= 1100 ? '18dp' : '14dp')}",
        paddingBottom: "${viewport.width >= 1600 ? '26dp' : (viewport.width >= 1100 ? '18dp' : '14dp')}",
        item: {
          type: 'Container',
          width: '100%',
          height: '100%',
          direction: 'column',
          justifyContent: 'spaceBetween',
          items: [
            {
              type: 'Container',
              items: [
                {
                  type: 'Text',
                  text: badge,
                  color: APL_COLORS.orangeAccent,
                  fontSize: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '13.5dp' : '11dp')}",
                  fontWeight: '800',
                  letterSpacing: "${viewport.width >= 1600 ? '1.5dp' : '1dp'}",
                },
                {
                  type: 'Text',
                  text: title,
                  style: 'textTitle',
                  fontSize: "${viewport.width >= 1600 ? '38dp' : (viewport.width >= 1100 ? '28dp' : '22dp')}",
                  spacing: "${viewport.width >= 1600 ? '8dp' : '4dp'}",
                },
                {
                  type: 'Text',
                  text: subtitle,
                  color: APL_COLORS.orangeAccent,
                  fontSize: "${viewport.width >= 1600 ? '22dp' : (viewport.width >= 1100 ? '18dp' : '15dp')}",
                  fontWeight: '700',
                  spacing: "${viewport.width >= 1600 ? '8dp' : '4dp'}",
                },
                {
                  type: 'Text',
                  text: description,
                  color: APL_COLORS.textBody,
                  fontSize: "${viewport.width >= 1600 ? '17dp' : (viewport.width >= 1100 ? '14.5dp' : '12dp')}",
                  spacing: "${viewport.width >= 1600 ? '12dp' : '8dp'}",
                  maxLines: 3,
                },
              ],
            },
            {
              type: 'Frame',
              backgroundColor: APL_COLORS.orangeBtn,
              borderRadius: "${viewport.width >= 1600 ? '14dp' : '10dp'}",
              paddingTop: "${viewport.width >= 1600 ? '13dp' : (viewport.width >= 1100 ? '10dp' : '8dp')}",
              paddingBottom: "${viewport.width >= 1600 ? '13dp' : (viewport.width >= 1100 ? '10dp' : '8dp')}",
              paddingLeft: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '13dp' : '10dp')}",
              paddingRight: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '13dp' : '10dp')}",
              width: '100%',
              item: {
                type: 'Text',
                text: buttonText,
                color: APL_COLORS.white,
                fontWeight: '700',
                fontSize: "${viewport.width >= 1600 ? '18dp' : (viewport.width >= 1100 ? '15dp' : '13dp')}",
                textAlign: 'center',
              },
            },
          ],
        },
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
  dateCode: 'today' | 'tomorrow' | 'week' | 'nextSchoolDay';
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
        type: 'Frame',
        width: '100%',
        height: '100%',
        backgroundColor: APL_COLORS.cardBg,
        borderRadius: '16dp',
        borderWidth: '1.5dp',
        borderColor: APL_COLORS.orangeBorder,
        paddingLeft: '16dp',
        paddingRight: '16dp',
        item: {
          type: 'Container',
          width: '100%',
          height: '100%',
          direction: 'row',
          alignItems: 'center',
          justifyContent: 'spaceBetween',
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
          // Round container on weekends (2 rows)
          {
            type: 'Container',
            when: '${payload.wizardData.isWeekend}',
            width: '100%',
            direction: 'column',
            spacing: '12dp',
            items: [
              createRoundDateRow({
                iconTitle: '🎒 Next School Day',
                subtitle: '${payload.wizardData.nextSchoolDayDateText}',
                dateCode: 'nextSchoolDay',
              }),
              createRoundDateRow({
                iconTitle: '🗓️ Week’s Menu',
                subtitle: '${payload.wizardData.weekDateText}',
                dateCode: 'week',
                spacing: '8dp',
              }),
            ],
          },
          // Round container on weekdays (3 rows)
          {
            type: 'Container',
            when: '${!payload.wizardData.isWeekend}',
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
        paddingLeft: "${viewport.width >= 1600 ? '36dp' : (viewport.width >= 1100 ? '28dp' : '20dp')}",
        paddingRight: "${viewport.width >= 1600 ? '36dp' : (viewport.width >= 1100 ? '28dp' : '20dp')}",
        paddingTop: "${viewport.width >= 1600 ? '24dp' : (viewport.width >= 1100 ? '18dp' : '14dp')}",
        paddingBottom: "${viewport.width >= 1600 ? '20dp' : (viewport.width >= 1100 ? '16dp' : '12dp')}",
        direction: 'column',
        justifyContent: 'spaceBetween',
        items: [
          createHeaderBar({
            titleText:
              "${payload.wizardData.selectedLevelName || 'Verona Schools'} • ${payload.wizardData.selectedMealTitle || 'Menu'}",
            badgeText: 'STEP 3 OF 3 • CHOOSE DATE',
          }),

          // Weekend layout: 2 cards at 48.5% width
          {
            type: 'Container',
            when: '${payload.wizardData.isWeekend}',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            justifyContent: 'spaceBetween',
            spacing: "${viewport.width >= 1600 ? '20dp' : (viewport.width >= 1100 ? '16dp' : '12dp')}",
            items: [
              createLandscapeDateCard({
                badge: 'NEXT SCHOOL DAY',
                title: '🎒 Next School Day',
                subtitle: '${payload.wizardData.nextSchoolDayDateText}',
                description: 'Explore meals, fresh sides, fruits, and milks served on the upcoming school day.',
                buttonText: 'Show Next School Day →',
                dateCode: 'nextSchoolDay',
                width: '48.5%',
              }),
              createLandscapeDateCard({
                badge: "WEEK'S MENU",
                title: '🗓️ Week’s Menu',
                subtitle: '${payload.wizardData.weekDateText}',
                description: 'Plan ahead with the full 5-day Monday to Friday meal schedule for the week.',
                buttonText: 'Show Week’s Menu →',
                dateCode: 'week',
                width: '48.5%',
              }),
            ],
          },

          // Weekday layout: 3 cards at 32% width
          {
            type: 'Container',
            when: '${!payload.wizardData.isWeekend}',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            justifyContent: 'spaceBetween',
            spacing: "${viewport.width >= 1600 ? '20dp' : (viewport.width >= 1100 ? '16dp' : '12dp')}",
            items: [
              createLandscapeDateCard({
                badge: "TODAY'S MENU",
                title: '📅 Today',
                subtitle: '${payload.wizardData.todayDateText}',
                description: 'Instant overview of meals, fresh sides, fruits, and milks served today.',
                buttonText: 'Show Today →',
                dateCode: 'today',
                width: '32%',
              }),
              createLandscapeDateCard({
                badge: 'NEXT SCHOOL DAY',
                title: '🌅 Tomorrow',
                subtitle: '${payload.wizardData.tomorrowDateText}',
                description: 'Plan ahead with tomorrow’s scheduled hot lunch, breakfast, and sides.',
                buttonText: 'Show Tomorrow →',
                dateCode: 'tomorrow',
                width: '32%',
              }),
              createLandscapeDateCard({
                badge: '5-DAY OUTLOOK',
                title: '📆 Next Week',
                subtitle: 'Mon – Fri Forecast',
                description: 'Explore next week’s full weekly meal rotation from Monday to Friday.',
                buttonText: 'Show Next Week →',
                dateCode: 'week',
                width: '32%',
              }),
            ],
          },

          createHintBar(
            "${payload.wizardData.isWeekend ? \"💡 Or say: 'Next School Day' or 'This Week'\" : \"💡 Or say: 'Today', 'Tomorrow', or 'Next Week'\"}",
            '10dp'
          ),
        ],
      },
    ],
  };
}
