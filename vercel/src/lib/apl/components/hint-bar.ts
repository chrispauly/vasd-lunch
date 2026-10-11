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
    height: '28dp',
    width: '100%',
    shrink: 0,
    ...(spacing ? { spacing } : {}),
    items: [
      {
        type: 'Text',
        text: hintText,
        color: APL_COLORS.textMuted,
        fontSize: '12dp',
      },
    ],
  };
}
