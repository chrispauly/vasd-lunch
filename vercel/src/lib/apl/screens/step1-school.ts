import { APL_COLORS } from '../styles';
import { createHeaderBar } from '../components/header-bar';
import { createHintBar } from '../components/hint-bar';

/**
 * Creates the big clickable box card used on rectangular landscape screens.
 */
function createLandscapeSchoolCard({
  gradeBadge,
  title,
  schools,
  buttonText,
  levelCode,
}: {
  gradeBadge: string;
  title: string;
  schools: string[];
  buttonText: string;
  levelCode: 'ES' | 'MS' | 'HS';
}): any {
  return {
    type: 'TouchWrapper',
    width: '32%',
    height: '100%',
    shrink: 0,
    onPress: [
      {
        type: 'SendEvent',
        arguments: ['selectLevel', levelCode],
      },
      {
        type: 'SetPage',
        componentId: 'wizardPager',
        value: 2,
      },
    ],
    items: [
      {
        type: 'Frame',
        width: '100%',
        height: '100%',
        backgroundColor: APL_COLORS.cardBg,
        borderRadius: '20dp',
        borderWidth: '2dp',
        borderColor: APL_COLORS.orangeBorder,
        paddingLeft: '16dp',
        paddingRight: '16dp',
        paddingTop: '16dp',
        paddingBottom: '16dp',
        item: {
          type: 'Container',
          width: '100%',
          height: '100%',
          direction: 'column',
          justifyContent: 'spaceBetween',
          items: [
            // Top: Grade Badge & Title
            {
              type: 'Container',
              shrink: 0,
              items: [
                {
                  type: 'Text',
                  text: gradeBadge,
                  color: APL_COLORS.orangeAccent,
                  fontSize: '11dp',
                  fontWeight: '800',
                  letterSpacing: '1dp',
                },
                {
                  type: 'Text',
                  text: title,
                  style: 'textTitle',
                  fontSize: '24dp',
                  spacing: '4dp',
                },
              ],
            },

            // Bottom Area: School List directly above Action Button
            {
              type: 'Container',
              direction: 'column',
              width: '100%',
              shrink: 0,
              items: [
                // School List: tightly grouped together without extra spacing
                {
                  type: 'Container',
                  direction: 'column',
                  width: '100%',
                  items: schools.map((school) => ({
                    type: 'Text',
                    text: school,
                    color: '#CBD5E1',
                    fontSize: '12.5dp',
                    fontWeight: '500',
                  })),
                },

                // Action Button
                {
                  type: 'Frame',
                  spacing: '14dp',
                  backgroundColor: APL_COLORS.orangeBtn,
                  borderRadius: '10dp',
                  paddingTop: '9dp',
                  paddingBottom: '9dp',
                  paddingLeft: '12dp',
                  paddingRight: '12dp',
                  width: '100%',
                  item: {
                    type: 'Text',
                    text: buttonText,
                    color: APL_COLORS.white,
                    fontWeight: '700',
                    fontSize: '13dp',
                    textAlign: 'center',
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

/**
 * Creates a touchable row item for circular hub displays (Echo Spot).
 */
function createRoundSchoolRow({
  iconTitle,
  gradeText,
  levelCode,
  spacing,
}: {
  iconTitle: string;
  gradeText: string;
  levelCode: 'ES' | 'MS' | 'HS';
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
        arguments: ['selectLevel', levelCode],
      },
      {
        type: 'SetPage',
        componentId: 'wizardPager',
        value: 2,
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
                  text: gradeText,
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
 * Page 1: Step 1 School Level Selection Screen.
 * Automatically adapts between:
 *  - Echo Spot (Round Hub): Vertical text list of big touch targets
 *  - Echo Show (Landscape Hubs): 3 large clickable card boxes in the middle
 */
export function createStep1SchoolScreen(): any {
  return {
    type: 'Container',
    width: '100%',
    height: '100%',
    items: [
      // =========================================================================
      // 1. ROUND / CIRCULAR HUB VIEWPORT (Echo Spot, @hubRound)
      // =========================================================================
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
            text: 'SELECT SCHOOL',
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
              createRoundSchoolRow({
                iconTitle: '🏫 Elementary',
                gradeText: 'Grades K-5',
                levelCode: 'ES',
              }),
              createRoundSchoolRow({
                iconTitle: '🎒 Middle School',
                gradeText: 'Grades 6-8',
                levelCode: 'MS',
                spacing: '8dp',
              }),
              createRoundSchoolRow({
                iconTitle: '🎓 High School',
                gradeText: 'Grades 9-12',
                levelCode: 'HS',
                spacing: '8dp',
              }),
            ],
          },
        ],
      },

      // =========================================================================
      // 2. RECTANGULAR / LANDSCAPE VIEWPORT (Echo Show 5, 8, 10, 15 & Fire TV)
      // =========================================================================
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
          // Header Bar
          createHeaderBar({
            titleText: 'Verona Area School District',
            badgeText: 'STEP 1 OF 3 • SELECT SCHOOL',
          }),

          // Middle Content: 3 Big Clickable Boxes (each taking 1/3 screen width with spaceBetween)
          {
            type: 'Container',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            justifyContent: 'spaceBetween',
            spacing: '12dp',
            items: [
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES K-5',
                title: 'Elementary',
                schools: [
                  'Sugar Creek',
                  'Stoner Prairie',
                  'Glacier Edge',
                  'Country View',
                  'VAIS',
                  'Core Knowledge (CKCS)',
                ],
                buttonText: 'Select Elementary →',
                levelCode: 'ES',
              }),
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES 6-8',
                title: 'Middle School',
                schools: [
                  'Badger Ridge Middle School',
                  'Core Knowledge (CKCS)',
                ],
                buttonText: 'Select Middle School →',
                levelCode: 'MS',
              }),
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES 9-12',
                title: 'High School',
                schools: [
                  'Verona Area High School (VAHS)',
                ],
                buttonText: 'Select High School →',
                levelCode: 'HS',
              }),
            ],
          },

          // Bottom Hint Bar
          createHintBar("💡 Or say: 'Elementary', 'Middle School', or 'High School'", '10dp'),
        ],
      },
    ],
  };
}
