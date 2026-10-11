import { APL_COLORS, VASD_PAW_LOGO } from '../styles';

export interface HeaderBarOptions {
  titleText: string;
  badgeText: string;
  logoUrlBinding?: string;
}

/**
 * Reusable HeaderBar component for APL wizard screens.
 * Clean, fixed-height flex container with paw logo, district/level title, and step badge.
 */
export function createHeaderBar({
  titleText,
  badgeText,
  logoUrlBinding = '${payload.wizardData.logoUrl}',
}: HeaderBarOptions): any {
  return {
    type: 'Container',
    direction: 'row',
    justifyContent: 'spaceBetween',
    alignItems: 'center',
    height: "${viewport.width >= 1600 ? '58dp' : (viewport.width >= 1100 ? '50dp' : '44dp')}",
    width: '100%',
    shrink: 0,
    items: [
      {
        type: 'Container',
        direction: 'row',
        alignItems: 'center',
        items: [
          {
            type: 'Image',
            source: logoUrlBinding.includes('||') ? logoUrlBinding : `\${${logoUrlBinding.replace(/^\$\{/, '').replace(/\}$/, '')} || '${VASD_PAW_LOGO}'}`,
            width: "${viewport.width >= 1600 ? '40dp' : (viewport.width >= 1100 ? '34dp' : '28dp')}",
            height: "${viewport.width >= 1600 ? '40dp' : (viewport.width >= 1100 ? '34dp' : '28dp')}",
          },
          {
            type: 'Text',
            text: titleText,
            style: 'textTitle',
            fontSize: "${viewport.width >= 1600 ? '24dp' : (viewport.width >= 1100 ? '20dp' : '17dp')}",
            spacing: "${viewport.width >= 1600 ? '14dp' : '10dp'}",
          },
        ],
      },
      {
        type: 'Frame',
        backgroundColor: APL_COLORS.orangePillBg,
        borderRadius: "${viewport.width >= 1600 ? '12dp' : '10dp'}",
        paddingLeft: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '14dp' : '10dp')}",
        paddingRight: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '14dp' : '10dp')}",
        paddingTop: "${viewport.width >= 1600 ? '8dp' : (viewport.width >= 1100 ? '6dp' : '5dp')}",
        paddingBottom: "${viewport.width >= 1600 ? '8dp' : (viewport.width >= 1100 ? '6dp' : '5dp')}",
        item: {
          type: 'Text',
          text: badgeText,
          color: APL_COLORS.orangeAccent,
          fontSize: "${viewport.width >= 1600 ? '14dp' : (viewport.width >= 1100 ? '12.5dp' : '11dp')}",
          fontWeight: '800',
          letterSpacing: '1dp',
        },
      },
    ],
  };
}
