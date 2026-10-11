import { VASD_PAW_LOGO } from './styles';

/**
 * Returns responsive APL Document for Weekly Menus.
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
          type: 'Frame',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#090D16',
          padding: '24dp',
          item: {
            type: 'Container',
            width: '100%',
            height: '100%',
            direction: 'column',
            items: [
              // Header
              {
                type: 'Container',
                direction: 'row',
                justifyContent: 'spaceBetween',
                alignItems: 'center',
                height: '48dp',
                shrink: 0,
                items: [
                  {
                    type: 'Container',
                    direction: 'row',
                    alignItems: 'center',
                    items: [
                      {
                        type: 'Image',
                        source: `\${payload.weeklyData.logoUrl || '${VASD_PAW_LOGO}'}`,
                        width: "${viewport.width >= 1600 ? '42dp' : (viewport.width >= 1100 ? '36dp' : '32dp')}",
                        height: "${viewport.width >= 1600 ? '42dp' : (viewport.width >= 1100 ? '36dp' : '32dp')}",
                      },
                      {
                        type: 'Text',
                        text: 'Verona Area School District — Weekly Forecast',
                        style: 'textTitle',
                        fontSize: "${viewport.width >= 1600 ? '24dp' : (viewport.width >= 1100 ? '20dp' : '18dp')}",
                        spacing: '12dp',
                      },
                    ],
                  },
                  {
                    type: 'Text',
                    text: '${payload.weeklyData.schoolLevel} • ${payload.weeklyData.weekLabel}',
                    color: '#F97316',
                    fontWeight: '700',
                    fontSize: "${viewport.width >= 1600 ? '20dp' : (viewport.width >= 1100 ? '17dp' : '14dp')}",
                  },
                ],
              },

              // 5-Day Sequence
              {
                type: 'Sequence',
                scrollDirection: 'horizontal',
                width: '100%',
                grow: 1,
                shrink: 1,
                spacing: "${viewport.width >= 1600 ? '18dp' : (viewport.width >= 1100 ? '14dp' : '10dp')}",
                data: '${payload.weeklyData.days}',
                items: [
                  {
                    type: 'TouchWrapper',
                    width: "${viewport.width >= 1600 ? '330dp' : (viewport.width >= 1100 ? '280dp' : '230dp')}",
                    height: '100%',
                    spacing: '16dp',
                    items: [
                      {
                        type: 'Frame',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1E293B',
                        borderRadius: "${viewport.width >= 1600 ? '22dp' : '18dp'}",
                        padding: "${viewport.width >= 1600 ? '18dp' : (viewport.width >= 1100 ? '14dp' : '12dp')}",
                        item: {
                          type: 'Container',
                          width: '100%',
                          height: '100%',
                          justifyContent: 'spaceBetween',
                          items: [
                            {
                              type: 'Container',
                              items: [
                                {
                                  type: 'Text',
                                  text: '${data.dayOfWeek}',
                                  color: '#F97316',
                                  fontSize: "${viewport.width >= 1600 ? '18dp' : (viewport.width >= 1100 ? '16dp' : '14dp')}",
                                  fontWeight: '800',
                                },
                                {
                                  type: 'Text',
                                  text: '${data.dateText}',
                                  color: '#94A3B8',
                                  fontSize: "${viewport.width >= 1600 ? '14dp' : (viewport.width >= 1100 ? '13dp' : '11.5dp')}",
                                  spacing: '2dp',
                                },
                              ],
                            },
                            {
                              type: 'Image',
                              source: `\${data.imageUrl || '${VASD_PAW_LOGO}'}`,
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
                                  fontSize: "${viewport.width >= 1600 ? '18dp' : (viewport.width >= 1100 ? '16dp' : '14dp')}",
                                  maxLines: 2,
                                },
                                {
                                  type: 'Text',
                                  when: '${data.secondaryText != ""}',
                                  text: '${data.secondaryText}',
                                  color: '#64748B',
                                  fontSize: "${viewport.width >= 1600 ? '13.5dp' : (viewport.width >= 1100 ? '12dp' : '11dp')}",
                                  maxLines: 1,
                                  spacing: '2dp',
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  };
}
