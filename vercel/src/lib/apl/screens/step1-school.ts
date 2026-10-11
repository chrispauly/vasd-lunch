import { APL_COLORS } from '../styles';
import { createHeaderBar } from '../components/header-bar';
import { createHintBar } from '../components/hint-bar';

/**
 * Creates the big clickable box card used on rectangular landscape screens.
 */
function createLandscapeSchoolCard({
  gradeBadge,
  title,
  description,
  buttonText,
  levelCode,
  isFirst = false,
}: {
  gradeBadge: string;
  title: string;
  description: string;
  buttonText: string;
  levelCode: 'ES' | 'MS' | 'HS';
  isFirst?: boolean;
}): any {
  return {
    type: 'TouchWrapper',
    grow: 1,
    shrink: 1,
    height: '100%',
    spacing: isFirst ? undefined : '16dp',
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
                text: gradeBadge,
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
                text: description,
                color: APL_COLORS.textBody,
                fontSize: '13dp',
                lineHeight: '18dp',
                marginTop: '8dp',
                maxLines: 4,
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

/**
 * Creates a touchable row item for circular hub displays (Echo Spot).
 */
function createRoundSchoolRow({
  iconTitle,
  gradeText,
  levelCode,
  isLast = false,
}: {
  iconTitle: string;
  gradeText: string;
  levelCode: 'ES' | 'MS' | 'HS';
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
                text: gradeText,
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
            marginBottom: '12dp',
          },
          {
            type: 'Container',
            width: '100%',
            direction: 'column',
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
              }),
              createRoundSchoolRow({
                iconTitle: '🎓 High School',
                gradeText: 'Grades 9-12',
                levelCode: 'HS',
                isLast: true,
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
        justifyContent: 'space-between',
        items: [
          // Header Bar
          createHeaderBar({
            titleText: 'Verona Area School District',
            badgeText: 'STEP 1 OF 3 • SELECT SCHOOL',
          }),

          // Middle Content: 3 Big Clickable Boxes
          {
            type: 'Container',
            direction: 'row',
            width: '100%',
            grow: 1,
            shrink: 1,
            marginTop: '12dp',
            marginBottom: '10dp',
            items: [
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES K-5',
                title: 'Elementary',
                description:
                  'Sugar Creek • Stoner Prairie • Glacier Edge • Country View • VAIS',
                buttonText: 'Select Elementary →',
                levelCode: 'ES',
                isFirst: true,
              }),
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES 6-8',
                title: 'Middle School',
                description:
                  'Badger Ridge Middle School • Core Knowledge Charter School (CKCS)',
                buttonText: 'Select Middle School →',
                levelCode: 'MS',
              }),
              createLandscapeSchoolCard({
                gradeBadge: 'GRADES 9-12',
                title: 'High School',
                description: 'Verona Area High School (VAHS)',
                buttonText: 'Select High School →',
                levelCode: 'HS',
              }),
            ],
          },

          // Bottom Hint Bar
          createHintBar("💡 Or say: 'Elementary', 'Middle School', or 'High School'"),
        ],
      },
    ],
  };
}
