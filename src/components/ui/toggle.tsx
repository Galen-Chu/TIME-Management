/**
 * 開關 Toggle(DESIGN-SPEC):
 * 44×26 軌道(開 success/關 trackAlt);22px 白色圓鈕(開 left 20/關 left 2)。
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { color } from '../../theme';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityLabel?: string;
}

export function Toggle({ value, onChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!value)}
      style={[styles.track, value && styles.trackOn]}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: color.trackAlt,
    padding: 2,
  },
  trackOn: {
    backgroundColor: color.success,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  knobOn: {
    transform: [{ translateX: 18 }],
  },
});
