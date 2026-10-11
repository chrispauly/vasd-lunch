import { APL_COLORS } from '../styles';

/**
 * Reusable footer hint bar displaying helpful voice commands and guidance.
 */
export function createHintBar(hintText: string, spacing?: string): any {
  return {
    type: 'Container',
    direction: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: "${viewport.width >= 1600 ? '36dp' : (viewport.width >= 1100 ? '30dp' : '26dp')}",
    width: '100%',
    shrink: 0,
    ...(spacing ? { spacing } : {}),
    items: [
      {
        type: 'Text',
        text: hintText,
        color: APL_COLORS.textMuted,
        fontSize: "${viewport.width >= 1600 ? '16dp' : (viewport.width >= 1100 ? '13.5dp' : '12dp')}",
      },
    ],
  };
}
