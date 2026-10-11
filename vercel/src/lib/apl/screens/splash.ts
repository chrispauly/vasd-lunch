import { APL_COLORS, VASD_PAW_LOGO } from '../styles';

/**
 * Page 0: Splash Screen & District Brand Launcher.
 * Features automatic onMount timer (1.3s) and full-screen touch wrapper.
 */
export function createSplashScreen(): any {
  return {
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
        backgroundColor: APL_COLORS.bgDark,
        paddingLeft: '24dp',
        paddingRight: '24dp',
        items: [
          {
            type: 'Image',
            source: '${payload.wizardData.logoUrl}',
            fallbackSource: VASD_PAW_LOGO,
            width: '130dp',
            height: '130dp',
          },
          {
            type: 'Text',
            text: 'Verona Area School District',
            style: 'textTitle',
            fontSize: '32dp',
            textAlign: 'center',
            spacing: '20dp',
          },
          {
            type: 'Text',
            text: 'Daily School Menus • Breakfast & Lunch',
            color: APL_COLORS.orangeAccent,
            fontSize: '18dp',
            fontWeight: '700',
            spacing: '8dp',
            textAlign: 'center',
          },
          {
            type: 'Container',
            spacing: '24dp',
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
  };
}
