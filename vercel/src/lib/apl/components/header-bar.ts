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
    height: '48dp',
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
            width: '32dp',
            height: '32dp',
          },
          {
            type: 'Text',
            text: titleText,
            style: 'textTitle',
            fontSize: '18dp',
            spacing: '10dp',
          },
        ],
      },
      {
        type: 'Frame',
        backgroundColor: APL_COLORS.orangePillBg,
        borderRadius: '10dp',
        paddingLeft: '12dp',
        paddingRight: '12dp',
        paddingTop: '6dp',
        paddingBottom: '6dp',
        item: {
          type: 'Text',
          text: badgeText,
          color: APL_COLORS.orangeAccent,
          fontSize: '12dp',
          fontWeight: '800',
          letterSpacing: '1dp',
        },
      },
    ],
  };
}
