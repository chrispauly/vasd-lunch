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
          type: 'Container',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#090D16',
          padding: '24dp',
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
                      source: '${payload.weeklyData.logoUrl}',
                      fallbackSource: VASD_PAW_LOGO,
                      width: '36dp',
                      height: '36dp',
                    },
                    {
                      type: 'Text',
                      text: 'Verona Area School District — Weekly Forecast',
                      style: 'textTitle',
                      fontSize: '20dp',
                      spacing: '12dp',
                    },
                  ],
                },
                {
                  type: 'Text',
                  text: '${payload.weeklyData.schoolLevel} • ${payload.weeklyData.weekLabel}',
                  color: '#F97316',
                  fontWeight: '700',
                  fontSize: '15dp',
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
              spacing: '14dp',
              data: '${payload.weeklyData.days}',
              items: [
                {
                  type: 'TouchWrapper',
                  width: '260dp',
                  height: '100%',
                  spacing: '16dp',
                  items: [
                    {
                      type: 'Container',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1E293B',
                      borderRadius: '18dp',
                      padding: '14dp',
                      justifyContent: 'spaceBetween',
                      items: [
                        {
                          type: 'Container',
                          items: [
                            {
                              type: 'Text',
                              text: '${data.dayOfWeek}',
                              color: '#F97316',
                              fontSize: '15dp',
                              fontWeight: '800',
                            },
                            {
                              type: 'Text',
                              text: '${data.dateText}',
                              color: '#94A3B8',
                              fontSize: '12dp',
                              spacing: '2dp',
                            },
                          ],
                        },
                        {
                          type: 'Image',
                          source: '${data.imageUrl}',
                          fallbackSource: VASD_PAW_LOGO,
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
                              fontSize: '16dp',
                              maxLines: 2,
                            },
                            {
                              type: 'Text',
                              when: '${data.secondaryText != ""}',
                              text: '${data.secondaryText}',
                              color: '#64748B',
                              fontSize: '11dp',
                              maxLines: 1,
                              spacing: '2dp',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}
